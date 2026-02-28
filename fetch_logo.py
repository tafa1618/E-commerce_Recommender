from playwright.sync_api import sync_playwright
import requests
import os

def fetch_logo():
    print("Fetching logo...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("https://tafa-business.com", timeout=60000)
        
        # Try multiple selectors for the logo
        logo_url = page.evaluate("""() => {
            const img = document.querySelector('.elementor-widget-theme-site-logo img, .site-logo img, header img');
            return img ? img.src : null;
        }""")
        
        if logo_url:
            print(f"Logo found: {logo_url}")
            response = requests.get(logo_url)
            if response.status_code == 200:
                save_path = "e:\\E-commerce_Recommender\\Marketplace\\public\\logo-Tafa.png"
                with open(save_path, "wb") as f:
                    f.write(response.content)
                print(f"Logo saved to {save_path}")
            else:
                print("Failed to download logo file.")
        else:
            print("Logo element not found.")
            
        browser.close()

if __name__ == "__main__":
    fetch_logo()
