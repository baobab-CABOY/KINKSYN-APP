"""Headless smoke test. Run from repo root:  python3 tests/smoke.py
Serves the repo on a local port, drives the main flows in Chromium, fails on JS errors.
CDN failures (Tailwind/Fonts offline) are ignored; layout is not checked, only behaviour.
"""
import functools, http.server, socketserver, sys, threading
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
PORT = 8765


def serve():
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
    handler.log_message = lambda *a: None
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(("127.0.0.1", PORT), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def main():
    httpd = serve()
    errors, steps = [], []
    url = f"http://127.0.0.1:{PORT}/index.html"

    def ok(name, cond):
        steps.append(("PASS" if cond else "FAIL", name))

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome") if "--chrome" in sys.argv else p.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 900})
        page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
        page.on("console", lambda m: m.type == "error" and "Failed to load resource" not in m.text
                and "tailwind" not in m.text.lower() and errors.append(f"console: {m.text}"))
        page.route("**/*", lambda r: r.abort() if "127.0.0.1" not in r.request.url else r.continue_())
        page.add_init_script("window.tailwind = window.tailwind || {};")

        page.goto(url)
        page.wait_for_function("window.app && app.view === 'landing'")
        ok("landing renders", page.locator("text=Quick Pulse").count() > 0)

        # Quick quiz: answer all 10 and finish
        page.evaluate("app.startQuiz('quick')")
        for _ in range(10):
            page.evaluate("app.selectAnswer('core')")
            page.evaluate("app.nextQuestion()")
        ok("quick quiz -> graph", page.evaluate("app.view") == "graph")
        ok("profile has 17 scored nodes + core", len(page.evaluate("Object.keys(app.profile.nodes)")) == 18)

        # Demo profile + graph canvas
        page.evaluate("app.loadDemoProfile()")
        page.wait_for_timeout(300)
        ok("graph engine running", page.evaluate("!!app.graphEngine"))
        ok("demo hard limit (impact)", page.evaluate("app.profile.nodes.impact.statusTag") == "Hard Limit")

        # Lenses, filters, drawer tabs
        for lens in ["receiving", "giving", "overlay"]:
            page.evaluate(f"app.setPolarityView('{lens}')")
        for f in ["active", "fantasy", "all"]:
            page.evaluate(f"app.setFilterMode('{f}')")
        for t in ["refine", "journal", "guide"]:
            page.evaluate(f"app.setDrawerTab('{t}')")
        ok("drawer renders", page.locator("#insightDrawer h2").count() == 1)

        # Live refine
        page.evaluate("app.updateLiveNodeState('restraint', 'limit', undefined)")
        ok("live refine sets limit", page.evaluate("app.profile.nodes.restraint.statusTag") == "Hard Limit")

        # Journal + escaping
        page.evaluate("app.selectGraphNode('surrender'); app.setDrawerTab('journal')")
        page.fill("#journalNoteInput", "<img src=x onerror=window.__xss=1>note")
        page.evaluate("app.addJournalEntry('surrender')")
        ok("journal entry saved", page.evaluate("app.journalEntries.length") == 1)
        ok("journal note escaped", page.evaluate("!window.__xss") and page.locator("#insightDrawer img").count() == 0)

        # Modals open + close (closeModal)
        for open_fn, mid in [("openVaultModal", "vaultModal"), ("openEthicsModal", "ethicsModal"),
                             ("openPngExportModal", "pngModal"), ("openShareModal", "shareModal")]:
            page.evaluate(f"app.{open_fn}()")
            shown = page.evaluate(f"!document.getElementById('{mid}').classList.contains('hidden')")
            page.evaluate(f"app.closeModal('{mid}')")
            hidden = page.evaluate(f"document.getElementById('{mid}').classList.contains('hidden')")
            ok(f"{mid} opens/closes", shown and hidden)
        ok("png rendered", page.evaluate("(app.lastPosterDataUrl||'').startsWith('data:image/png')"))

        # Share encode/decode round trip + partner presets
        rt = page.evaluate("""(() => {
            const code = app.encodeProfile(app.profile, 'full');
            const d = app.decodeProfile('#synapse=' + code);
            return d.nodes.surrender.score === app.profile.nodes.surrender.score
                && d.nodes.restraint.statusTag === 'Hard Limit';
        })()""")
        ok("share link round trip", rt)
        vibe = page.evaluate("Object.keys(JSON.parse(atob(app.encodeProfile(app.profile,'vibe')))).length")
        ok("vibe scope is smaller", 0 < vibe < 17)
        page.evaluate("app.openShareModal(); app.loadPartnerPreset('river')")
        ok("dyad report renders", page.locator("text=Dyad Synthesis Report").count() > 0)
        page.evaluate("app.closeShareModal()")

        # Vault: encrypted save, reload, unlock
        page.evaluate("app.persistVault('test-pass')")
        page.wait_for_timeout(800)
        page.reload()
        page.wait_for_function("window.app")
        ok("vault locked after reload", page.evaluate("app.vaultStatus") == "locked")
        unlocked = page.evaluate("app.unlockVaultWithPassphrase('test-pass')")
        ok("vault unlock", unlocked and page.evaluate("app.journalEntries.length") == 1)

        browser.close()
    httpd.shutdown()

    for status, name in steps:
        print(f"{status}  {name}")
    for e in errors:
        print("ERROR ", e)
    failed = [s for s in steps if s[0] == "FAIL"] or errors
    print("\nRESULT:", "FAIL" if failed else "OK", f"({len(steps)} checks, {len(errors)} errors)")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
