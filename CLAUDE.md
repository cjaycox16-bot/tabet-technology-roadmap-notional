# Project: Tabet Manufacturing Interactive Technology Roadmap

## Overview
An interactive, visual web application that maps the technology and process 
landscape of Tabet Manufacturing Co., a defense/industrial contract manufacturer. 
The tool visualizes every branch/department of the business, the systems and 
software used at each step, and how those systems interact with one another 
across the company.

## Purpose
Internal planning and communication tool to:
1. Give a clear visual picture of current manufacturing and technology processes 
   company-wide
2. Show which processes are manual vs. automated
3. Show how software/technology systems interact and share data across branches
4. Eventually highlight opportunities for improvement — automation, AI, new 
   technology — as a future phase/overlay

## Core Functionality (Phase 1)
- Visual diagram of the business as connected nodes:
  - Top-level nodes = business branches/departments (data to be provided)
  - Each branch node is clickable/expandable, revealing processes, systems, 
    and software used within that branch
  - Clicking a node opens a detail panel (side drawer, not inline) showing: 
    process name, description, software/systems involved, manual vs. 
    automated status
- Cross-branch connections: software/system nodes must be able to connect to 
  OTHER software/systems in different branches via edges — representing data 
  flow or process handoffs, not just parent-child hierarchy
- Edges visually distinguishable by type (e.g., solid = automated data flow, 
  dashed = manual handoff) — exact taxonomy TBD once real data is provided
- Diagram supports pan/zoom for a large, complex map

## Future Functionality (Phase 2 — design for extensibility, don't build yet)
- Toggle/filter to highlight "automation opportunity" nodes
- Visual markers/overlays for suggested AI/automation improvements
- Possibly editable/CMS-like data entry so non-developers can update content

## Tech Stack
- React (functional components, hooks)
- @xyflow/react (React Flow) — interactive node/edge diagram engine
- Tailwind CSS — styling (panels, filters, buttons)
- React Context (or Zustand if state gets complex) — selected/expanded node 
  state, filter state
- Vite — client-side only, no backend/server needed

## Data Structure Notes
- Branch/process data lives in a structured JSON/TS file, separate from UI 
  components, so it's easy to update as real business data comes in
- Nested structure: Branch → Process/Step → Systems/Software, PLUS a separate 
  list of cross-references (edges) between systems across branches

## Deployment Target
- Version-controlled via GitHub
- Shared with non-technical Tabet colleagues — deployed via GitHub Pages or 
  similar static hosting; must build to a fully static, self-contained site

## Current Status
Starting from scratch. Business branch/process data has not yet been provided 
(will be added incrementally). Begin by scaffolding the project with 
placeholder data (2–3 sample branches, a few processes each, one or two 
cross-branch software connections) so the structure can be validated before 
real data is added.

---

## Model Delegation Strategy (for token/cost efficiency)

This project should use subagents to route work to the right model rather 
than running everything on the main conversation's model. Set these up in 
`.claude/agents/` (project-level, so they're shared if this repo is ever 
handed to someone else):

### Subagents
Defined in `.claude/agents/` — Claude Code loads these automatically:
- `explorer` (haiku) — read-only codebase search/lookup
- `data-formatter` (haiku) — converts raw business data into the project's data schema
- `component-builder` (sonnet) — builds React/React Flow/Tailwind components
- `architect` (opus) — structural/design decisions only, used sparingly

### General delegation rules
- Default (main conversation) model: keep on **sonnet** for day-to-day work — 
  it's the right balance of capability and cost for this project's size.
- Route to `explorer` (haiku) for any read-only lookup — cheapest tier, no 
  reason to burn a bigger model on file-finding.
- Route to `data-formatter` (haiku) whenever the task is "take this data I'm 
  giving you and put it in the existing format" — mechanical, not creative.
- Route to `component-builder` (sonnet) for all actual feature-building.
- Route to `architect` (opus) only for genuinely hard structural calls — e.g., 
  "how should we model many-to-many cross-branch connections without the 
  layout becoming unreadable." Don't reach for this by default; it's the 
  most expensive tier and most of this project doesn't need it.
- If unsure which subagent fits, default to explaining the task plainly in 
  chat — Claude Code will match it to a subagent automatically based on the 
  descriptions above.