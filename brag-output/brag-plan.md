# Brag Plan: Verdict Studio & Haize Sentinel

## What is this app?
Verdict Studio & Haize Sentinel is a visual multi-agent debate studio and scoped Model Context Protocol (MCP) security gateway built natively on top of Haize Labs' `haizelabs/verdict` library and Anthropic's MCP.

## The angle
Autonomous AI agents are getting unrestricted tool access. We built the first visual control plane where models debate payload safety token-by-token in an adversarial court to block prompt injections and destructive SQL in real time.

## Hook (first 2-3 seconds)
Deep obsidian glow with bold typography: "What if AI models defended themselves in court before executing dangerous tools?"

## Key moments (the middle)
- **Visual DAG Studio**: Draggable multi-agent nodes (`Prosecutor`, `Defense`, `Chief Justice`) wired into a topological debate graph.
- **Live Token Streaming**: Real-time WebSocket console streaming arguments token-by-token.
- **Scoped MCP Security Gateway**: AST-level SQL guardrail blocking `DROP TABLE` while permitting safe `SELECT` queries in <10ms.

## Outro / punchline
"Test-time compute meets runtime agent defense. Verdict Studio is live."

## User flow worth showing
1. Design a multi-agent debate DAG on the visual canvas.
2. Run live debate simulation with token-by-token streaming.
3. Generate scoped MCP keys with AST SQL guardrails for Claude Desktop & Cursor.

## Tone
- Preset: polished
- Creative direction: Elite developer tools & AI safety engineering launch
- Interpretation: Crisp typography, dark aubergine palette, smooth transitions, high visual confidence.

## Format: landscape — 1920x1080
## Duration: 20s

## Visual identity (from the project)
- Background: #0d030e / #170718
- Accent: #d9bdde / #4a154b / #007a5a
- Text: #ffffff / #cbd5e1
- Display font: Inter / system-ui
- Code/Accent font: "Berkeley Mono", "JetBrains Mono", monospace
- Strongest visual element: Aubergine glowing node cards with Prosecutor (red) vs Defense (emerald) badges.

## Share copy (draft)
Introducing Verdict Studio & Haize Sentinel: the first visual multi-agent debate studio and scoped MCP tool firewall for Haize Labs Verdict. Live demo: https://verdict-studio-haizelabs.vercel.app

## Audio direction
- Role: High-energy modern tech bed with crisp UI clicks
- Music: happy-beats-business-moves-vol-1-by-ende-dot-app.mp3
- Music treatment: Starts energetic, subtle ducking for payoff, clean fade out at logo
- Audio-coupled moments: Card arrivals, token streaming typing, and final verdict badge snap

## Storyboard

### Scene 1 — The Hook (0.0s - 4.0s)
- **Visual**: Dark aubergine backdrop with glowing grid. Eyebrow badge `// HAIZE LABS VERDICT • MCP GOVERNANCE`. Headline: "Autonomous Agents Need a Defense."
- **Action**: Eyebrow fades in, headline slams in with clean hold. Subtitle: "Visual Multi-Agent Debate Studio & Scoped Tool Firewall."
- **Audio intent**: Punchy hook drop with swoosh accent.
- **Transition**: Smooth wipe right -> Scene 2

### Scene 2 — Visual DAG Studio (4.0s - 8.5s)
- **Visual**: React Flow canvas with custom nodes: `Input Source` -> `ProsecutorUnit` (Adversarial Red-Team) & `DefenseUnit` (Safety Counsel) -> `ChiefJustice` (Adjudicator).
- **Action**: Nodes connect via smooth bezier curves. Active execution highlights glow around nodes.
- **Audio intent**: Soft click on node connection and tech rhythm.
- **Transition**: Zoom slide -> Scene 3

### Scene 3 — Live Token-by-Token Debate (8.5s - 13.0s)
- **Visual**: Streaming debate terminal showing Prosecutor arguing prompt injection risk and Defense responding in real time.
- **Action**: Token chunks stream into console. Final verdict pill pops: `VERDICT: BLOCKED (INJECTION DETECTED)`.
- **Audio intent**: Fast digital tick / typing effect and subtle chime on verdict.
- **Transition**: Clean crossfade -> Scene 4

### Scene 4 — Scoped MCP Gateway & AST Guardrails (13.0s - 17.0s)
- **Visual**: Scoped MCP Key Manager with permissions: `db_query (Read-Only AST)`, `bash (BLOCKED)`, `Verdict Firewall (>150 tokens)`.
- **Action**: Test execution `DROP TABLE users;` triggers instant `403 FORBIDDEN: Destructive SQL statement BLOCKED by AST parser`.
- **Audio intent**: Lock / security badge snap.
- **Transition**: Soft fade -> Scene 5

### Scene 5 — Outro & Live Demo CTA (17.0s - 20.0s)
- **Visual**: Official logo badge `Verdict Studio & Haize Sentinel`. URL pill: `verdict-studio-haizelabs.vercel.app`. Secondary: `Open Source on GitHub`.
- **Action**: Logo scales up smoothly, buttons pulse gently.
- **Audio intent**: Music swell and gentle fade out.
