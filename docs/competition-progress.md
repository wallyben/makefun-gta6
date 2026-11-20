# GTA6 competition progress and prioritized backlog

Last inspected: 2026-11-19 23:17 UTC. Repository: https://github.com/wallyben/makefun-gta6 (main only). Official brief: https://make.fun/bounty/gta6-01 . Deadline: 2026-11-24 15:00 UTC; feature freeze: 2026-11-23 15:00 UTC. Do not submit without owner approval.

## Evidence / release gates
- **BLOCKED / verified by GitHub 404:** root `main.ts` absent.
- **BLOCKED / verified by GitHub 404:** `vendor/makefun-game.ts` absent. Must copy official kit version unchanged, not recreate.
- **UNKNOWN:** authentic 3–4 browser screenshots under `screenshots/`; inspect folder and capture only real gameplay renders. Preflight requires each <=256 KiB and dimensions <=1280x480; validate against current official kit.
- **BLOCKED pending owner/official recorder:** sealed coding-agent session provenance. GitHub commits and this automation are not evidence of kit recordings. Cannot retroactively manufacture sessions.
- **UNKNOWN:** actual offline Chrome launch, driving, combat, police, missions, save, pause and restart. A DOM simulation is not a browser playtest.
- **UNKNOWN:** full current CI conclusion. On 2026-11-19, GitHub combined-status lookup for previously reported commit `1aeb94d38c493086e74ca28844bd832a74c0ccf3` returned zero statuses; commit workflow lookup returned zero PR-triggered runs, which does NOT prove no push-triggered runs exist.
- **VERIFIED source inspection:** `.github/workflows/quality.yml` runs Node 22 syntax and `node --test tests/*.test.mjs`, then diagnostic `scripts/submission-preflight.mjs`. The diagnostic step deliberately exits zero even if official submission checks fail. Thus a green CI run would not establish eligibility.
- **VERIFIED official brief (2026-11-19):** offline desktop browser crime game, root `main.ts`, unchanged vendor, game static files, real screenshots, sealed supported-agent sessions. Judge compares screenshots and source outline; gameplay completeness prioritized.
- **NOT READY:** mandatory eligibility gates and browser verification not met.

## Prioritized backlog (highest impact first)
| ID | Priority | Task | Acceptance evidence | Status |
| --- | --- | --- | --- | --- |
| G6-001 | P0 | Obtain official kit, integrate exact unchanged vendor and root main.ts output generator | Official kit check + node main.ts produces valid out/; compare vendor hash | BLOCKED until kit obtained |
| G6-002 | P0 | Establish eligible recorded development session | Official record command begins before supported agent session; sealed recording ID from kit | USER ACTION / UNKNOWN |
| G6-003 | P0 | Capture 3–4 authentic browser gameplay screenshots | Real desktop browser captures, compliant sizes, distinct driving/police/mission/minimap scenes | UNVERIFIED |
| G6-004 | P1 | Confirm current HEAD and passing quality workflow | Exact HEAD SHA, run URL and conclusion, syntax + tests passing | OPEN |
| G6-005 | P1 | Desktop offline smoke and regression playtest | Actual browser evidence for start, walking, driving, police, missions, save, pause/restart | OPEN |
| G6-006 | P2 | Complete playable mission chain and progression | End-to-end gameplay test with no blockers | WAIT |
| G6-007 | P3 | Improve visual presentation visible in judged screenshots | Before/after authentic captures and no regressions | WAIT |
| G6-008 | P4 | Measure and optimize performance | Measured FPS/frame time on real desktop browser | WAIT |
| G6-009 | P5 | Official final validation and packaging | Official kit reports eligible; all release gates documented | WAIT |

## Run protocol
Read this file and current GitHub state first. Pick highest feasible P0/P1 task, define baseline and measurable acceptance test before changes. Test and fix regressions before new features. Never report queued/missing CI as passing. Update evidence, date and next task after each meaningful run. Do not fake screenshots or provenance. During feature freeze only eligibility, regression repair, validation and packaging; after deadline stop development.

## This run: 2026-11-19 23:17 UTC
Baseline: no persistent `docs/competition-progress.md`; root `main.ts` and vendor missing; no combined status or PR-triggered workflow run returned for reported prior commit. Chosen P0/P1 action: establish a durable, evidence-qualified backlog so future runs target eligibility rather than untested micro-patches. Acceptance: this file committed to `main` and re-fetched. No browser execution or CI pass claimed. Next: acquire official kit integration details and obtain genuine recorder session; verify current push-triggered CI and run actual browser test.

## This run: 2026-11-20 00:09 UTC — official eligibility investigation
- **Verified HEAD:** `98916741e04ad695f054082149c7937a146e51bb` (GitHub commit search). No newer commits returned at inspection.
- **Verified official live rules:** https://make.fun/bounty/gta6-01 and https://make.fun/api/competitions/gta6-01/requirements, checked 2026-11-20. Deadline remains 2026-11-24 15:00 UTC. Scoring compares authentic screenshots and source outline; completeness is primary.
- **Verified missing:** GitHub contents API returns 404 for both root `main.ts` and `vendor/makefun-game.ts`. Do not synthesize the unchanged vendor file. Official kit fetch: `curl -sSL https://make.fun/c/gta6-01/kit | tar xz`, in a network-enabled environment, then copy vendor byte-for-byte and implement root entrypoint per kit.
- **Verified requirement clarification:** `recording_ids` must identify sealed sessions created by `node cli/makefun.mjs record --competition gta6-01 --source <repo>` before the supported coding-agent session. The competition takes NO transcript upload; hand-written/retroactive recordings cannot qualify. Supported recorded harnesses include Codex. Record session lineage, opening user prompt, system prompt and instruction files as required by official requirements. Current automation's GitHub writes do NOT establish eligibility.
- **Verified runtime prerequisite:** Node >=22.18 required; this automation's local container reports v22.16.0, so it cannot validate `main.ts` against the required runtime here. Local container also cannot resolve github.com, so it cannot clone the repository or run a real browser playtest. GitHub connector is usable for source/commit operations.
- **P0 user-side action:** Start official kit recorder on a computer with Node >=22.18 and Chrome, launch a new supported agent session AFTER recorder starts, and have that agent perform genuine eligible development. Seal recording with kit. Never claim existing unrecorded commits qualify.
- **Acceptance this run:** persist newly verified official eligibility details and environment limitations in this ledger. No gameplay quality improvement or CI pass claimed. Next task: obtain official kit bytes and create exact vendor + main.ts under a properly recorded session; run kit check and capture genuine browser screenshots. Status: NOT READY.
