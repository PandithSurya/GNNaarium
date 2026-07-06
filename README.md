# GNNaarium

## Try it out
https://gn-naarium-frontend.vercel.app/

A comprehensive platform for Graph Neural Network robustness analysis with adversarial attacks, defense mechanisms, and explainability tools. Features a modern React frontend with real-time monitoring and a FastAPI backend powered by PyTorch Geometric.

## Setup

For detailed setup instructions, please see [SETUP.md](SETUP.md).

## What You Can Do

- **Analyze GNN Robustness**: Test how Graph Neural Networks perform under adversarial conditions
- **Explore Datasets**: Use built-in graph datasets (Cora, Citeseer, PubMed) or upload your own
- **Configure Attacks & Defenses**: Implement various adversarial strategies and protective measures
- **Understand Model Decisions**: Use explainability tools to interpret GNN predictions
- **Monitor Training**: Watch real-time metrics and visualizations as your models train

## Key Features

- Interactive web interface for easy experimentation
- Real-time training monitoring with live charts
- Comprehensive attack and defense mechanisms
- Model explainability with GNNExplainer, PGExplainer, SubgraphX, ProtGNN, GraphMask, NeuronAnalysis
- Support for custom datasets via CSV upload
- Professional monochrome UI built with React and Tailwind CSS

---

## Changelog — Development Session

All changes made during the UI/backend overhaul session, grouped by file.

---

### Frontend — Design System

#### `frontend/tailwind.config.js`
- All custom color tokens (`w-*`, `b-*`, `r-*`, `green-*`, `amber-*`, `orange-*`, `purple-*`, `pink-*`, `cyan-*`, `teal-*`, `yellow-*`) moved into `theme.extend` (not `theme`) to preserve Tailwind defaults like `font-mono`, `rounded-lg`, `overflow-y-auto`
- Custom `fontFamily.mono` added to prevent `font-mono` class breakage

#### `frontend/src/index.css`
- All component classes (`.sidebar`, `.card`, `.btn-*`, `.input`, `.label`, `.badge-*`, `.nav-item`, `.select-card`, `.log-block`, `.config-chip`, `.data-table`, `.metric-card`, `.status-dot-*`, `.progress-*`, `.divider`) rewritten using raw CSS hex values
- Removed all `@apply` with custom tokens — PostCSS in this version cannot resolve custom Tailwind tokens inside `@layer components`
- `btn-primary` = `#E60000` (red) — intentionally red inside the app for primary actions (Start Training, active nav, etc.)

#### `frontend/public/index.html`
- Google Fonts Inter loaded via `<link>` tag in `<head>` — moved from CSS `@import` which caused PostCSS errors

---

### Frontend — Components

#### `frontend/src/App.js`
- Full redesign: tab-based layout replaced with persistent sidebar layout
- Custom `GNNLogo` SVG component — node-graph with 3 outer circles + center node + solid edges + dashed outer triangle edges, on dark `#0D0D0D` background
- Sidebar uses `#0D0D0D` dark background for logo square
- Nav icons: `Zap, Database, Brain, Shield, Network, Play, History`
- Config-changed warning: fully monochrome gray (no red)
- User avatar: dark `#1A1A1A` background
- `UserMenu` dropdown component with sign-out
- Breadcrumb navigation in top bar

#### `frontend/src/components/Homepage.js`
- Complete redesign: hero, stats strip, features grid, workflow steps, FAQ accordion, CTA section, footer
- **Color palette — no red anywhere on homepage:**
  - All primary buttons use explicit `background: #0D0D0D` inline styles (not `btn-primary` class) with `onMouseEnter`/`onMouseLeave` hover to `#2A2A2A`
  - Logo: `GNNLogo` SVG on `#0D0D0D` background (matches sidebar exactly)
  - Hero badge: monochrome `#F5F5F5` with dark status dot
  - Hero headline: plain `#0D0D0D`, no colored accent span
  - Attack & Defense feature card: `#FFF7ED` / `#EA580C` orange
  - Stats "6 attack methods": `#EA580C` orange
  - Workflow step 03: `#FFF7ED` / `#FED7AA` / `#EA580C` orange
  - CTA section: `#0D0D0D` dark background, white button with `#0D0D0D` text
  - Footer logo: `GNNLogo` SVG on `#0D0D0D`
- Feature card colors: purple (GNN Architectures, Explainability), orange (Attack & Defense), green (Monitoring), cyan (Datasets), amber (Quick Start)
- FAQ accordion with `ChevronDown`/`ChevronUp`

#### `frontend/src/components/RunMonitor.js`
- Icons replaced: `Activity` → `Cpu`, `TerminalSquare` → `Terminal`, added `Hash`, `Timer`, `Microscope`
- `CircleAlert` (does not exist in this lucide-react version) → `AlertCircle`
- Status badge system fully monochrome — only `error` state uses red (`#E60000`)
- Chart line colors: `val_acc=#0D0D0D`, `train_loss=#E60000`, `asr=#737373`, `robust_acc=#404040`
- Log timestamps: gray (was amber)
- Info cards: Run ID (`Hash`), Epochs (`Timer`), Explanations (`Microscope`)

#### `frontend/src/components/GraphVisualization.js`
- Full rewrite — replaced manual canvas force-directed layout with `react-force-graph-2d` (WebGL-powered)
- Installed: `npm install react-force-graph-2d --legacy-peer-deps`
- Features:
  - Live physics simulation with preferential attachment graph generation
  - Animated link particles on attack edges (red) and defense edges (green)
  - Radial glow effects: selected nodes glow red, explained nodes glow green
  - Hover tooltip (top-left) showing node type
  - Zoom controls (ZoomIn, ZoomOut, fit-to-view) in header
  - Drag individual nodes, drag canvas to pan, scroll to zoom
  - Dark `#0A0A0A` canvas matching RunMonitor log console
  - View mode tabs: Original / Attacked / Defended
  - Legend strip in dark footer

#### `frontend/src/components/ExplanationVisualization.js`
- Stripped from ~350 lines to ~150 lines — removed all compliance banners, method-specific walls of text, duplicate overview/detailed tabs, dead `card-neo`/`btn-neo-*` class references
- **Visual view** (default): metric cards (Method, Target, Fidelity, Confidence), top-8 feature importance bars, top-8 edge importance bars, prototype matches (ProtGNN)
- **Detailed view** (new): numbered paragraph narrative generated by `buildNarrative()` — plain English description covering method, prediction, confidence/fidelity, neighbourhood scope, feature summary, edge summary, prototypes, GraphMask global stats, NeuronAnalysis logical patterns
- Toggle between Visual / Detailed via pill tabs in header (BarChart2 / AlignLeft icons)
- Node selector tabs when multiple explanations exist
- Error banner for failed explainers

#### `frontend/src/components/ExperimentHistory.js`
- **Delete bug fixed** — deletions now actually persist across page refresh:
  - `addDeleted(id)` writes to `localStorage.deletedExperiments` tombstone array
  - `load()` reads tombstone list and filters deleted IDs from merged results
  - "Clear all" also writes all current user's IDs to tombstone list
- **Auth token sent with all API calls** — `fetch` calls now include `Authorization: Bearer <token>` header so backend actually authenticates and runs MongoDB `delete_one`
- Filter on `String(e._id || e.id)` consistently (was mixing `e.id` and `e._id`)

#### `frontend/src/components/DatasetSelector.js`
- Category badges colored by type: Citation=cyan, Social=green, Molecular=amber, Biological=orange, Academic=purple

#### `frontend/src/components/ModelConfig.js`
- Compatible badges green, incompatible red, recommendation amber
- Task type badges colored per type

#### `frontend/src/components/AttackDefenseConfig.js`
- Attack categories: Evasion=red, Poisoning=orange, Privacy=pink
- Defense categories: Preprocessing=green, Training=amber, Privacy Protection=purple

#### `frontend/src/components/ExplainerConfig.js`
- Post-hoc=purple, Intrinsic=amber, Global=cyan category badges

#### `frontend/src/components/MetricsPanel.js`
- val_acc=green, train_loss=red, asr=orange, robust_acc=cyan
- Left border accent per metric

---

### Backend

#### `requirements.txt`
- `fastapi==0.104.1`
- `uvicorn[standard]==0.24.0`
- `numpy==1.26.4` (upgraded from 1.24.3 — was incompatible with SciPy)
- `scipy==1.11.4`
- `pandas==2.0.3`
- `websockets==12.0`
- `httpx==0.25.2` (added — missing dependency)
- `scikit-learn==1.3.2` (added — missing dependency)
- `starlette==0.27.0`
- `python-multipart==0.0.6`

#### `app/main.py`
- Replaced deprecated `@app.on_event("startup")` / `@app.on_event("shutdown")` with `lifespan` async context manager

#### `app/datasets.py`
- All dataset loaders (Planetoid, Reddit, TUDataset) now always delete the `processed/` cache directory before loading
- Prevents `ValueError: too many values to unpack` caused by stale `.pt` cache files from a different PyG version
- Uses `shutil.rmtree` on both possible cache paths

#### `app/explainers.py`
- `NeuronAnalysis.explain` — `num_hops` variable was referenced outside its `if task_type == 'node'` scope
- Fixed with `locals().get('num_hops', None)`

#### `app/api.py`
- `GET /api/experiments` — now scoped to authenticated user only (passes `current_user.get("email")` to `get_experiments`). Previously passed `None` which returned all users' experiments
- `DELETE /api/experiments/:id` — was already correct in backend; frontend was not sending auth token so it always 401'd silently

---

### Known Design Rules (for future consistency)

| Context | Color |
|---|---|
| Primary CTA buttons (inside app) | `#E60000` red via `btn-primary` |
| Primary buttons on Homepage | `#0D0D0D` dark via inline style |
| Active nav item | `#E60000` red |
| Train loss chart line | `#E60000` red |
| Error states / auth warnings | `#E60000` red |
| Val accuracy | `#22C55E` green |
| Attack badges / evasion | `#E60000` red |
| Poisoning attacks | `#EA580C` orange |
| Defense badges | `#16A34A` green |
| Explainer / purple category | `#9333EA` purple |
| Citation network datasets | `#0891B2` cyan |
| Everything else | `#0D0D0D` / `#525252` / `#737373` / `#BDBDBD` monochrome |

### Known Technical Constraints

- `@apply` with custom Tailwind tokens inside `@layer components` fails in this PostCSS version — use raw hex values in CSS, Tailwind utility classes only in JSX
- `theme` (not `theme.extend`) in `tailwind.config.js` wipes Tailwind defaults — always use `theme.extend`
- Google Fonts `@import` must be in HTML `<head>`, not in a CSS file processed by PostCSS
- PyG dataset cache must be deleted before every load — stale `.pt` files from version mismatches cause `ValueError: too many values to unpack`
- `react-force-graph-2d` installed with `--legacy-peer-deps` flag
