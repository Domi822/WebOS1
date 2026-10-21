from html.parser import HTMLParser
from pathlib import Path
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
namespace = {"widget": "http://www.w3.org/ns/widgets", "tizen": "http://tizen.org/ns/widgets"}
config = ET.parse(ROOT / "config.xml").getroot()
version = config.get("version")
source = (ROOT / "script.js").read_text(encoding="utf-8-sig")
script_version = re.search(r'const VERSION = "([^"]+)"', source)
assert script_version and script_version.group(1) == version, "Tizen and UI versions must match"
assert config.find("widget:name", namespace).text == "Dummy UI"
assert config.find("widget:content", namespace).get("src") == "index.html"
assert config.find("tizen:profile", namespace).get("name") == "tv-samsung"

class MarkupCheck(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = set()
        self.apps = set()
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.add(attrs["id"])
        if "data-app" in attrs:
            self.apps.add(attrs["data-app"])

markup = MarkupCheck()
markup.feed((ROOT / "index.html").read_text(encoding="utf-8-sig"))
for required_id in {"welcome", "modal", "clock", "version-label", "apps"}:
    assert required_id in markup.ids, f"Missing launcher element: {required_id}"
assert markup.apps == {"youtube", "prime", "disney", "netflix", "samsung"}
print(f"Dummy UI {version}: package config and launcher markup OK")
