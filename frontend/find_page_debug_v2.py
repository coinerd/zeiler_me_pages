
import json
import re

path = "c:\\Users\\julia\\OneDrive\\Dokumente\\GitHub\\zeiler_me_new\\zeiler_me_new\\frontend\\src\\data\\pages.json"

output = {}

with open(path, 'r', encoding='utf-8') as f:
    pages = json.load(f)

for page in pages:
    if "rudolf-zeiler" in page.get("path", ""):
        output['title'] = page['title']
        output['path'] = page['path']
        output['body_snippet'] = page['body'][:500]
        output['images'] = re.findall(r'!\[.*?\]\(.*?\)', page['body'])
        output['full_body'] = page['body']
        break

with open("debug_result.json", "w", encoding='utf-8') as f:
    json.dump(output, f, indent=2)
