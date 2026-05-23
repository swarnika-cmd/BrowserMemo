import { decryptText, encryptText } from './crypto';
import {
  saveLocalMemory,
  getAllLocalMemories,
  clearLocalDb,
  keywordSearch,
  reciprocalRankFusion,
  LocalMemory
} from './localDb';

// DOM Elements
declare const process: { env: { API_URL: string } };
const API_URL = typeof process !== 'undefined' && process.env?.API_URL ? process.env.API_URL : 'http://localhost:8000';

const loadingOverlay = document.getElementById('loading-overlay') as HTMLDivElement;
const loadingText = document.getElementById('loading-text') as HTMLDivElement;
const captureStatusDot = document.getElementById('capture-status-dot') as HTMLDivElement;

// Auth Screen Elements
const authScreen = document.getElementById('auth-screen') as HTMLDivElement;
const authLoginTab = document.getElementById('auth-login-tab') as HTMLButtonElement;
const authSignupTab = document.getElementById('auth-signup-tab') as HTMLButtonElement;
const authForm = document.getElementById('auth-form') as HTMLFormElement;
const authEmail = document.getElementById('auth-email') as HTMLInputElement;
const authPassword = document.getElementById('auth-password') as HTMLInputElement;
const authMasterPassword = document.getElementById('auth-master-password') as HTMLInputElement;
const authSubmitBtn = document.getElementById('auth-submit-btn') as HTMLButtonElement;
const authErrorMsg = document.getElementById('auth-error-msg') as HTMLDivElement;

// Main Container & Panels
const mainContainer = document.getElementById('main-container') as HTMLDivElement;
const searchPanel = document.getElementById('search-panel') as HTMLDivElement;
const reviewPanel = document.getElementById('review-panel') as HTMLDivElement;
const settingsPanel = document.getElementById('settings-panel') as HTMLDivElement;

// Navigation Tab Buttons
const searchTabBtn = document.getElementById('search-tab-btn') as HTMLButtonElement;
const reviewTabBtn = document.getElementById('review-tab-btn') as HTMLButtonElement;
const settingsTabBtn = document.getElementById('settings-tab-btn') as HTMLButtonElement;

// Search Panel Elements
const searchQuery = document.getElementById('search-query') as HTMLInputElement;
const searchStatusBar = document.getElementById('search-status-bar') as HTMLDivElement;
const memoriesContainer = document.getElementById('memories-container') as HTMLDivElement;

// Review Panel Elements
const reviewQueueCount = document.getElementById('review-queue-count') as HTMLDivElement;
const activeReviewCard = document.getElementById('active-review-card') as HTMLDivElement;
const reviewCardMeta = document.getElementById('review-card-meta') as HTMLDivElement;
const reviewCardTitle = document.getElementById('review-card-title') as HTMLDivElement;
const reviewCardUrl = document.getElementById('review-card-url') as HTMLAnchorElement;
const reviewPromptReveal = document.getElementById('review-prompt-reveal') as HTMLDivElement;
const reviewContentBody = document.getElementById('review-content-body') as HTMLDivElement;
const reviewRatingActions = document.getElementById('review-rating-actions') as HTMLDivElement;
const emptyReviewState = document.getElementById('empty-review-state') as HTMLDivElement;

// Settings Panel Elements
const settingsEmailLabel = document.getElementById('settings-email-label') as HTMLDivElement;
const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;
const offlineQueueBadge = document.getElementById('offline-queue-badge') as HTMLSpanElement;
const forceSyncBtn = document.getElementById('force-sync-btn') as HTMLButtonElement;
const toggleCapture = document.getElementById('toggle-capture') as HTMLInputElement;
const clearLocalDbBtn = document.getElementById('clear-local-db-btn') as HTMLButtonElement;

// Application State
let currentTab: 'search' | 'review' | 'settings' = 'search';
let authMode: 'login' | 'signup' = 'login';
let jwtToken = '';
let masterPassword = '';
let loggedInEmail = '';
let activeReviewQueue: LocalMemory[] = [];
let searchTimeout: number | null = null;

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
  await loadStateAndCheckAuth();
  setupEventListeners();
  updateStatusDot();
});

// Load state from chrome storage
async function loadStateAndCheckAuth() {
  showLoading('Initializing Smarana...');
  try {
    const data = await chrome.storage.local.get([
      'jwtToken',
      'masterPassword',
      'email',
      'isPaused',
      'offlineQueue'
    ]);

    jwtToken = data.jwtToken || '';
    masterPassword = data.masterPassword || '';
    loggedInEmail = data.email || '';
    toggleCapture.checked = !data.isPaused;

    // Update offline queue badge
    const queue = data.offlineQueue || [];
    offlineQueueBadge.textContent = String(queue.length);

    if (jwtToken && masterPassword) {
      // User is logged in
      authScreen.classList.add('hidden');
      mainContainer.classList.remove('hidden');
      settingsEmailLabel.textContent = loggedInEmail;
      
      // Load default panel
      switchTab('search');
    } else {
      // User needs to authenticate
      mainContainer.classList.add('hidden');
      authScreen.classList.remove('hidden');
      updateAuthTabUI();
    }
  } catch (err) {
    console.error('Failed to load initial state:', err);
  } finally {
    hideLoading();
  }
}

// Show/Hide Loading Overlay
function showLoading(text: string) {
  loadingText.textContent = text;
  loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
  loadingOverlay.classList.add('hidden');
}

// Update Capture Status indicator ring
async function updateStatusDot() {
  const data = await chrome.storage.local.get('isPaused');
  if (data.isPaused) {
    captureStatusDot.className = 'status-ring paused';
    captureStatusDot.title = 'Passive Capture is PAUSED';
  } else {
    captureStatusDot.className = 'status-ring active';
    captureStatusDot.title = 'Passive Capture is ACTIVE';
  }
}

// Handle Auth Mode Tab Switch (Sign In vs Register)
function updateAuthTabUI() {
  authErrorMsg.textContent = '';
  if (authMode === 'login') {
    authLoginTab.classList.add('active');
    authSignupTab.classList.remove('active');
    authSubmitBtn.textContent = 'Sign In';
  } else {
    authSignupTab.classList.add('active');
    authLoginTab.classList.remove('active');
    authSubmitBtn.textContent = 'Register Account';
  }
}

// Set up DOM Event Listeners
function setupEventListeners() {
  // Auth Tabs
  authLoginTab.addEventListener('click', () => {
    authMode = 'login';
    updateAuthTabUI();
  });

  authSignupTab.addEventListener('click', () => {
    authMode = 'signup';
    updateAuthTabUI();
  });

  // Auth Form Submit
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authErrorMsg.textContent = '';

    const email = authEmail.value.trim();
    const password = authPassword.value;
    const mPassword = authMasterPassword.value;

    if (!email || !password || !mPassword) {
      authErrorMsg.textContent = 'Please fill out all fields.';
      return;
    }

    if (mPassword.length < 6) {
      authErrorMsg.textContent = 'Master passcode must be at least 6 characters.';
      return;
    }

    showLoading(authMode === 'login' ? 'Signing in...' : 'Registering...');

    try {
      if (authMode === 'signup') {
        // Register API Call
        const registerRes = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        if (!registerRes.ok) {
          const errData = await registerRes.json();
          throw new Error(errData.detail || 'Registration failed.');
        }
      }

      // Login/Token API Call (OAuth2 password flow expects urlencoded form body)
      const loginParams = new URLSearchParams();
      loginParams.append('username', email);
      loginParams.append('password', password);

      const loginRes = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: loginParams.toString()
      });

      if (!loginRes.ok) {
        const errData = await loginRes.json();
        throw new Error(errData.detail || 'Invalid email or password.');
      }

      const loginData = await loginRes.json();
      jwtToken = loginData.access_token;
      masterPassword = mPassword;
      loggedInEmail = email;

      // Save to chrome storage
      await chrome.storage.local.set({
        jwtToken,
        masterPassword,
        email: loggedInEmail
      });

      settingsEmailLabel.textContent = loggedInEmail;

      // Pull existing encrypted memories from cloud server, decrypt them, and sync local IndexedDB
      showLoading('Downloading existing memories from cloud...');
      await syncMemoriesFromServer(jwtToken, masterPassword);

      // Transition to Main screen
      authScreen.classList.add('hidden');
      mainContainer.classList.remove('hidden');
      
      authEmail.value = '';
      authPassword.value = '';
      authMasterPassword.value = '';

      switchTab('search');
    } catch (err: any) {
      console.error('Auth error:', err);
      authErrorMsg.textContent = err.message || 'An error occurred during authentication.';
    } finally {
      hideLoading();
    }
  });

  // Main Tabs navigation
  searchTabBtn.addEventListener('click', () => switchTab('search'));
  reviewTabBtn.addEventListener('click', () => switchTab('review'));
  settingsTabBtn.addEventListener('click', () => switchTab('settings'));

  // Search input typing handler
  searchQuery.addEventListener('input', () => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    searchTimeout = window.setTimeout(() => {
      runSearchQuery();
    }, 250); // 250ms debounce
  });

  // Review panel reveal handler
  reviewPromptReveal.addEventListener('click', () => {
    reviewPromptReveal.classList.add('hidden');
    reviewContentBody.classList.remove('hidden');
    reviewRatingActions.classList.remove('hidden');
  });

  // Review ratings handler
  const ratingButtons = reviewRatingActions.querySelectorAll('.rating-btn');
  ratingButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const valStr = btn.getAttribute('data-val');
      if (valStr) {
        const quality = parseInt(valStr, 10);
        await submitReviewRating(quality);
      }
    });
  });

  // Settings Panel: Logout
  logoutBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to sign out? This will wipe all local decrypted cache memories.')) {
      showLoading('Signing out & wiping local cache...');
      try {
        await clearLocalDb();
        await chrome.storage.local.remove(['jwtToken', 'masterPassword', 'email', 'offlineQueue']);
        
        jwtToken = '';
        masterPassword = '';
        loggedInEmail = '';
        activeReviewQueue = [];
        searchQuery.value = '';

        mainContainer.classList.add('hidden');
        authScreen.classList.remove('hidden');
        authMode = 'login';
        updateAuthTabUI();
      } catch (err) {
        console.error('Logout error:', err);
      } finally {
        hideLoading();
      }
    }
  });

  // Settings Panel: Force Sync
  forceSyncBtn.addEventListener('click', async () => {
    forceSyncBtn.disabled = true;
    const originalText = forceSyncBtn.textContent;
    forceSyncBtn.textContent = 'Syncing...';
    try {
      chrome.runtime.sendMessage({ type: 'FLUSH_OFFLINE_QUEUE' }, async (response) => {
        const data = await chrome.storage.local.get('offlineQueue');
        const queue = data.offlineQueue || [];
        offlineQueueBadge.textContent = String(queue.length);

        if (response && response.success) {
          alert('Synchronization completed successfully!');
        } else {
          alert(`Sync finished. Left in queue: ${queue.length}. ${response?.error || ''}`);
        }
        forceSyncBtn.disabled = false;
        forceSyncBtn.textContent = originalText;
      });
    } catch (err) {
      console.error(err);
      forceSyncBtn.disabled = false;
      forceSyncBtn.textContent = originalText;
    }
  });

  // Settings Panel: Toggle Passive Capture
  toggleCapture.addEventListener('change', async () => {
    const isPaused = !toggleCapture.checked;
    await chrome.storage.local.set({ isPaused });
    updateStatusDot();
  });

  // Settings Panel: Clear Local DB
  clearLocalDbBtn.addEventListener('click', async () => {
    if (confirm('Wipe decrypted database cache and re-sync from cloud?')) {
      showLoading('Re-syncing from cloud...');
      try {
        await clearLocalDb();
        if (jwtToken && masterPassword) {
          await syncMemoriesFromServer(jwtToken, masterPassword);
          alert('Wiped and successfully re-synced!');
        } else {
          alert('Local database wiped.');
        }
        if (currentTab === 'search') {
          runSearchQuery();
        }
      } catch (err) {
        console.error(err);
        alert('Failed to clear database or sync.');
      } finally {
        hideLoading();
      }
    }
  });
}

// Download all memories from cloud backend, decrypt them locally, and save to IndexedDB
async function syncMemoriesFromServer(token: string, secret: string) {
  try {
    const response = await fetch(`${API_URL}/api/memories`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Cloud sync returned HTTP status ${response.status}`);
    }

    const memories = await response.json();
    console.log(`[Smarana Popup] Found ${memories.length} memories in cloud. Decrypting...`);

    let syncCount = 0;
    for (const mem of memories) {
      try {
        const title = await decryptText(mem.encrypted_title, secret);
        const url = await decryptText(mem.encrypted_url, secret);
        const textContent = await decryptText(mem.encrypted_text_content, secret);

        await saveLocalMemory({
          id: mem.id,
          title,
          url,
          textContent,
          createdAt: mem.created_at,
          sm2: {
            interval: mem.interval,
            repetitions: mem.repetitions,
            easeFactor: mem.ease_factor,
            nextReviewDate: mem.next_review
          }
        });
        syncCount++;
      } catch (decErr) {
        console.warn(`[Smarana Popup] Decryption failed for memory ID ${mem.id}. Skipping.`, decErr);
      }
    }
    console.log(`[Smarana Popup] Sync complete. Saved ${syncCount} decrypted memories to IndexedDB.`);
  } catch (err) {
    console.error('Failed to sync memories from server:', err);
  }
}

// Switch between panels (Search, Review, Settings)
async function switchTab(tab: 'search' | 'review' | 'settings') {
  currentTab = tab;

  // Update nav buttons
  searchTabBtn.classList.remove('active');
  reviewTabBtn.classList.remove('active');
  settingsTabBtn.classList.remove('active');

  // Update panels
  searchPanel.classList.add('hidden');
  reviewPanel.classList.add('hidden');
  settingsPanel.classList.add('hidden');

  if (tab === 'search') {
    searchTabBtn.classList.add('active');
    searchPanel.classList.remove('hidden');
    runSearchQuery();
  } else if (tab === 'review') {
    reviewTabBtn.classList.add('active');
    reviewPanel.classList.remove('hidden');
    await loadReviewQueue();
  } else if (tab === 'settings') {
    settingsTabBtn.classList.add('active');
    settingsPanel.classList.remove('hidden');
    // Refresh offline queue size
    const data = await chrome.storage.local.get('offlineQueue');
    const queue = data.offlineQueue || [];
    offlineQueueBadge.textContent = String(queue.length);
  }
}

// Run Hybrid Search Query using local FTS and backend Vector Search
async function runSearchQuery() {
  const query = searchQuery.value.trim();

  try {
    if (!query) {
      searchStatusBar.textContent = 'All Memories';
      const allMemories = await getAllLocalMemories();
      // Sort by creation date descending
      allMemories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      renderMemories(allMemories);
      return;
    }

    searchStatusBar.textContent = 'Searching...';

    // 1. Generate Query Vector Embedding in Service Worker
    const embedResponse = await new Promise<any>((resolve) => {
      chrome.runtime.sendMessage({ type: 'GENERATE_EMBEDDING', text: query }, (res) => {
        resolve(res);
      });
    });

    if (!embedResponse || !embedResponse.success || !embedResponse.embedding) {
      throw new Error(embedResponse?.error || 'Failed to generate search embedding.');
    }

    const embedding = embedResponse.embedding;

    // 2. Fetch Vector Matches from FastAPI
    let vectorResults: LocalMemory[] = [];
    try {
      const searchRes = await fetch(`${API_URL}/api/memories/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          embedding: embedding,
          top_k: 20
        })
      });

      if (searchRes.ok) {
        const cloudHits = await searchRes.json();
        for (const hit of cloudHits) {
          try {
            const title = await decryptText(hit.encrypted_title, masterPassword);
            const url = await decryptText(hit.encrypted_url, masterPassword);
            const textContent = await decryptText(hit.encrypted_text_content, masterPassword);

            vectorResults.push({
              id: hit.id,
              title,
              url,
              textContent,
              createdAt: hit.created_at,
              sm2: {
                interval: hit.interval,
                repetitions: hit.repetitions,
                easeFactor: hit.ease_factor,
                nextReviewDate: hit.next_review
              }
            });
          } catch (decErr) {
            // decrypt failure
          }
        }
      }
    } catch (netErr) {
      console.warn('Vector search failed or backend is offline. Falling back to local keyword only.', netErr);
    }

    // 3. Local FTS keyword search on IndexedDB
    const keywordResults = await keywordSearch(query);

    // 4. Merge results via Reciprocal Rank Fusion (RRF)
    const fusedResults = reciprocalRankFusion(vectorResults, keywordResults, 60);

    // 5. Render results
    searchStatusBar.textContent = `Found ${fusedResults.length} memories`;
    renderMemories(fusedResults, vectorResults.map(r => r.id), keywordResults.map(r => r.id));

  } catch (err: any) {
    console.error('Search error:', err);
    searchStatusBar.textContent = `Search failed: ${err.message || err}`;
  }
}

// Render local memory list inside popup
function renderMemories(memories: LocalMemory[], vectorIds: string[] = [], keywordIds: string[] = []) {
  memoriesContainer.innerHTML = '';

  if (memories.length === 0) {
    memoriesContainer.innerHTML = `
      <div style="text-align: center; color: var(--text-dark); padding: 40px 10px;">
        No memories found.
      </div>
    `;
    return;
  }

  memories.forEach((mem) => {
    const card = document.createElement('div');
    card.className = 'memory-card';

    const formattedDate = new Date(mem.createdAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    // Determine matched modes
    const isVector = vectorIds.includes(mem.id);
    const isKeyword = keywordIds.includes(mem.id);
    let matchBadge = '';
    if (isVector && isKeyword) {
      matchBadge = '<span class="score-badge">Hybrid</span>';
    } else if (isVector) {
      matchBadge = '<span class="score-badge" style="background: rgba(217, 70, 239, 0.1); color: var(--accent);">Semantic</span>';
    } else if (isKeyword) {
      matchBadge = '<span class="score-badge" style="background: rgba(16, 185, 129, 0.1); color: var(--success);">Keyword</span>';
    }

    // Setup SM-2 info
    const repsInfo = mem.sm2?.repetitions > 0 ? `• Reps: ${mem.sm2.repetitions}` : '';

    card.innerHTML = `
      <div class="card-header">
        <a href="${mem.url}" target="_blank" class="card-title">${escapeHtml(mem.title || 'Untitled')}</a>
        ${matchBadge}
      </div>
      <a href="${mem.url}" target="_blank" class="card-url">${escapeHtml(mem.url)}</a>
      <div class="card-snippet">${escapeHtml(mem.textContent || '')}</div>
      <div class="card-footer">
        <span>Captured: ${formattedDate}</span>
        <span>${repsInfo}</span>
      </div>
    `;
    memoriesContainer.appendChild(card);
  });
}

// Load and Decrypt Review Queue from server
async function loadReviewQueue() {
  showLoading('Loading review queue...');
  activeReviewQueue = [];

  try {
    const res = await fetch(`${API_URL}/api/memories/review`, {
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      }
    });

    if (!res.ok) {
      throw new Error(`Review fetch returned HTTP status ${res.status}`);
    }

    const dueMemories = await res.json();
    console.log(`[Smarana Review] Found ${dueMemories.length} due memories. Decrypting...`);

    for (const mem of dueMemories) {
      try {
        const title = await decryptText(mem.encrypted_title, masterPassword);
        const url = await decryptText(mem.encrypted_url, masterPassword);
        const textContent = await decryptText(mem.encrypted_text_content, masterPassword);

        activeReviewQueue.push({
          id: mem.id,
          title,
          url,
          textContent,
          createdAt: mem.created_at,
          sm2: {
            interval: mem.interval,
            repetitions: mem.repetitions,
            easeFactor: mem.ease_factor,
            nextReviewDate: mem.next_review
          }
        });
      } catch (decErr) {
        // decrypt fail
      }
    }

    reviewQueueCount.textContent = String(activeReviewQueue.length);
    renderNextReviewCard();

  } catch (err: any) {
    console.error('Review queue load failed:', err);
    reviewQueueCount.textContent = 'Err';
    alert(`Failed to load review queue: ${err.message || err}`);
  } finally {
    hideLoading();
  }
}

// Render the next available card in the review queue
function renderNextReviewCard() {
  // Hide everything first
  activeReviewCard.classList.add('hidden');
  emptyReviewState.classList.add('hidden');
  reviewPromptReveal.classList.remove('hidden');
  reviewContentBody.classList.add('hidden');
  reviewRatingActions.classList.add('hidden');

  if (activeReviewQueue.length === 0) {
    emptyReviewState.classList.remove('hidden');
    return;
  }

  const item = activeReviewQueue[0];
  reviewCardTitle.textContent = item.title || 'Untitled Page';
  reviewCardUrl.href = item.url;
  reviewCardUrl.textContent = item.url;
  
  // Format card metadata
  const intervalDays = item.sm2?.interval || 1;
  const repetitions = item.sm2?.repetitions || 0;
  reviewCardMeta.textContent = `Card Repetition #${repetitions + 1} (Interval: ${intervalDays}d)`;

  reviewContentBody.textContent = item.textContent || 'No text snippet captured.';

  activeReviewCard.classList.remove('hidden');
}

// Submit recall rating back to backend and save update
async function submitReviewRating(quality: number) {
  if (activeReviewQueue.length === 0) return;

  const item = activeReviewQueue[0];
  showLoading('Submitting review...');

  try {
    // POST request to memories/{id}/review?quality=Q
    const res = await fetch(`${API_URL}/api/memories/${item.id}/review?quality=${quality}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      }
    });

    if (!res.ok) {
      throw new Error(`Review submit failed with status code ${res.status}`);
    }

    const updatedMemory = await res.json();
    
    // Decrypt and save back to local db
    const title = await decryptText(updatedMemory.encrypted_title, masterPassword);
    const url = await decryptText(updatedMemory.encrypted_url, masterPassword);
    const textContent = await decryptText(updatedMemory.encrypted_text_content, masterPassword);

    await saveLocalMemory({
      id: updatedMemory.id,
      title,
      url,
      textContent,
      createdAt: updatedMemory.created_at,
      sm2: {
        interval: updatedMemory.interval,
        repetitions: updatedMemory.repetitions,
        easeFactor: updatedMemory.ease_factor,
        nextReviewDate: updatedMemory.next_review
      }
    });

    // Remove from active queue
    activeReviewQueue.shift();
    reviewQueueCount.textContent = String(activeReviewQueue.length);
    
    renderNextReviewCard();

  } catch (err: any) {
    console.error('Submit review error:', err);
    alert(`Could not submit recall rating: ${err.message || err}`);
  } finally {
    hideLoading();
  }
}

// Helper to escape HTML tags
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
