// Regular expression to detect Arabic and Persian characters
const RTL_CHARACTER_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u067E\u0686\u06AF\u200C\u200F]/;

// Allowed HTML tags for applying RTL direction
const ELIGIBLE_RTL_TAGS = ["P", "SPAN", "H1", "H2", "H3", "LI", "OL", "UL"];

// Target website where this script should run
const TARGET_WEBSITE_URL = "https://chat.deepseek.com/";

// Check if the current page is the target website
function isTargetWebsite() {
    return window.location.href.startsWith(TARGET_WEBSITE_URL);
}

// Check if an element is inside a code block (to avoid modifying code snippets)
function isElementInsideCodeBlock(element) {
    return element.closest(".md-code-block") !== null;
}

// Apply RTL direction and right alignment if the element contains Arabic/Persian text
function applyRTLDirection(element) {
    if (!isTargetWebsite() || isElementInsideCodeBlock(element)) return;

    const isListElement = ["UL", "OL", "LI"].includes(element.tagName);
    if (!ELIGIBLE_RTL_TAGS.includes(element.tagName) && !isListElement) return;

    const elementText = element.textContent.trim();
    if (!elementText) return;

    // Check only the first 5 words for Arabic/Persian characters
    if (elementText.split(/\s+/).slice(0, 5).some(word => RTL_CHARACTER_REGEX.test(word))) {
        element.setAttribute("dir", "rtl");
        element.style.textAlign = "right";
    }
}

// Function to process all eligible elements on the page
function processPageForRTLAdjustments() {
    if (!isTargetWebsite()) return;

    requestAnimationFrame(() => {
        const selector = [...ELIGIBLE_RTL_TAGS, "UL", "OL", "LI"].join(", ");
        document.querySelectorAll(selector).forEach(el => applyRTLDirection(el));
    });
}

// MutationObserver to detect dynamic content changes
const domMutationObserver = new MutationObserver(mutations => {
    if (!isTargetWebsite()) return;

    requestAnimationFrame(() => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && !isElementInsideCodeBlock(node)) {
                    if ([...ELIGIBLE_RTL_TAGS, "UL", "OL", "LI"].includes(node.tagName)) {
                        applyRTLDirection(node);
                    }
                    node.querySelectorAll([...ELIGIBLE_RTL_TAGS, "UL", "OL", "LI"].join(", "))
                        .forEach(child => applyRTLDirection(child));
                }
            });
        });
    });
});

// Initialize the script if on the target page
if (isTargetWebsite()) {
    domMutationObserver.observe(document.body, { childList: true, subtree: true });

    // Run scan every 1 second to ensure new responses are detected
    setInterval(processPageForRTLAdjustments, 1000);

    // Initial run to process already loaded elements
    processPageForRTLAdjustments();
}
