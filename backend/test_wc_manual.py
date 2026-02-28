import requests
import os
from dotenv import load_dotenv
import base64

load_dotenv()

url = os.getenv("WC_URL").rstrip('/') + "/wp-json/wc/v3/products/"
ck = os.getenv("WC_CONSUMER_KEY")
cs = os.getenv("WC_CONSUMER_SECRET")

print(f"Testing URL: {url}")
print(f"CK: {ck[:10]}... CS: {cs[:10]}...")

# Method 1: Query String Auth
print("\n--- Method 1: Query String Auth ---")
params = {
    "consumer_key": ck,
    "consumer_secret": cs,
    "per_page": 1
}
try:
    r1 = requests.get(url, params=params, timeout=10, allow_redirects=True)
    print(f"Status: {r1.status_code}")
    if r1.history:
        print("Redirect History:")
        for h in r1.history:
            print(f"  {h.status_code} -> {h.url}")
    print(f"Final URL: {r1.url}")
    print(f"Response: {r1.text[:200]}")
except Exception as e:
    print(f"Error Method 1: {e}")

# Method 2: Basic Auth Header
print("\n--- Method 2: Basic Auth Header ---")
try:
    r2 = requests.get(url, auth=(ck, cs), params={"per_page": 1}, timeout=10, allow_redirects=True)
    print(f"Status: {r2.status_code}")
    print(f"Final URL: {r2.url}")
    print(f"Response: {r2.text[:200]}")
except Exception as e:
    print(f"Error Method 2: {e}")

# Method 3: Try with WWW
if "www." not in url:
    print("\n--- Method 3: Trying with WWW ---")
    www_url = url.replace("https://", "https://www.")
    try:
        r3 = requests.get(www_url, params=params, timeout=10)
        print(f"Status: {r3.status_code}")
        print(f"Response: {r3.text[:200]}")
    except Exception as e:
        print(f"Error Method 3: {e}")
