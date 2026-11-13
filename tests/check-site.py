"""Validate local HTML resources, fragments, unique IDs, SVG and JSON syntax."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from collections import Counter
import json
import xml.etree.ElementTree as ET
ROOT = Path(__file__).resolve().parents[1]
class Document(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.refs, self.ids = [], []
        self.feed(path.read_text())
    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        for attr in ('href', 'src'):
            if attr in attrs:
                self.refs.append(attrs[attr])
docs = {p: Document(p) for p in ROOT.rglob('*.html') if '.git' not in p.parts and 'node_modules' not in p.parts}
errors = []
for path, doc in docs.items():
    errors += [f'{path.relative_to(ROOT)}: duplicate ID {id}' for id, n in Counter(doc.ids).items() if n > 1]
    for ref in doc.refs:
        url = urlsplit(ref)
        if url.scheme or url.netloc:
            continue
        target = (path.parent / unquote(url.path)).resolve() if url.path else path
        if not target.exists():
            errors.append(f'{path.relative_to(ROOT)}: missing {ref}')
        elif url.fragment and target in docs and unquote(url.fragment) not in docs[target].ids:
            errors.append(f'{path.relative_to(ROOT)}: missing fragment {ref}')
for path in ROOT.glob('*.svg'):
    ET.parse(path)
json.loads((ROOT / 'roteiros-etapas.json').read_text())
assert not errors, '\n'.join(errors)
print(f'{len(docs)} HTML pages: all local resources, fragments and IDs valid; SVG and JSON valid.')
