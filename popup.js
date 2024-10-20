chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
        console.error('No active tab found');
        return;
    }

    const tabUrl = tabs[0].url;

    if (tabUrl.startsWith('chrome://') || tabUrl.startsWith('chrome-extension://')) {
        console.warn('Cannot execute script on chrome:// or chrome-extension:// URLs');
        return; 
    }

    chrome.scripting.executeScript(
        {
            target: { tabId: tabs[0].id },
            func: () => {
                const fonts = new Set();

                // جستجو در استایل شیت‌های خارجی
                const styleSheets = [...document.styleSheets];

                for (const sheet of styleSheets) {
                    try {
                        for (const rule of sheet.cssRules) {
                            if (rule instanceof CSSFontFaceRule) {
                                const fontFamily = rule.style.getPropertyValue('font-family');
                                const fontWeight = rule.style.getPropertyValue('font-weight') || 'normal';
                                fonts.add(`${fontFamily.trim()} (Weight: ${fontWeight.trim()})`);
                            } else if (rule.style && rule.style.fontFamily) {
                                const fontFamily = rule.style.fontFamily.split(',')[0].trim(); // فقط خانواده‌ی اول
                                fonts.add(`${fontFamily} (Weight: ${rule.style.fontWeight || 'normal'})`);
                            }
                        }
                    } catch (e) {
                        console.warn('Cannot access CSS rules: ', e);
                    }
                }

                // جستجوی فونت‌های بارگذاری شده با جاوا اسکریپت
                const computedStyleElements = document.querySelectorAll('*');
                computedStyleElements.forEach(element => {
                    const computedStyle = window.getComputedStyle(element);
                    const fontFamily = computedStyle.fontFamily.split(',')[0].trim(); // فقط خانواده‌ی اول
                    if (fontFamily) {
                        fonts.add(fontFamily);
                    }
                });

                return Array.from(fonts);
            }
        },
        (results) => {
            if (chrome.runtime.lastError) {
                console.error(`Error in executeScript: ${chrome.runtime.lastError.message}`);
                return;
            }

            const fontList = results[0]?.result || [];
            const listElement = document.getElementById('fontList');
            listElement.innerHTML = '';

            if (fontList.length === 0) {
                const noFontsMessage = document.createElement('li');
                noFontsMessage.textContent = 'هیچ فونتی پیدا نشد';
                listElement.appendChild(noFontsMessage);
            } else {
                fontList.forEach((font) => {
                    const listItem = document.createElement('li');
                    listItem.textContent = font;
                    listElement.appendChild(listItem);
                });
            }
        }
    );
});
