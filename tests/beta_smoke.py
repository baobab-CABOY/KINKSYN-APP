"""Headless beta tests (Snapshot, Deep Map, Neural Node Map, privacy, vault migration).
Run from repo root:  python3 tests/beta_smoke.py      Synthetic data only.
"""
import functools, http.server, json, socketserver, sys, threading
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
PORT = 8766
KEY = 'synapse_v4_vault'
MARK_NOTEBOOK = 'SYNTH_NOTEBOOK_7731'
MARK_BOUNDARY = 'SYNTH_BOUNDARY_4417'
MARK_NOTE = 'SYNTH_NOTE_2290'


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

    def new_page(browser, **ctx):
        context = browser.new_context(**ctx)
        page = context.new_page()
        page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
        page.on("console", lambda m: m.type == "error" and "Failed to load resource" not in m.text
                and errors.append(f"console: {m.text}"))
        page.route("**/*", lambda r: r.abort() if "127.0.0.1" not in r.request.url else r.continue_())
        page.goto(url)
        page.wait_for_function("window.app && app.view")
        return page

    def stored(page):
        return page.evaluate(f"JSON.parse(localStorage.getItem('{KEY}') || 'null')")

    with sync_playwright() as p:
        browser = p.chromium.launch()

        # ---------- 1. Gate, Snapshot (partial), map ----------
        page = new_page(browser, viewport={"width": 1280, "height": 900})
        page.evaluate("app.openBeta('snapshot')")
        page.wait_for_function("app.view === 'beta'")
        ok("18+ gate shown before questionnaire", page.evaluate("app.betaRoute") == "gate")
        page.evaluate("app.betaConfirmAge()")
        ok("gate requires checkbox", page.evaluate("app.betaRoute") == "gate" and not page.evaluate("app.beta.ageConfirmedAt"))
        page.check("#betaAgeCheck")
        page.evaluate("app.betaConfirmAge()")
        ok("gate continues to requested route", page.evaluate("app.betaRoute") == "snapshot")
        ok("beta never computes a legacy profile", page.evaluate("app.profile") is None)

        page.evaluate("app.betaSnapGo(3)")  # SNAP_04 domains
        page.get_by_role("button", name="Power, authority & exchange").click()
        page.get_by_role("button", name="Sensation & impact").click()
        page.evaluate("app.betaSnapGo(4)")  # SNAP_05 states per selected domain
        domain_box = page.locator("section >> div.p-3", has_text="Power, authority & exchange")
        domain_box.get_by_role("button", name="Curious").click()
        domain_box.get_by_role("button", name="Fantasy / imagination").click()
        ok("domain multi-state stored", sorted(page.evaluate("app.beta.domainResponses.DOM_POWER_EXCHANGE.relationship_states")) == ["curious", "fantasy_only"])
        page.evaluate("app.betaSnapGo(8)")
        ok("review lists skipped answers", page.locator("text=Skipped").count() >= 3)
        page.get_by_role("button", name="Save & see my map").click()
        ok("partial Snapshot produces a map", page.evaluate("app.betaRoute") == "map" and page.locator("#betaSvg .beta-node").count() > 0)
        ok("map starts on Snapshot areas (view filter)", page.locator("text=Showing 2 selected areas").count() == 1)
        page.get_by_role("button", name="Show all areas").click()
        ok("all 47 taxonomy nodes render", page.locator("#betaSvg .beta-node").count() == 47)
        ok("unanswered concepts render neutral", page.locator('#betaSvg .beta-node[data-id="ACT_TICKLING"]').get_attribute("data-status") == "unanswered")
        ok("answered area carries its states", page.locator('#betaSvg .beta-node[data-id="DOM_POWER_EXCHANGE"]').get_attribute("data-states") == "curious fantasy_only")
        ok("no percentages/scores on the map", "%" not in page.inner_text("#appRoot"))

        # ---------- 2. Deep Map concept answers ----------
        page.evaluate("app.betaGo('deep', 'DEEP_B')")
        page.evaluate("app.betaExpandConcept('ACT_BONDAGE_RESTRAINT')")
        ed = page.locator('[data-concept-editor="ACT_BONDAGE_RESTRAINT"]')
        ed.get_by_role("button", name="Curious", exact=True).click()
        ed = page.locator('[data-concept-editor="ACT_BONDAGE_RESTRAINT"]')
        ed.get_by_role("button", name="Would like to explore").click()
        ed = page.locator('[data-concept-editor="ACT_BONDAGE_RESTRAINT"]')
        ed.get_by_role("button", name="Receiving").click()
        rec = page.evaluate("app.beta.responses.ACT_BONDAGE_RESTRAINT")
        ok("concept stores multiple states", sorted(rec["relationship_states"]) == ["curious", "want_to_explore"] and rec["action_directions"] == ["receiving"])
        ok("Deep Map keeps Snapshot answers", page.evaluate("Object.keys(app.beta.snapshot.answers)").count("SNAP_04") == 1
           and page.evaluate("!!app.beta.domainResponses.DOM_POWER_EXCHANGE"))
        page.evaluate("app.betaExpandConcept('ACT_IMPACT_PLAY')")
        page.locator('[data-concept-editor="ACT_IMPACT_PLAY"]').get_by_role("button", name="Not interested").click()
        page.locator('[data-concept-editor="ACT_IMPACT_PLAY"]').get_by_role("button", name="Would like to explore").click()
        ok("contradiction is flagged, not resolved", page.locator("text=do these refer to different situations").count() == 1
           and len(page.evaluate("app.beta.responses.ACT_IMPACT_PLAY.relationship_states")) == 2)
        page.locator('[data-concept-editor="ACT_IMPACT_PLAY"]').get_by_role("button", name="Would like to explore").click()
        page.locator('[data-concept-editor="ACT_IMPACT_PLAY"] textarea').first.fill(MARK_NOTE)
        page.locator('[data-concept-editor="ACT_IMPACT_PLAY"] textarea').first.dispatch_event("change")

        # private per-concept boundary + notebook
        page.evaluate("app.betaExpandConcept('ACT_TICKLING')")
        ed = page.locator('[data-concept-editor="ACT_TICKLING"]')
        ed.locator("summary").click()
        ed.locator("select#bb-ACT_TICKLING").select_option("hard_limit")
        page.locator('[data-concept-editor="ACT_TICKLING"] details textarea').fill(MARK_BOUNDARY)
        page.locator('[data-concept-editor="ACT_TICKLING"] details textarea').dispatch_event("change")
        ok("boundary stored only in betaPrivate", page.evaluate("app.betaPrivate.conceptBoundaries.ACT_TICKLING.details") == MARK_BOUNDARY
           and page.evaluate("app.beta.responses.ACT_TICKLING") is None)
        page.evaluate("app.betaGo('deep', 'DEEP_H')")
        ok("notebook is gated behind privacy explanation", page.locator("text=Open my private notebook").count() == 1 and page.locator("textarea").count() == 0)
        page.get_by_role("button", name="Open my private notebook").click()
        page.get_by_role("button", name="Hard limit", exact=True).click()
        page.locator("textarea").fill(MARK_NOTEBOOK)
        page.locator("textarea").dispatch_event("change")
        ok("notebook stored privately", page.evaluate("app.betaPrivate.notebook.DEEP_H2.text") == MARK_NOTEBOOK
           and "DEEP_H2" not in page.evaluate("Object.keys(app.beta.deep.answers)"))

        # ---------- 3. Map: isolation, detail, edit, clear, filters, list, keyboard ----------
        page.evaluate("app.betaGo('map'); app.betaMapToggleFilter('domain','__all')")
        html = page.content()
        ok("no boundary/notebook/note data in map DOM", all(m not in html for m in [MARK_BOUNDARY, MARK_NOTEBOOK, MARK_NOTE]))
        ok("tickling with private hard limit still renders unanswered", page.locator('#betaSvg .beta-node[data-id="ACT_TICKLING"]').get_attribute("data-status") == "unanswered")
        ok("not_interested distinct from unanswered", page.locator('#betaSvg .beta-node[data-id="ACT_IMPACT_PLAY"]').get_attribute("data-states") == "not_interested")
        page.locator('#betaSvg .beta-node[data-id="ACT_BONDAGE_RESTRAINT"]').click()
        ok("node opens detail panel", page.locator("#betaMapDetail h3", has_text="Bondage and restraint").count() == 1)
        page.locator("#betaMapDetail").get_by_role("button", name="Edit answer").click()
        ok("map editor hides boundary controls", page.locator("#betaMapDetail select[id^=bb-]").count() == 0)
        page.locator("#betaMapDetail").get_by_role("button", name="Appealing to me").click()
        ok("edit updates node styling", "appealing" in page.locator('#betaSvg .beta-node[data-id="ACT_BONDAGE_RESTRAINT"]').get_attribute("data-states"))
        page.evaluate("app.betaConceptClear('ACT_BONDAGE_RESTRAINT')")
        ok("clearing returns node to neutral", page.locator('#betaSvg .beta-node[data-id="ACT_BONDAGE_RESTRAINT"]').get_attribute("data-status") == "unanswered")
        before = page.evaluate("JSON.stringify([app.beta, app.betaPrivate])")
        page.evaluate("app.betaMapToggleFilters(); app.betaMapToggleFilter('state','not_interested'); app.betaMapToggleUnanswered(); app.betaMapToggleCollapse('__all')")
        page.fill("#betaMapSearch", "impact")
        page.dispatch_event("#betaMapSearch", "input")
        ok("filters and search do not mutate answers", page.evaluate("JSON.stringify([app.beta, app.betaPrivate])") == before)
        page.evaluate("app.betaMapToggleFilter('state','__all'); app.betaMapToggleUnanswered(); app.betaMapToggleCollapse('__all')")
        page.fill("#betaMapSearch", "")
        page.dispatch_event("#betaMapSearch", "input")
        page.locator('#betaSvg .beta-node[data-id="ACT_ROLEPLAY"]').focus()
        page.keyboard.press("Enter")
        ok("keyboard Enter opens a node", page.evaluate("app.betaMap.selected") == "ACT_ROLEPLAY")
        page.evaluate("app.betaMapSetMode('list')")
        ids = page.evaluate("[...new Set([...document.querySelectorAll('[data-list-id]')].map(e => e.dataset.listId))]")
        ok("list alternative covers all 36 concepts", len(ids) == 36)
        page.evaluate("app.betaMapSetMode('graph')")

        # ---------- 4. Sharing / export / legacy isolation ----------
        page.evaluate("app.betaGo('data')")
        default_export = page.evaluate("app.betaBuildExportText()")
        ok("export excludes private data by default", MARK_BOUNDARY not in default_export and MARK_NOTEBOOK not in default_export)
        page.check("#betaExportPrivate")
        ok("export includes private data only when chosen", MARK_NOTEBOOK in page.evaluate("app.betaBuildExportText()"))
        page.evaluate("app.loadDemoProfile()")  # legacy flow still works alongside beta
        share = page.evaluate("atob(app.encodeProfile(app.profile, 'full'))")
        ok("legacy share link carries no beta data", all(m not in share for m in [MARK_BOUNDARY, MARK_NOTEBOOK, "ACT_", "DOM_"]))
        page.evaluate("app.openPngExportModal(); app.closeModal('pngModal')")
        ok("legacy PNG still renders", page.evaluate("(app.lastPosterDataUrl||'').startsWith('data:image/png')"))
        s = stored(page)
        ok("vault schema v2 stores beta + legacy together", s["data"]["schemaVersion"] == 2 and s["data"]["profile"] and s["data"]["beta"]["responses"])

        # ---------- 5. Persistence across reload (unencrypted) ----------
        page.reload(); page.wait_for_function("window.app && app.view")
        ok("beta answers survive reload", page.evaluate("!!app.beta.responses.ACT_IMPACT_PLAY") and page.evaluate("app.betaPrivate.notebook.DEEP_H2.text") == MARK_NOTEBOOK)

        # ---------- 6. Delete beta keeps legacy ----------
        page.evaluate("app.openBeta('data')"); page.wait_for_function("app.betaRoute === 'data'")
        page.evaluate("app.betaDeleteAll(); app.betaDeleteAll()")
        s = stored(page)
        ok("delete beta clears beta + private, keeps legacy profile", s["data"]["profile"] and not s["data"]["beta"]["responses"]
           and not s["data"]["betaPrivate"]["notebook"] and MARK_NOTEBOOK not in json.dumps(s))
        page.context.close()

        # ---------- 7. Migration: legacy unencrypted vault ----------
        page = new_page(browser)
        page.evaluate("app.loadDemoProfile()")
        legacy = page.evaluate("({encrypted:false, data:{profile: app.profile, snapshots: [], journalEntries:[{id:'j1',nodeId:'surrender',note:'old',timestamp:1}], savedPartners:[], legacyExtra:'keep-me', updatedAt: 1}})")
        page.evaluate(f"localStorage.setItem('{KEY}', JSON.stringify({json.dumps(legacy)}))")
        page.reload(); page.wait_for_function("window.app && app.view")
        ok("legacy vault hydrates with beta defaults", page.evaluate("app.profile && app.journalEntries.length === 1 && Object.keys(app.beta.responses).length === 0"))
        page.evaluate("app.openBeta('home')"); page.wait_for_function("app.view === 'beta'")
        page.check("#betaAgeCheck"); page.evaluate("app.betaConfirmAge()")
        page.evaluate("app.betaConceptToggle('ACT_SERVICE','relationship_states','curious')")
        s = stored(page)["data"]
        ok("migration keeps legacy + unknown fields", s["journalEntries"][0]["note"] == "old" and s["legacyExtra"] == "keep-me" and s["beta"]["responses"]["ACT_SERVICE"])

        # ---------- 8. Migration: legacy ENCRYPTED vault + locked guard ----------
        page.evaluate("""async () => {
          app.beta = (await import('./js/beta/store.js')).defaultBeta();
          localStorage.clear();
          app.loadDemoProfile();
          const { vaultCrypto } = await import('./js/core/crypto.js');
          const env = await vaultCrypto.encryptPayload({ profile: app.profile, snapshots: [], journalEntries: [], savedPartners: [] }, 'synthetic-pass');
          localStorage.setItem('synapse_v4_vault', JSON.stringify(env));
        }""")
        page.reload(); page.wait_for_function("window.app && app.view")
        raw_before = page.evaluate(f"localStorage.getItem('{KEY}')")
        ok("encrypted legacy vault boots locked", page.evaluate("app.vaultStatus") == "locked")
        page.evaluate("app.openBeta('home')")
        ok("beta asks to unlock first", page.evaluate("!document.getElementById('vaultModal').classList.contains('hidden')") and page.evaluate("app.view") != "beta")
        page.evaluate("app.persistVault()")
        ok("locked vault is never overwritten", page.evaluate(f"localStorage.getItem('{KEY}')") == raw_before)
        page.evaluate("app.unlockVaultWithPassphrase('synthetic-pass')")
        page.wait_for_function("app.view === 'beta' && app.betaContent")
        page.check("#betaAgeCheck"); page.evaluate("app.betaConfirmAge()")
        page.evaluate("app.betaConceptToggle('ACT_NEGOTIATION','relationship_states','want_to_explore')")
        page.wait_for_timeout(600)
        s = stored(page)
        ok("beta saves into encrypted vault", s.get("encrypted") is True and "ACT_NEGOTIATION" not in json.dumps(s))
        # rapid taps while encryption is slow: the last state must win
        page.evaluate("['curious','appealing','tried_before','unsure','fantasy_only'].forEach(x => app.betaConceptToggle('ACT_HEADSPACE','relationship_states',x))")
        page.wait_for_function("!app.persistPending", timeout=15000)
        page.reload(); page.wait_for_function("window.app && app.view")
        page.evaluate("app.unlockVaultWithPassphrase('synthetic-pass')")
        page.wait_for_timeout(600)
        ok("encrypted vault round-trip keeps beta + legacy", page.evaluate("!!app.beta.responses.ACT_NEGOTIATION && !!app.profile"))
        ok("rapid encrypted saves keep the latest state", page.evaluate("(app.beta.responses.ACT_HEADSPACE?.relationship_states || []).length") == 5)
        page.context.close()

        # ---------- 9. Mobile: touch tap opens details ----------
        page = new_page(browser, viewport={"width": 390, "height": 844}, has_touch=True, is_mobile=True)
        page.evaluate("app.openBeta('map')"); page.wait_for_function("app.view === 'beta'")
        page.check("#betaAgeCheck"); page.evaluate("app.betaConfirmAge()")
        page.wait_for_selector("#betaSvg .beta-node")
        # Tests run without the Tailwind CDN: give the SVG the size Tailwind would, then refit.
        page.add_style_tag(content="#betaSvg{display:block;width:100%;height:460px}")
        page.evaluate("app.betaZoom(0)")
        page.locator('#betaSvg .beta-node[data-id="DOM_POWER_EXCHANGE"]').tap()
        ok("mobile tap opens area detail", page.evaluate("app.betaMap.selected") == "DOM_POWER_EXCHANGE")
        ok("mobile layout has no horizontal overflow", page.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1"))
        page.context.close()

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
