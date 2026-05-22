/**
 * Content Script (DOM Text Extractor)
 * Runs in the context of webpages at document_idle.
 * Extracts clean, visible text content and sends it to the background worker.
 * Must adhere to strict performance constraints (<50ms execution time).
 */

function extractCleanText(): { title: string; url: string; textContent: string } {
  const startTime = performance.now();
  const title = document.title;
  const url = window.location.href;
  
  let text = '';
  if (document.body) {
    // Clone the body node to avoid causing reflows or layout shifts in the active page
    const clone = document.body.cloneNode(true) as HTMLElement;
    
    // Purge elements that do not contain useful semantic reading content
    const purgeSelectors = 'script, style, iframe, nav, footer, header, noscript, svg, path, button';
    const elementsToRemove = clone.querySelectorAll(purgeSelectors);
    elementsToRemove.forEach(el => el.remove());
    
    // Extract inner text
    text = clone.innerText || clone.textContent || '';
  }
  
  // Clean whitespace and clip text length to 6000 characters.
  // This balances deep semantic representation with low memory/CPU cost for client-side WASM embeddings.
  const cleanedText = text
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 6000);

  const duration = performance.now() - startTime;
  console.log(`[Smarana Capture] Text extracted in ${duration.toFixed(2)}ms`);
  
  return { title, url, textContent: cleanedText };
}

let retryCount = 0;
const MAX_RETRIES = 3;

function runCaptureFlow() {
  const capturedData = extractCleanText();
  // Don't capture empty pages or internal browser states
  if (capturedData.textContent.length > 50) {
    chrome.runtime.sendMessage({
      type: 'PAGE_CAPTURED',
      payload: capturedData
    });
    retryCount = 0; // reset retry counter on success
  } else if (retryCount < MAX_RETRIES) {
    retryCount++;
    console.log(`[Smarana Capture] Scraped text too short (${capturedData.textContent.length} chars). Page might still be rendering. Retrying capture in 2s (Attempt ${retryCount}/${MAX_RETRIES})...`);
    setTimeout(runCaptureFlow, 2000);
  } else {
    console.log(`[Smarana Capture] Abandoned capture after ${MAX_RETRIES} retries. Text content remained too short.`);
  }
}

// Listen for message triggers from background script (handles dynamic tab updates / SPAs)
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'TRIGGER_CAPTURE') {
    retryCount = 0; // Reset retries for new navigation triggers
    runCaptureFlow();
  }
});

// Ensure the page load is completely finished and execution happens during browser idle time
if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => runCaptureFlow(), { timeout: 2000 });
  } else {
    setTimeout(runCaptureFlow, 1000);
  }
}

