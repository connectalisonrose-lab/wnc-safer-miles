#!/usr/bin/env python3
"""Stamp a version on every shared asset so a change reaches browsers at once.
   The version is a hash of the assets themselves, so swapping an icon changes
   its address. Run this after editing site.css, site.js or either icon."""
import re, hashlib, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
ASSETS = ["site.css", "site.js", "favicon.svg", "apple-touch-icon.png"]
PAGES = ["index.html", "about.html", "help.html", "roots.html", "evidence.html", "watch.html"]

h = hashlib.sha1()
for a in ASSETS:
    h.update((ROOT / a).read_bytes())
ver = h.hexdigest()[:8]

for page in PAGES:
    p = ROOT / page
    s = p.read_text(encoding="utf-8")
    for a in ASSETS:
        s = re.sub(r'(href|src)="%s(\?v=[a-f0-9]+)?"' % re.escape(a),
                   lambda m, a=a: '%s="%s?v=%s"' % (m.group(1), a, ver), s)
    p.write_text(s, encoding="utf-8")
print("stamped", ver, "on", len(PAGES), "pages")
