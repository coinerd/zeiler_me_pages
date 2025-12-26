
import json

path = "c:\\Users\\julia\\OneDrive\\Dokumente\\GitHub\\zeiler_me_new\\zeiler_me_new\\frontend\\src\\data\\pages.json"

with open(path, 'r', encoding='utf-8') as f:
    pages = json.load(f)

for page in pages:
    if "rudolf-zeiler" in page.get("path", "") or "Rudolf Zeiler" in page.get("title", ""):
        print(f"Found page: {page['title']} (ID: {page['id']})")
        print(f"Path: {page['path']}")
        print("Body sample:")
        print(page['body'][:500])
        print("--- Body end ---")
        # Print image tags from body
        if "![" in page['body']:
            print("Found image markdown:")
            import re
            images = re.findall(r'!\[.*?\]\(.*?\)', page['body'])
            for img in images:
                print(img)
