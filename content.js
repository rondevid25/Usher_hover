console.log("Usher Content Script Loaded!");

// Store the last clicked link element for context extraction
let lastClickedLink = null;

// Hover state tracking
let hoverTimer = null;
let currentHoveredLink = null;

// Content-rich page detection + manual override
let isContentRichPage_cached = null;
let manualOverride = null;

/**
 * STRICT MODE: Only enable hover on CLEAR article pages
 * @returns {boolean} true if hover should be enabled
 */
function isContentRichPage() {
  // Hard excludes - never enable, even if other signals pass
  const hardExcludes = [
    /^https?:\/\/[^/]*\/?$/,  // Homepage only
    /\/pricing/, /\/contact/, /\/signin?/, /\/signup/,
    /\/login/, /\/dashboard/, /\/settings/, /\/admin/,
    /\/cart/, /\/checkout/
  ];

  if (hardExcludes.some(p => p.test(window.location.href))) {
    return false;
  }

  // STRICT Check 1: Semantic HTML (raised threshold)
  if (document.querySelector('article')) {
    return true;
  }

  const main = document.querySelector('main, [role="main"]');
  if (main && main.innerText?.length > 1000) {
    return true;
  }

  // STRICT Check 2: URL patterns (explicit article paths)
  const articleUrls = [
    /\/blog\//, /\/article\//, /\/news\//, /\/post\//,
    /\/story\//, /\/guide\//, /\/tutorial\//, /\/docs\//,
    /\/documentation\//, /\/wikipedia\.org\/wiki\//,
    /\/medium\.com\/@/, /\d{4}\/\d{2}\/\d{2}\//
  ];

  if (articleUrls.some(p => p.test(window.location.href))) {
    return true;
  }

  // STRICT Check 3: Meta tags (explicit article metadata)
  const ogType = document.querySelector('meta[property="og:type"]')?.content;
  if (ogType === 'article' || ogType === 'blog') {
    return true;
  }

  if (document.querySelector('meta[property="article:published_time"]') ||
      document.querySelector('meta[property="datePublished"]')) {
    return true;
  }

  // STRICT MODE: Return false if none of the explicit signals passed
  return false;
}

/**
 * Get saved user preference for this domain
 */
function getManualOverride() {
  const domain = window.location.hostname;
  const saved = localStorage.getItem(`usher_hover_override_${domain}`);
  return saved === null ? null : saved === 'true';
}

/**
 * Save user preference for this domain
 */
function setManualOverride(enabled) {
  const domain = window.location.hostname;
  if (enabled === null) {
    localStorage.removeItem(`usher_hover_override_${domain}`);
  } else {
    localStorage.setItem(`usher_hover_override_${domain}`, String(enabled));
  }
  manualOverride = enabled;
  updateToggleButton();
}

/**
 * Check if hover should be enabled (auto-detection OR manual override)
 */
function isHoverEnabled() {
  if (manualOverride !== null) {
    return manualOverride;  // User override takes precedence
  }
  return isContentRichPage_cached;  // Fall back to auto-detection
}

/**
 * Initialize Usher on page load
 */
function initializeUsher() {
  // Auto-detect content-rich page
  isContentRichPage_cached = isContentRichPage();

  // Load manual override preference
  manualOverride = getManualOverride();

  // Show toggle button
  createToggleButton();

  console.log(`Usher: Auto-detected=${isContentRichPage_cached}, Override=${manualOverride}, Hover enabled=${isHoverEnabled()}`);
}

/**
 * Create floating toggle button for manual hover control
 */
function createToggleButton() {
  // Don't create toggle on excluded pages
  if (/\/(signin|signup|login|admin|dashboard)/.test(window.location.pathname)) {
    return;
  }

  const button = document.createElement('div');
  button.id = 'usher-toggle-btn';
  button.title = 'Toggle Usher hover summaries for this site';

  // Brutalist button styling
  button.style.cssText = `
    position: fixed !important;
    bottom: 20px !important;
    right: 20px !important;
    width: 48px !important;
    height: 48px !important;
    background: #000 !important;
    border: 3px solid #000 !important;
    border-radius: 8px !important;
    cursor: pointer !important;
    z-index: 2147483646 !important;
    box-shadow: 4px 4px 0px rgba(0,0,0,0.3) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif !important;
    font-size: 24px !important;
    font-weight: bold !important;
    color: #fff !important;
    transition: all 0.2s ease !important;
    user-select: none !important;
  `;

  button.innerHTML = 'U';
  document.body.appendChild(button);

  // Update button state
  updateToggleButton();

  // Toggle on click
  button.addEventListener('click', () => {
    const currentState = isHoverEnabled();

    if (manualOverride === null) {
      // First toggle: set opposite of auto-detection
      setManualOverride(!isContentRichPage_cached);
    } else {
      // Subsequent toggles: flip current state
      setManualOverride(!currentState);
    }

    // Show feedback
    showToggleFeedback(isHoverEnabled());
  });
}

/**
 * Update toggle button visual state
 */
function updateToggleButton() {
  const button = document.getElementById('usher-toggle-btn');
  if (!button) return;

  const enabled = isHoverEnabled();

  if (enabled) {
    // Green = hover enabled
    button.style.background = '#10b981 !important';
    button.style.borderColor = '#059669 !important';
    button.title = 'Hover summaries: ON (click to disable)';
  } else {
    // Gray = hover disabled
    button.style.background = '#6b7280 !important';
    button.style.borderColor = '#4b5563 !important';
    button.title = 'Hover summaries: OFF (click to enable)';
  }

  // Show override indicator if manual override is active
  if (manualOverride !== null) {
    button.innerHTML = 'U<sup style="font-size: 10px;">★</sup>';
  } else {
    button.innerHTML = 'U';
  }
}

/**
 * Show brief feedback when toggle is clicked
 */
function showToggleFeedback(enabled) {
  const feedback = document.createElement('div');
  feedback.style.cssText = `
    position: fixed !important;
    bottom: 80px !important;
    right: 20px !important;
    background: #000 !important;
    color: #fff !important;
    padding: 12px 16px !important;
    border-radius: 8px !important;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    z-index: 2147483647 !important;
    box-shadow: 4px 4px 0px rgba(0,0,0,0.3) !important;
    opacity: 0 !important;
    transition: opacity 0.2s ease !important;
  `;

  feedback.textContent = enabled
    ? '✓ Hover summaries enabled for this site'
    : '✗ Hover summaries disabled for this site';

  document.body.appendChild(feedback);

  // Animate in
  requestAnimationFrame(() => {
    feedback.style.opacity = '1';
  });

  // Remove after 2 seconds
  setTimeout(() => {
    feedback.style.opacity = '0';
    setTimeout(() => feedback.remove(), 200);
  }, 2000);
}

// Run detection after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeUsher);
} else {
  initializeUsher();
}

// Capture link clicks to extract context later (for right-click)
document.addEventListener('contextmenu', (event) => {
  const target = event.target.closest('a');
  if (target && target.href) {
    lastClickedLink = target;
  }
}, true);

// Hover detection for automatic summary trigger
document.addEventListener('mouseenter', (event) => {
  const link = event.target.closest('a[href]');
  if (!link) return;

  // Skip toggle button itself
  if (event.target.id === 'usher-toggle-btn') {
    return;
  }

  // Check if hover is enabled (auto-detection OR manual override)
  if (!isHoverEnabled()) {
    return; // Right-click still works everywhere
  }

  // Clear any existing timer
  clearTimeout(hoverTimer);
  currentHoveredLink = link;

  // Set 500ms delay before triggering summary
  hoverTimer = setTimeout(() => {
    if (currentHoveredLink === link) {
      triggerSummaryFromHover(link);
    }
  }, 500);
}, true);

document.addEventListener('mouseleave', (event) => {
  const link = event.target.closest('a[href]');
  if (link === currentHoveredLink) {
    clearTimeout(hoverTimer);
    currentHoveredLink = null;
  }
}, true);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "PING") {
    // Respond to ping to confirm content script is loaded
    sendResponse({status: "ready"});
    return true;
  }

  if (request.action === "EXTRACT_CONTEXT") {
    // Extract context from the last clicked link
    const context = extractLinkContext(request.linkUrl);
    sendResponse(context);
    return true;
  }

  if (request.action === "SHOW_LOADING") {
    renderUsherBox("Ushering in your summary... please wait.");
    sendResponse({status: "received"});
  } else if (request.action === "SHOW_SUMMARY") {
    renderUsherBox(request.text);
    sendResponse({status: "received"});
  } else if (request.action === "SHOW_ERROR") {
    renderUsherBox("Error: Could not reach the brain. Please check your connection.");
    sendResponse({status: "received"});
  }
  return true;
});

/**
 * Extract context from a link element
 * @param {string} linkUrl - The URL of the clicked link
 * @returns {Object} Context data including anchor text and surrounding text
 */
function extractLinkContext(linkUrl) {
  try {
    // Find the link element by URL
    let linkElement = lastClickedLink;

    // Fallback: search for link by href if lastClickedLink is not available
    if (!linkElement || linkElement.href !== linkUrl) {
      const links = document.querySelectorAll('a[href]');
      linkElement = Array.from(links).find(link => link.href === linkUrl);
    }

    if (!linkElement) {
      return {
        anchorText: "",
        surroundingContext: "",
        success: false
      };
    }

    // Extract anchor text
    const anchorText = linkElement.textContent.trim();

    // Extract surrounding context (sentences before and after)
    const surroundingContext = extractSurroundingText(linkElement);

    return {
      anchorText,
      surroundingContext,
      success: true
    };
  } catch (error) {
    console.error("Usher: Error extracting context", error);
    return {
      anchorText: "",
      surroundingContext: "",
      success: false
    };
  }
}

/**
 * Extract text surrounding a link element (2 sentences before and after)
 * @param {HTMLElement} linkElement - The link element
 * @returns {string} Surrounding text context
 */
function extractSurroundingText(linkElement) {
  try {
    // Find the parent paragraph or container
    let container = linkElement.closest('p, div, article, section, li');

    if (!container) {
      container = linkElement.parentElement;
    }

    if (!container) {
      return "";
    }

    // Get all text from the container
    const fullText = container.textContent.trim();

    // Find the position of the anchor text in the full text
    const anchorText = linkElement.textContent.trim();
    const anchorPosition = fullText.indexOf(anchorText);

    if (anchorPosition === -1) {
      return fullText.slice(0, 300); // Return first 300 chars if anchor not found
    }

    // Extract text before and after the anchor
    const beforeText = fullText.slice(0, anchorPosition);
    const afterText = fullText.slice(anchorPosition + anchorText.length);

    // Extract sentences (simple approach: split by periods)
    const sentencesBefore = extractSentences(beforeText, false); // Get last 2 sentences
    const sentencesAfter = extractSentences(afterText, true);    // Get first 2 sentences

    // Combine context
    const context = [
      ...sentencesBefore.slice(-2),
      anchorText,
      ...sentencesAfter.slice(0, 2)
    ].join(' ').trim();

    // Limit to 500 characters
    return context.slice(0, 500);

  } catch (error) {
    console.error("Usher: Error extracting surrounding text", error);
    return "";
  }
}

/**
 * Extract sentences from text
 * @param {string} text - Text to extract sentences from
 * @param {boolean} fromStart - Extract from start (true) or end (false)
 * @returns {Array<string>} Array of sentences
 */
function extractSentences(text, fromStart) {
  // Split by sentence endings (., !, ?)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

  if (fromStart) {
    return sentences;
  } else {
    return sentences.reverse();
  }
}

/**
 * Trigger summary from hover event
 * @param {HTMLElement} linkElement - The hovered link element
 */
function triggerSummaryFromHover(linkElement) {
  const url = linkElement.href;
  if (!url) return;

  // Set as lastClickedLink so positioning and context extraction work
  lastClickedLink = linkElement;

  // Send message to background script to handle summarization
  chrome.runtime.sendMessage({
    action: "HOVER_SUMMARIZE",
    url: url
  });
}

function renderUsherBox(message) {
  // Remove any existing box first
  const existingBox = document.getElementById("usher-box");
  if (existingBox) {
    existingBox.remove();
  }

  // Remove any existing link highlights
  const existingHighlight = document.querySelector('.usher-highlighted-link');
  if (existingHighlight) {
    existingHighlight.classList.remove('usher-highlighted-link');
  }

  // Create new box
  const box = document.createElement("div");
  box.id = "usher-box";
  document.body.appendChild(box);

  // Calculate initial position with conservative height estimate (for loading state)
  const estimatedHeight = 180;
  const position = calculateBoxPosition(lastClickedLink, estimatedHeight);

  // Highlight the link
  if (lastClickedLink) {
    lastClickedLink.classList.add('usher-highlighted-link');
  }

  // Brutalist styling with dynamic positioning
  box.style.cssText = `
    position: absolute !important;
    top: ${position.top}px !important;
    left: ${position.left}px !important;
    width: 350px !important;
    background-color: #ffffff !important;
    color: #000000 !important;
    border: 4px solid #000000 !important;
    border-radius: 12px !important;
    padding: 24px !important;
    z-index: 2147483647 !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    font-size: 15px !important;
    line-height: 1.6 !important;
    box-shadow: 10px 10px 0px rgba(0,0,0,1) !important;
    text-align: left !important;
    display: block !important;
    opacity: 0 !important;
    transform: scale(0.95) !important;
    transition: opacity 0.2s ease-out, transform 0.2s ease-out, top 0.3s ease-out, left 0.3s ease-out !important;
  `;

  // Add pointer arrow based on direction
  const arrow = document.createElement("div");
  arrow.className = "usher-arrow";

  // Arrow positioning based on direction (right, left, above, below)
  let arrowStyles = '';
  let arrowInnerStyles = '';

  if (position.direction === 'right') {
    arrowStyles = `
      position: absolute !important;
      left: -20px !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
      width: 0 !important;
      height: 0 !important;
      border-top: 15px solid transparent !important;
      border-bottom: 15px solid transparent !important;
      border-right: 20px solid #000000 !important;
      z-index: 2147483648 !important;
    `;
    arrowInnerStyles = `
      position: absolute !important;
      right: -16px !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
      width: 0 !important;
      height: 0 !important;
      border-top: 12px solid transparent !important;
      border-bottom: 12px solid transparent !important;
      border-right: 16px solid #ffffff !important;
    `;
  } else if (position.direction === 'left') {
    arrowStyles = `
      position: absolute !important;
      right: -20px !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
      width: 0 !important;
      height: 0 !important;
      border-top: 15px solid transparent !important;
      border-bottom: 15px solid transparent !important;
      border-left: 20px solid #000000 !important;
      z-index: 2147483648 !important;
    `;
    arrowInnerStyles = `
      position: absolute !important;
      left: -16px !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
      width: 0 !important;
      height: 0 !important;
      border-top: 12px solid transparent !important;
      border-bottom: 12px solid transparent !important;
      border-left: 16px solid #ffffff !important;
    `;
  } else if (position.direction === 'above') {
    arrowStyles = `
      position: absolute !important;
      bottom: -20px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      width: 0 !important;
      height: 0 !important;
      border-left: 15px solid transparent !important;
      border-right: 15px solid transparent !important;
      border-top: 20px solid #000000 !important;
      z-index: 2147483648 !important;
    `;
    arrowInnerStyles = `
      position: absolute !important;
      top: -16px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      width: 0 !important;
      height: 0 !important;
      border-left: 12px solid transparent !important;
      border-right: 12px solid transparent !important;
      border-top: 16px solid #ffffff !important;
    `;
  } else { // below
    arrowStyles = `
      position: absolute !important;
      top: -20px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      width: 0 !important;
      height: 0 !important;
      border-left: 15px solid transparent !important;
      border-right: 15px solid transparent !important;
      border-bottom: 20px solid #000000 !important;
      z-index: 2147483648 !important;
    `;
    arrowInnerStyles = `
      position: absolute !important;
      bottom: -16px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      width: 0 !important;
      height: 0 !important;
      border-left: 12px solid transparent !important;
      border-right: 12px solid transparent !important;
      border-bottom: 16px solid #ffffff !important;
    `;
  }

  arrow.style.cssText = arrowStyles;
  box.appendChild(arrow);

  // Inner arrow (white fill)
  const arrowInner = document.createElement("div");
  arrowInner.style.cssText = arrowInnerStyles;
  arrow.appendChild(arrowInner);

  box.innerHTML += `
    <div style="font-weight: bold !important; margin-bottom: 12px !important; color: #000 !important; border-bottom: 2px solid #000 !important; padding-bottom: 5px !important; font-size: 18px !important;">
      Usher Summary
    </div>
    <div style="color: #000 !important; margin-bottom: 20px !important; display: block !important;">
      ${message}
    </div>
    <button id="close-usher-btn" style="
      cursor: pointer !important;
      background: #000 !important;
      color: #fff !important;
      border: none !important;
      padding: 10px 16px !important;
      border-radius: 8px !important;
      font-weight: bold !important;
      width: 100% !important;
      text-transform: uppercase !important;
    ">Close</button>
  `;

  // Inject highlight styles if not already present
  if (!document.getElementById('usher-highlight-styles')) {
    const style = document.createElement('style');
    style.id = 'usher-highlight-styles';
    style.textContent = `
      .usher-highlighted-link {
        background-color: #fffacd !important;
        padding: 2px 4px !important;
        border-radius: 3px !important;
        transition: background-color 0.2s ease !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Animate in
  requestAnimationFrame(() => {
    box.style.opacity = '1';
    box.style.transform = 'scale(1)';
  });

  // After content is rendered, check if we need to reposition based on actual height
  requestAnimationFrame(() => {
    setTimeout(() => {
      const actualHeight = box.offsetHeight;

      // If actual height differs significantly from estimate, recalculate position
      if (Math.abs(actualHeight - estimatedHeight) > 30) {
        const newPosition = calculateBoxPosition(lastClickedLink, actualHeight);

        // Only reposition if direction changed or position differs significantly
        const positionChanged =
          newPosition.direction !== position.direction ||
          Math.abs(newPosition.top - position.top) > 20 ||
          Math.abs(newPosition.left - position.left) > 20;

        if (positionChanged) {
          // Smoothly update position
          box.style.top = newPosition.top + 'px';
          box.style.left = newPosition.left + 'px';

          // Update arrow if direction changed
          if (newPosition.direction !== position.direction) {
            updateArrowDirection(arrow, arrowInner, newPosition.direction);
          }
        }
      }
    }, 50); // Small delay to ensure content is fully rendered
  });

  // Close button handler
  document.getElementById("close-usher-btn").onclick = () => {
    box.remove();
    if (lastClickedLink) {
      lastClickedLink.classList.remove('usher-highlighted-link');
    }
  };

  // Close on click outside
  setTimeout(() => {
    document.addEventListener('click', function closeOnClickOutside(e) {
      if (!box.contains(e.target) && e.target !== lastClickedLink) {
        box.remove();
        if (lastClickedLink) {
          lastClickedLink.classList.remove('usher-highlighted-link');
        }
        document.removeEventListener('click', closeOnClickOutside);
      }
    }, { once: false });
  }, 100);
}

/**
 * Update arrow direction when box repositions
 * @param {HTMLElement} arrow - The arrow element
 * @param {HTMLElement} arrowInner - The inner arrow element
 * @param {string} direction - New direction (right, left, above, below)
 */
function updateArrowDirection(arrow, arrowInner, direction) {
  if (direction === 'right') {
    arrow.style.cssText = `
      position: absolute !important;
      left: -20px !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
      width: 0 !important;
      height: 0 !important;
      border-top: 15px solid transparent !important;
      border-bottom: 15px solid transparent !important;
      border-right: 20px solid #000000 !important;
      z-index: 2147483648 !important;
    `;
    arrowInner.style.cssText = `
      position: absolute !important;
      right: -16px !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
      width: 0 !important;
      height: 0 !important;
      border-top: 12px solid transparent !important;
      border-bottom: 12px solid transparent !important;
      border-right: 16px solid #ffffff !important;
    `;
  } else if (direction === 'left') {
    arrow.style.cssText = `
      position: absolute !important;
      right: -20px !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
      width: 0 !important;
      height: 0 !important;
      border-top: 15px solid transparent !important;
      border-bottom: 15px solid transparent !important;
      border-left: 20px solid #000000 !important;
      z-index: 2147483648 !important;
    `;
    arrowInner.style.cssText = `
      position: absolute !important;
      left: -16px !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
      width: 0 !important;
      height: 0 !important;
      border-top: 12px solid transparent !important;
      border-bottom: 12px solid transparent !important;
      border-left: 16px solid #ffffff !important;
    `;
  } else if (direction === 'above') {
    arrow.style.cssText = `
      position: absolute !important;
      bottom: -20px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      width: 0 !important;
      height: 0 !important;
      border-left: 15px solid transparent !important;
      border-right: 15px solid transparent !important;
      border-top: 20px solid #000000 !important;
      z-index: 2147483648 !important;
    `;
    arrowInner.style.cssText = `
      position: absolute !important;
      top: -16px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      width: 0 !important;
      height: 0 !important;
      border-left: 12px solid transparent !important;
      border-right: 12px solid transparent !important;
      border-top: 16px solid #ffffff !important;
    `;
  } else { // below
    arrow.style.cssText = `
      position: absolute !important;
      top: -20px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      width: 0 !important;
      height: 0 !important;
      border-left: 15px solid transparent !important;
      border-right: 15px solid transparent !important;
      border-bottom: 20px solid #000000 !important;
      z-index: 2147483648 !important;
    `;
    arrowInner.style.cssText = `
      position: absolute !important;
      bottom: -16px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      width: 0 !important;
      height: 0 !important;
      border-left: 12px solid transparent !important;
      border-right: 12px solid transparent !important;
      border-bottom: 16px solid #ffffff !important;
    `;
  }
}

/**
 * Calculate optimal position for the summary box relative to the clicked link
 * Prioritizes: RIGHT → LEFT → ABOVE → BELOW
 * @param {HTMLElement} linkElement - The clicked link element
 * @param {number} boxHeight - Height of the box (can be estimated or actual)
 * @returns {Object} Position object with top, left, and direction properties
 */
function calculateBoxPosition(linkElement, boxHeight = 250) {
  const boxWidth = 350;
  const arrowSize = 20;
  const gap = 10;
  const padding = 20; // Minimum padding from viewport edges

  // Default fallback position (center of viewport)
  if (!linkElement) {
    return {
      top: window.scrollY + 100,
      left: (window.innerWidth - boxWidth) / 2,
      direction: 'above'
    };
  }

  // Get link position relative to viewport
  const linkRect = linkElement.getBoundingClientRect();
  const linkCenterY = linkRect.top + linkRect.height / 2;

  // Convert to absolute page coordinates
  const linkTop = linkRect.top + window.scrollY;
  const linkBottom = linkRect.bottom + window.scrollY;
  const linkLeft = linkRect.left + window.scrollX;
  const linkRight = linkRect.right + window.scrollX;

  // Calculate available space in each direction (viewport-relative)
  const spaceRight = window.innerWidth - linkRect.right;
  const spaceLeft = linkRect.left;
  const spaceAbove = linkRect.top;
  const spaceBelow = window.innerHeight - linkRect.bottom;

  // Required space for each direction
  const requiredHorizontalSpace = boxWidth + arrowSize + gap + padding;
  const requiredVerticalSpace = boxHeight + arrowSize + gap + padding;

  let top, left, direction;

  // Priority 1: RIGHT of link (if enough space)
  if (spaceRight >= requiredHorizontalSpace) {
    direction = 'right';
    left = linkRight + arrowSize + gap;
    top = linkTop + (linkRect.height / 2) - (boxHeight / 2);

    // Adjust if box would go off top edge
    if (linkCenterY - boxHeight / 2 < padding) {
      top = window.scrollY + padding;
    }

    // Adjust if box would go off bottom edge
    if (linkCenterY + boxHeight / 2 > window.innerHeight - padding) {
      top = window.scrollY + window.innerHeight - boxHeight - padding;
    }
  }
  // Priority 2: LEFT of link (if enough space)
  else if (spaceLeft >= requiredHorizontalSpace) {
    direction = 'left';
    left = linkLeft - boxWidth - arrowSize - gap;
    top = linkTop + (linkRect.height / 2) - (boxHeight / 2);

    // Adjust if box would go off top edge
    if (linkCenterY - boxHeight / 2 < padding) {
      top = window.scrollY + padding;
    }

    // Adjust if box would go off bottom edge
    if (linkCenterY + boxHeight / 2 > window.innerHeight - padding) {
      top = window.scrollY + window.innerHeight - boxHeight - padding;
    }
  }
  // Priority 3: ABOVE link (if enough space)
  else if (spaceAbove >= requiredVerticalSpace) {
    direction = 'above';
    top = linkTop - boxHeight - arrowSize - gap;
    left = linkLeft + (linkRect.width / 2) - (boxWidth / 2);

    // Adjust if box would go off left edge
    if (left < padding) {
      left = padding;
    }

    // Adjust if box would go off right edge
    if (left + boxWidth > window.innerWidth - padding) {
      left = window.innerWidth - boxWidth - padding;
    }
  }
  // Priority 4: BELOW link (fallback - always use if nothing else fits)
  else {
    direction = 'below';
    top = linkBottom + arrowSize + gap;
    left = linkLeft + (linkRect.width / 2) - (boxWidth / 2);

    // Adjust if box would go off left edge
    if (left < padding) {
      left = padding;
    }

    // Adjust if box would go off right edge
    if (left + boxWidth > window.innerWidth - padding) {
      left = window.innerWidth - boxWidth - padding;
    }
  }

  return { top, left, direction };
}