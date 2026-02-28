from playwright.sync_api import sync_playwright
import json
import sys

def analyze():
    print("Starting analysis...")
    with sync_playwright() as p:
        try:
            print("Launching browser...")
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            url = "https://tafa-business.com"
            print(f"Navigating to {url}...")
            page.goto(url, timeout=60000)
            
            print("Waiting for network idle...")
            try:
                page.wait_for_load_state("networkidle", timeout=10000)
            except:
                print("Network idle timeout, proceeding anyway...")
            
            print("Extracting styles...")
            # Extract styles using evaluate
            styles = page.evaluate("""() => {
                const getStyle = (el, prop) => {
                    if (!el) return null;
                    return window.getComputedStyle(el).getPropertyValue(prop);
                };
                
                const header = document.querySelector('header') || document.querySelector('.header') || document.querySelector('#header');
                const footer = document.querySelector('footer') || document.querySelector('.footer');
                const body = document.body;
                
                // Try to find a primary button or active link
                const primaryBtn = document.querySelector('button[class*="primary"]') || 
                                  document.querySelector('.btn-primary') || 
                                  document.querySelector('a[class*="button"]') ||
                                  document.querySelector('button');
                
                const rgbToHex = (rgb) => {
                    if (!rgb || rgb === 'rgba(0, 0, 0, 0)') return null;
                    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
                    if (!match) return rgb;
                    return "#" + match.slice(1).map(x => (+x).toString(16).padStart(2, '0')).join('');
                };

                return {
                    colors: {
                        header_bg: rgbToHex(getStyle(header, 'background-color')),
                        body_bg: rgbToHex(getStyle(body, 'background-color')),
                        footer_bg: rgbToHex(getStyle(footer, 'background-color')),
                        primary_btn_bg: rgbToHex(getStyle(primaryBtn, 'background-color')),
                        text_color: rgbToHex(getStyle(body, 'color'))
                    },
                    fonts: {
                        headings: getStyle(document.querySelector('h1, h2, h3'), 'font-family'),
                        body: getStyle(body, 'font-family')
                    },
                    meta: {
                        title: document.title
                    }
                };
            }""")
            
            print("Styles extracted:")
            print(json.dumps(styles, indent=2))
            
            page.screenshot(path="tafa_design.png")
            print("Screenshot saved to tafa_design.png")
            
            browser.close()
            
        except Exception as e:
            print(f"Error: {e}")
            sys.exit(1)

if __name__ == "__main__":
    analyze()
