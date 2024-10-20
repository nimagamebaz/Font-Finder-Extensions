function getFontsFromStylesheets() {
    let fonts = new Set();
    for (const sheet of document.styleSheets) {
        try {
            for (const rule of sheet.cssRules) {
                if (rule instanceof CSSFontFaceRule) {
                    const fontFamily = rule.style.getPropertyValue('font-family');
                    const fontWeight = rule.style.getPropertyValue('font-weight') || 'normal';
                    fonts.add(`${fontFamily.trim()} (Weight: ${fontWeight.trim()})`);
                }
            }
        } catch (e) {
            console.warn('Cannot access CSS rules: ', e);
        }
    }
    return Array.from(fonts);
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getFonts') {
        const fonts = getFontsFromStylesheets();
        sendResponse({ fonts: fonts });
    }
});
