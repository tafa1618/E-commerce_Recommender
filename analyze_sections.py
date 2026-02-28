from playwright.sync_api import sync_playwright
import json
import sys
import time

def analyze_sections():
    print("Starting section analysis...")
    with sync_playwright() as p:
        try:
            print("Launching browser...")
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(viewport={"width": 1280, "height": 2000}) # Large height to capture more
            page = context.new_page()
            
            url = "https://tafa-business.com"
            print(f"Navigating to {url}...")
            page.goto(url, timeout=60000)
            
            print("Waiting for load...")
            page.wait_for_load_state("networkidle", timeout=10000)
            
            # Scroll down to load lazy content
            print("Scrolling...")
            page.evaluate("window.scrollTo(0, 800)")
            time.sleep(2)
            page.evaluate("window.scrollTo(0, 1600)")
            time.sleep(2)
            
            # Extract section titles and structure
            print("Extracting structure...")
            structure = page.evaluate("""() => {
                const sections = [];
                document.querySelectorAll('section, .row, .container').forEach(el => {
                    const title = el.querySelector('h2, h3, .section-title, .title');
                    if (title && title.innerText.trim().length > 0) {
                        sections.push({
                            title: title.innerText.trim(),
                            type: el.tagName.toLowerCase(),
                            classes: el.className,
                            hasGrid: el.querySelector('.grid, .row') ? true : false,
                            itemCount: el.querySelectorAll('.product, .card, .item').length
                        });
                    }
                });
                return sections;
            }""")
            
            print("Sections found:")
            print(json.dumps(structure, indent=2))
            
            # Take a full page screenshot
            page.screenshot(path="tafa_sections_full.png", full_page=True)
            print("Screenshot saved to tafa_sections_full.png")
            
            browser.close()
            
        except Exception as e:
            print(f"Error: {e}")
            sys.exit(1)

if __name__ == "__main__":
    analyze_sections()
