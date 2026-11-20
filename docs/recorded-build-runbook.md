# GTA6 eligible recorded build — operator checklist

Official source: https://make.fun/bounty/gta6-01 and https://make.fun/api/competitions/gta6-01/requirements (checked 2026-11-20). Deadline: 2026-11-24 15:00 UTC. Do **not** submit without explicit owner approval.

## Hard prerequisite (do this before further qualifying code changes)
1. On a computer with Node.js >=22.18, Chrome and a supported coding agent (Codex is supported), check `node --version`. Work from a local clone of **this** repository only: `https://github.com/wallyben/makefun-gta6`.
2. Download the **official** competition kit using the current official instructions (currently `curl -sSL https://make.fun/c/gta6-01/kit | tar xz`; on Windows use a supported shell). Do not invent or rewrite `vendor/makefun-game.ts`.
3. Start the official recorder **before** starting a fresh Codex coding session. From the unpacked kit, the official requirements show:
   `node cli/makefun.mjs record --competition gta6-01 --source <absolute-path-to-this-repo> -- codex exec --sandbox workspace-write "<the owner's full original build instruction>"`
   If interactive Codex is needed, start the recorder first, then start a **new** supported agent session while it runs. Preserve the opening prompt exactly, system prompt and instruction files, and any parent-session lineage per official requirements. Do not claim previous GitHub automation commits are recorded.
4. In that recorded session: integrate root `main.ts`, copy `vendor/makefun-game.ts` **byte-for-byte** from kit, implement reproducible `out/` generation, and run official kit checks. Ensure the code the recording describes is the code committed.
5. Launch `game/index.html` in real desktop Chrome offline. Exercise start, walk, steal/drive, police, missions, HUD/minimap, pause, save/reload. Capture 3–4 **genuine** screenshots from the game, respecting official size/dimension limits. No generated or composited screenshots.
6. Seal recording with the official recorder. If sealing fails, follow official `record --finish <id>` on the same machine, user, shell environment and git config. Preserve sealed ID(s) and real test output.
7. Validate source and artifact using the official kit and repository preflight; check current CI conclusions. Submission also needs an eligible account/wallet and the official signed entry. **Do not submit without explicit approval.**

## Evidence ledger
| Gate | Current evidence | Status |
| --- | --- | --- |
| Exact official vendor | GitHub fetch 404 at 2026-11-20 01:13 UTC | BLOCKED |
| Root main.ts | GitHub fetch 404 at 2026-11-20 01:13 UTC | BLOCKED |
| Supported sealed session | No recording ID supplied or verified | UNKNOWN / OWNER ACTION |
| Authentic screenshots | Not inspected or captured in real browser | UNKNOWN |
| Real offline playtest | Not run in available environment | UNKNOWN |
| CI at latest HEAD | No run conclusion verified in this run | UNKNOWN |

**Stop condition:** If no supported recorder can be started before the deadline, do not describe the repository as an eligible submission. Continue only genuine improvements that could be validated, or explicitly report the blocker.
