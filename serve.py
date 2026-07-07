# Dev server with caching disabled. Plain `python -m http.server` lets the
# browser heuristically cache ES modules, so after an update you can get a
# stale/new module mix (e.g. new main.js calling methods an old questions.js
# doesn't have) — which crashes to a black screen. no-store fixes that.
import http.server
import os
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8137
os.chdir(os.path.dirname(os.path.abspath(__file__)))


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


http.server.ThreadingHTTPServer(('', PORT), NoCacheHandler).serve_forever()
