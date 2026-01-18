chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "summarizeWithUsher",
    title: "Summarize with Usher",
    contexts: ["link", "selection"]
  });
});

// Handle hover-triggered summarization requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "HOVER_SUMMARIZE") {
    handleSummarize(request.url, sender.tab.id);
    sendResponse({ status: "received" });
  }
  return true;
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "summarizeWithUsher") {
    const targetUrl = info.linkUrl || "";

    if (!targetUrl) {
      console.log("No link detected.");
      return;
    }

    await handleSummarize(targetUrl, tab.id);
  }
});

/**
 * Handle summarization request (from hover or right-click)
 * @param {string} targetUrl - The URL to summarize
 * @param {number} tabId - The tab ID
 */
async function handleSummarize(targetUrl, tabId) {
  try {
    // 1. Ensure content script is loaded
    await ensureContentScript(tabId);

    // 2. Send 'Loading' message to Content Script
    chrome.tabs.sendMessage(tabId, { action: "SHOW_LOADING" });

    // 3. Check local cache first
    const cachedSummary = await checkCache(targetUrl);
    if (cachedSummary) {
      console.log("Usher: Using cached summary");
      chrome.tabs.sendMessage(tabId, {
        action: "SHOW_SUMMARY",
        text: cachedSummary
      });
      return;
    }

    // 4. Extract context from the page
    const context = await extractContext(tabId, targetUrl);

    // 5. POST to Cloudflare Worker with context data
    const apiUrl = "https://usher-worker.insaneswithbrains.workers.dev";
    const payload = {
      url: targetUrl,
      anchorText: context.anchorText || "",
      surroundingContext: context.surroundingContext || ""
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    const summary = data.summary || "Relay processed the link but no summary was returned.";

    // 6. Cache the summary
    await cacheResult(targetUrl, summary);

    // 7. Send the summary text back to the Content Script
    chrome.tabs.sendMessage(tabId, {
      action: "SHOW_SUMMARY",
      text: summary
    });

  } catch (err) {
    console.error("Usher Error:", err);
    chrome.tabs.sendMessage(tabId, { action: "SHOW_ERROR" });
  }
}

/**
 * Ensure content script is loaded in the tab
 * @param {number} tabId - The tab ID
 */
async function ensureContentScript(tabId) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, { action: "PING" }, async (response) => {
      if (chrome.runtime.lastError) {
        // Content script not loaded, inject it
        console.log("Usher: Content script not found, injecting...");
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
          });
          // Wait a bit for the script to initialize
          await new Promise(r => setTimeout(r, 150));
          resolve();
        } catch (injectionError) {
          console.error("Usher: Could not inject content script", injectionError);
          reject(injectionError);
        }
      } else {
        // Content script already loaded
        resolve();
      }
    });
  });
}

/**
 * Extract context from the content script
 * @param {number} tabId - The tab ID
 * @param {string} linkUrl - The URL of the clicked link
 * @returns {Promise<Object>} Context data
 */
async function extractContext(tabId, linkUrl) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(
      tabId,
      { action: "EXTRACT_CONTEXT", linkUrl: linkUrl },
      (response) => {
        if (chrome.runtime.lastError || !response || !response.success) {
          console.warn("Usher: Could not extract context, proceeding without it");
          resolve({ anchorText: "", surroundingContext: "" });
        } else {
          resolve(response);
        }
      }
    );
  });
}

/**
 * Check if a summary is cached locally
 * @param {string} url - The URL to check
 * @returns {Promise<string|null>} Cached summary or null
 */
async function checkCache(url) {
  try {
    const cacheKey = `usher_cache_${hashUrl(url)}`;
    const result = await chrome.storage.local.get([cacheKey]);

    if (result[cacheKey]) {
      const cached = result[cacheKey];
      const now = Date.now();
      const cacheAge = now - cached.timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      if (cacheAge < maxAge) {
        return cached.summary;
      } else {
        // Cache expired, remove it
        await chrome.storage.local.remove([cacheKey]);
      }
    }
    return null;
  } catch (error) {
    console.error("Usher: Cache check error", error);
    return null;
  }
}

/**
 * Cache a summary result
 * @param {string} url - The URL
 * @param {string} summary - The summary text
 */
async function cacheResult(url, summary) {
  try {
    const cacheKey = `usher_cache_${hashUrl(url)}`;
    await chrome.storage.local.set({
      [cacheKey]: {
        summary: summary,
        timestamp: Date.now()
      }
    });

    // Implement LRU eviction - keep only last 1000 entries
    await enforceCacheLimit();
  } catch (error) {
    console.error("Usher: Cache write error", error);
  }
}

/**
 * Enforce cache size limit using LRU eviction
 */
async function enforceCacheLimit() {
  try {
    const allData = await chrome.storage.local.get(null);
    const cacheKeys = Object.keys(allData).filter(key => key.startsWith('usher_cache_'));

    if (cacheKeys.length > 1000) {
      // Sort by timestamp (oldest first)
      const sortedEntries = cacheKeys
        .map(key => ({ key, timestamp: allData[key].timestamp || 0 }))
        .sort((a, b) => a.timestamp - b.timestamp);

      // Remove oldest 100 entries
      const toRemove = sortedEntries.slice(0, 100).map(entry => entry.key);
      await chrome.storage.local.remove(toRemove);
      console.log(`Usher: Evicted ${toRemove.length} old cache entries`);
    }
  } catch (error) {
    console.error("Usher: Cache eviction error", error);
  }
}

/**
 * Simple hash function for URLs
 * @param {string} url - The URL to hash
 * @returns {string} Hash string
 */
function hashUrl(url) {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}