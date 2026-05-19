# MERGE_NOTES

## Base and Source
- Base used: `safeher2` (`safeher2/safeher`)
- Candidate changes source: `safeher-new_edit` (`safeher-new_edit/safeher-master`)
- Merge policy: preserve base backend/API behavior and only apply safe, compatible improvements.

## Phase 1 Comparison Snapshot
- Relevant files scanned (ignoring caches/build artifacts):
  - Base: 610
  - New edit: 189
  - Only in base: 475
  - Only in new edit: 54
  - Common but changed: 10
- Most base-only entries were generated/runtime artifacts (`node_modules`, Android intermediate `.cxx`, logs, cache folders, QR screenshots).

## File/Area Decision Table
| File/Area | Decision | Reason |
|---|---|---|
| `backend/app/api/routes.py` | KEEP_BASE | Base logic preserves stable configured public room URL behavior; new edit changed this behavior and removed corresponding test coverage. |
| `backend/tests/test_api_routes.py` | KEEP_BASE | Base tests include loca.lt link behavior coverage and broader test-client flexibility. |
| `mobile/App.tsx` | MERGE | Kept base bootstrap/sync logic and accepted new theme-aware navigation/status bar integration. |
| `mobile/src/*` (navigation/screens/services/theme/utils) | KEEP_NEW | Adds complete typed mobile architecture/UI and is API-compatible with base backend routes. |
| `mobile/package.json`, `mobile/package-lock.json`, `mobile/metro.config.js`, `mobile/react-native.config.js`, `mobile/tsconfig.json`, `mobile/vitest.config.ts` | KEEP_NEW | Required mobile dependency/config layer missing or outdated in base runtime tree. |
| `ml/data/women_safety_dataset_v2.csv` | KEEP_NEW | Additive dataset; does not replace existing gesture pipeline data. |
| `ml/scripts/train_safety_context_model.py`, `ml/scripts/safety_context_inference.py` | KEEP_NEW | Additive ML pipeline scripts with consistent input/feature/output chain. |
| `ml/models/safety_context_model.joblib`, `ml/models/safety_context_metrics.json` | KEEP_NEW | Additive artifact/metrics for the new context model flow. |
| `README.md` | MERGE | Added docs from new edit and fixed absolute machine-local links to relative repo links. |
| `run-prototype.ps1`, `run-college-demo.ps1`, `run-college-tunnel-demo.ps1` | KEEP_NEW | Useful orchestration scripts; no core behavior regressions. |
| `run-native-prototype.ps1` | MERGE | Removed hardcoded local SDK/JBR assumptions and made Android tool/JAVA discovery portable. |
| `window_dump.xml` | REJECT_NEW | Debug artifact, not part of product runtime. |
| Generated logs/cache/QR/build artifacts | REJECT_NEW / CLEANUP | Removed for clean, reproducible project state. |

## What Was Kept from `safeher2`
- Backend API contracts, auth flow, SOS/alert routes, live-room/check-in logic, federated endpoints.
- Backend route behavior in `create_alert` and route test coverage.
- Existing admin/backend/ML core code structure and service behavior.
- Existing gesture model assets and base functionality.

## What Was Merged from `safeher-new_edit`
- Mobile app source tree under `mobile/src` (screens, services, navigation, theme, utils, tests).
- Mobile dependency/config files (`package.json`, lockfile, TS/Vitest/Metro/RN configs).
- Theme-enhanced `mobile/App.tsx` wrapper integration.
- Additive ML safety-context dataset/scripts/model/metrics.
- Root-level operational scripts and README (with portability fixes).

## What Was Rejected from `safeher-new_edit`
- `window_dump.xml` (artifact only).
- Backend route/test regressions (new edit versions not merged).

## Manual Conflict Resolutions
- `mobile/App.tsx`: merged theme/nav improvements while preserving bootstrap effects.
- `run-native-prototype.ps1`: replaced hardcoded local paths with dynamic discovery (`PATH`, `ANDROID_SDK_ROOT`, `ANDROID_HOME`, optional `JAVA_HOME`).
- `README.md`: replaced absolute Windows paths with relative project links.
- `admin/postcss.config.cjs`: added local config so admin build does not inherit unrelated parent PostCSS config.

## Dependency Changes
- `mobile`: added/updated dependency manifest and lockfile from new edit.
- `ml/requirements.txt`: fixed version conflict by changing `numpy==2.3.1` to `numpy==1.26.4` (compatible with `tensorflow==2.19.0`) and added `pytest==8.4.1`.
- `admin`: added `postcss.config.cjs` (no new npm package needed).

## Environment Variables Needed
Use `.env.example` files in each app:
- `backend/.env.example`
- `admin/.env.example`
- `mobile/.env.example`

Optional but useful:
- `EXPO_PUBLIC_API_BASE_URL` (mobile)
- `PUBLIC_ROOM_BASE_URL` (backend)
- Twilio/Firebase credentials for real messaging/push (backend)

## Commands to Run

### Backend
```powershell
cd C:\Users\jyoti\Downloads\safeher_prototype\safeher2\safeher\backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Admin
```powershell
cd C:\Users\jyoti\Downloads\safeher_prototype\safeher2\safeher\admin
npm install
npm run dev
```

### Mobile
```powershell
cd C:\Users\jyoti\Downloads\safeher_prototype\safeher2\safeher\mobile
npm install
npx expo start
```

### ML (full stack)
```powershell
cd C:\Users\jyoti\Downloads\safeher_prototype\safeher2\safeher\ml
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python scripts\prepare_dataset.py
python scripts\train_model.py
python scripts\train_safety_context_model.py
python scripts\safety_context_inference.py
```

## Validation Run Results
- Backend:
  - `python -c "import app.main"` passed.
  - `pytest tests -q` passed (`17 passed`).
  - Live server health route check passed (`GET /api/health -> status=ok`).
- Admin:
  - `npm test -- --run` passed (`2/2`).
  - `npm run build` passed after adding `admin/postcss.config.cjs`.
- Mobile:
  - `npx tsc --noEmit` passed.
  - `npm test` passed (`13/13`).
  - `npx expo config --json` passed.
- ML:
  - Core checks passed with compatible core stack (`pytest tests`, safety-context train + inference).
  - Full TensorFlow-heavy install may take significantly longer depending on network/system.

## Known Limitations
- ML full dependency install includes TensorFlow and may be slow on some systems.
- Vulnerability warnings from npm audit are present; none were auto-fixed during this merge to avoid unreviewed dependency changes.
