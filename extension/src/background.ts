import { pipeline, env } from '@xenova/transformers';
import { encryptText } from './crypto';
import { saveLocalMemory } from './localDb';

declare const process: { env: { API_URL: string } };
const API_URL = typeof process !== 'undefined' && process.env?.API_URL ? process.env.API_URL : 'http://localhost:8000';

// Configure transformers for MV3 browser extension context
env.allowLocalModels = false;
env.useBrowserCache = true;
env.backends.onnx.wasm.numThreads = 1;


// 1. Sensitive Domain Blocklist (Hardcoded & Non-negotiable Privacy Guarantee)
const SENSITIVE_DOMAINS = [
  // Financial Services
  'paypal.com', 'stripe.com', 'chase.com', 'bankofamerica.com', 'wellsfargo.com', 
  'capitalone.com', 'fidelity.com', 'schwab.com', 'vanguard.com', 'coinbase.com',
  // Medical & Health Portals
  'mychart.com', 'epic.com', 'webmd.com', 'nih.gov', 'cdc.gov', 'mayoclinic.org',
  // Identity & Credentials
  'okta.com', 'auth0.com', 'accounts.google.com', 'login.microsoftonline.com',
  // Router admin page subnets & local dev environments (excluding specific test addresses)
  'localhost', '127.0.0.1', '192.168.', '10.', '172.16.', '0.0.0.0'
];

// Blocklist path keywords (like signup, reset-password etc.)
const SENSITIVE_PATH_KEYWORDS = [
  'login', 'signin', 'signup', 'register', 'password', 'checkout', 'billing', 
  'cart', 'oauth', 'mfa', 'verify', 'reset-pw', 'bank', 'wallet', 'token'
];

// In-memory sliding window for capture deduplication (URL -> timestamp)
const captureWindow = new Map<string, number>();
const DEDUPLICATION_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

let embeddingPipeline: any = null;

// Lazily load the local embedding model on first captured page
async function getEmbeddingPipeline() {
  if (!embeddingPipeline) {
    console.log('[Smarana Background] Loading local WASM Feature Extraction pipeline...');
    // We use all-MiniLM-L6-v2 which yields a highly accurate 384-dimensional float vector
    embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('[Smarana Background] Local WASM embedding model loaded successfully.');
  }
  return embeddingPipeline;
}

// Check if a URL belongs to a blocked domain or path
function isSensitive(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    const host = url.hostname.toLowerCase();
    const path = url.pathname.toLowerCase();

    // 1. Check blocked domain names
    const isDomainBlocked = SENSITIVE_DOMAINS.some(domain => host.includes(domain));
    if (isDomainBlocked) return true;

    // 2. Check path keywords (login screens, carts, checkouts)
    const isPathBlocked = SENSITIVE_PATH_KEYWORDS.some(kw => path.includes(kw));
    if (isPathBlocked) return true;

    // 3. Ignore browser internal pages
    if (url.protocol.startsWith('chrome') || url.protocol.startsWith('about')) return true;

    return false;
  } catch (e) {
    return true; // block on invalid URL parses for safety
  }
}

// Generate raw embedding using the local WASM model
async function generateEmbedding(text: string): Promise<number[]> {
  const extractor = await getEmbeddingPipeline();
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  // Convert Tensor data back to native JS Array of floats
  return Array.from(output.data);
}

// Sync offline queue items to the FastAPI backend
async function flushOfflineQueue() {
  const data = await chrome.storage.local.get(['offlineQueue', 'jwtToken']);
  const queue = data.offlineQueue || [];
  const token = data.jwtToken;

  if (queue.length === 0 || !token) return;

  console.log(`[Smarana Background] Attempting to flush ${queue.length} cached memories...`);
  const remainingQueue = [];

  for (const item of queue) {
    try {
      const response = await fetch(`${API_URL}/api/memories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(item)
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
    } catch (e) {
      console.warn('[Smarana Background] Failed to sync cached memory, placing back in queue:', e);
      remainingQueue.push(item);
    }
  }

  await chrome.storage.local.set({ offlineQueue: remainingQueue });
  console.log(`[Smarana Background] Offline queue flush complete. ${queue.length - remainingQueue.length} synced.`);
}

// Main capture worker
async function handlePageCapture(
  payload: { title: string; url: string; textContent: string },
  tabId?: number
) {
  const { title, url, textContent } = payload;

  const sendStatus = (msg: string) => {
    if (tabId) {
      chrome.tabs.sendMessage(tabId, { type: 'CAPTURE_STATUS', message: msg }).catch(() => {});
    }
  };

  // 1. Enforce Non-negotiable Privacy Blocklist
  if (isSensitive(url)) {
    console.log(`[Smarana Background] Ignored sensitive/blocked URL: ${url}`);
    sendStatus(`Ignored sensitive/blocked URL: ${url}`);
    return;
  }

  // 2. Enforce 30-Minute Capture Deduplication Window
  const now = Date.now();
  const lastCaptureTime = captureWindow.get(url);
  if (lastCaptureTime && (now - lastCaptureTime) < DEDUPLICATION_WINDOW_MS) {
    console.log(`[Smarana Background] Ignored duplicate URL visit within 30-min window: ${url}`);
    sendStatus('Ignored duplicate URL visit within 30-min window.');
    return;
  }
  // Record capture timestamp
  captureWindow.set(url, now);

  // Clean sliding window of entries older than 30 mins to preserve background memory
  for (const [key, value] of captureWindow.entries()) {
    if ((now - value) > DEDUPLICATION_WINDOW_MS) {
      captureWindow.delete(key);
    }
  }

  // Retrieve user password and token
  const settings = await chrome.storage.local.get(['masterPassword', 'jwtToken', 'isPaused']);
  if (settings.isPaused) {
    console.log('[Smarana Background] Passive capture is currently paused.');
    sendStatus('Passive capture is currently paused.');
    return;
  }

  const password = settings.masterPassword;
  const token = settings.jwtToken;

  if (!password) {
    console.warn('[Smarana Background] Master password not configured. Skipping server upload.');
    sendStatus('Warning: Master password not configured. Skipping capture.');
    return;
  }

  try {
    console.log(`[Smarana Background] Capturing page: "${title}"`);
    sendStatus(`Capturing page "${title}" - running local embedding model...`);

    // 3. Generate Local WASM Embeddings
    const embedding = await generateEmbedding(textContent);

    sendStatus('Embedding generated. Encrypting data client-side...');

    // 4. Client-side AES-256 Encryption
    // Server only stores ciphertext. URLs, titles, and text are encrypted on-device.
    const encryptedTitle = await encryptText(title, password);
    const encryptedUrl = await encryptText(url, password);
    const encryptedContent = await encryptText(textContent, password);

    const memoryId = crypto.randomUUID();
    const memoryPayload = {
      id: memoryId,
      encrypted_title: encryptedTitle,
      encrypted_url: encryptedUrl,
      encrypted_text_content: encryptedContent,
      embedding: embedding
    };

    // Save decrypted copy to IndexedDB for local hybrid search
    try {
      await saveLocalMemory({
        id: memoryId,
        title: title,
        url: url,
        textContent: textContent,
        createdAt: new Date().toISOString(),
        sm2: {
          interval: 1,
          repetitions: 0,
          easeFactor: 2.5,
          nextReviewDate: new Date().toISOString()
        }
      });
      console.log('[Smarana Background] Saved decrypted memory to local IndexedDB.');
    } catch (dbErr) {
      console.error('[Smarana Background] Failed to save to local IndexedDB:', dbErr);
    }

    // 5. Send to FastAPI backend
    if (token) {
      sendStatus('Data encrypted. Syncing with backend...');
      try {
        const response = await fetch(`${API_URL}/api/memories`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(memoryPayload)
        });

        if (!response.ok) {
          throw new Error(`Sync failed with status code ${response.status}`);
        }
        console.log('[Smarana Background] Successfully saved client-encrypted memory to cloud backend.');
        sendStatus('Success! Saved client-encrypted memory to backend.');
      } catch (err) {
        console.warn('[Smarana Background] Network sync failed. Caching memory locally in queue.');
        sendStatus('Network sync failed. Saved to local offline queue.');
        const data = await chrome.storage.local.get('offlineQueue');
        const queue = data.offlineQueue || [];
        queue.push(memoryPayload);
        await chrome.storage.local.set({ offlineQueue: queue });
      }
    } else {
      // User is logged out/offline, save to local queue
      const data = await chrome.storage.local.get('offlineQueue');
      const queue = data.offlineQueue || [];
      queue.push(memoryPayload);
      await chrome.storage.local.set({ offlineQueue: queue });
      console.log('[Smarana Background] Saved captured memory to local queue (User not logged in).');
      sendStatus('Saved to local offline queue (Not logged in).');
    }
  } catch (error: any) {
    console.error('[Smarana Background] Capture process encountered an error:', error);
    sendStatus(`Error during capture: ${error.message || error}`);
  }
}

// Listen to captured messages from injected content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PAGE_CAPTURED') {
    handlePageCapture(message.payload, sender.tab?.id);
  } else if (message.type === 'GENERATE_EMBEDDING') {
    generateEmbedding(message.text)
      .then(embedding => {
        sendResponse({ success: true, embedding });
      })
      .catch(err => {
        console.error('[Smarana Background] Failed to generate embedding message:', err);
        sendResponse({ success: false, error: err.message || String(err) });
      });
    return true; // asynchronous response
  } else if (message.type === 'FLUSH_OFFLINE_QUEUE') {
    flushOfflineQueue()
      .then(() => sendResponse({ success: true }))
      .catch(err => {
        console.error('[Smarana Background] Failed to flush offline queue:', err);
        sendResponse({ success: false, error: err.message || String(err) });
      });
    return true;
  }
});

// Periodic offline queue flushing when network state shifts or service worker wakes
chrome.runtime.onStartup.addListener(() => {
  flushOfflineQueue();
});

// Flush queue when network connection state changes
chrome.action.onClicked.addListener(() => {
  flushOfflineQueue();
});

// Active tab tracking to capture SPA navigation URL changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    chrome.tabs.sendMessage(tabId, { type: 'TRIGGER_CAPTURE' }).catch(() => {
      // Content script may not be loaded or active yet, which is safe to ignore
    });
  }
});

