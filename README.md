# NutriGuide AI

**Your AI-Powered Personal Nutrition & Fitness Guide**

Final-year project: *NutriGuide AI: A Deep Learning Based Food Recognition and Personalized Nutrition Recommendation System*.

This repository is the **Phase 1 full-stack foundation**. It is a real application (database, auth, API, UI), built so the AI/ML modules can be added in later phases without rebuilding anything.

> NutriGuide AI is a nutrition and fitness management app. It is not a medical diagnosis system. Nutrition targets are estimates for general wellness and should not replace professional medical or dietary advice.

## Currently implemented (Phase 1)

- Signup, login, logout, current user, JWT auth, protected routes
- 5-step onboarding / profile (editable later)
- Backend nutrition engine: BMI, BMR (Mifflin-St Jeor), TDEE, calorie target, macro targets
- Dashboard using real database values (empty states instead of fake data)
- **Rule-based** meal planner (stored in PostgreSQL; generate, regenerate, delete)
- **Mark meals as consumed** (with portion, undo and duplicate protection). Dashboard calories consumed/remaining and macro progress are calculated from these records
- Hydration tracking (weight-based estimate, quick-add, custom amount, delete entries)
- **Consistency streak** calendar (current streak, longest streak, active days) from real meal and hydration records
- **Light / dark theme** (toggle in the navbar, sidebar and Settings; remembered per device)

## Future (not implemented, shown as "Coming soon")

| Phase | Feature |
|---|---|
| 2 | Food database, free-form food diary, manual entry and correction (meals from the planner can already be marked as consumed) |
| 3 | YOLO food recognition, OpenCV preprocessing, image upload |
| 4 | OCR packaged-food label scanning |
| 5 | Workout tracking |
| 6 | ML recommendation model (only after training + evaluation) |
| 7 | Progress analytics, model evaluation, deployment |

**Honesty notes for your report:** there is no trained model in this milestone. Targets come from published formulas; the meal planner is rules over a small hand-written food list whose nutrition values are approximate and unverified. No accuracy is claimed anywhere.

## Tech stack

Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts, Lucide React.
Backend: Python, FastAPI, Pydantic v2, SQLAlchemy 2, Alembic, PyJWT, bcrypt.
Database: PostgreSQL. Tests: pytest (SQLite in memory).

## Folder structure

```
nutriguide-ai/
├── .env.example            # copy to .env and backend/.env
├── docker-compose.yml      # PostgreSQL for local development
├── backend/
│   ├── app/
│   │   ├── main.py         # FastAPI app, CORS, error handlers
│   │   ├── core/           # config, security (JWT/bcrypt), auth dependencies, enums
│   │   ├── database/       # Base, engine/session
│   │   ├── models/         # SQLAlchemy tables
│   │   ├── schemas/        # Pydantic request/response models
│   │   ├── routers/        # auth, profile, nutrition, meal_planner, hydration
│   │   └── services/       # nutrition.py + nutrition_config.py (all formulas/constants),
│   │                       # meal_planner.py, food_catalog.py, hydration_service.py,
│   │                       # food_recognition.py (FUTURE interface only, no model)
│   ├── alembic/            # migrations (0001_initial: 6 tables; 0002: meal_consumptions)
│   └── tests/
└── frontend/
    ├── app/                # (public) pages, (app) authenticated pages, onboarding
    ├── components/         # UI kit, charts, layout shell, guards
    ├── lib/api/            # the ONLY place that calls fetch()
    ├── hooks/ types/ public/
```

## Setup

Prerequisites: Python 3.11+, Node 18.17+ (20 recommended), Docker (or any PostgreSQL 14+).

### 1. Environment variables

```bash
cp .env.example .env            # used by docker compose
cp .env.example backend/.env    # used by the API
cp frontend/.env.example frontend/.env.local
```

Edit `backend/.env`:

| Variable | Meaning |
|---|---|
| `DATABASE_URL` | e.g. `postgresql+psycopg2://nutriguide:YOURPASSWORD@localhost:5432/nutriguide` |
| `JWT_SECRET` | long random string: `python -c "import secrets; print(secrets.token_urlsafe(48))"` |
| `CORS_ORIGINS` | comma-separated allowed origins, default `http://localhost:3000` |
| `POSTGRES_*` | only for docker compose; password must match `DATABASE_URL` |

The frontend only needs `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`). Never commit real secrets (`.env` is git-ignored).

### 2. Database

```bash
docker compose up -d db
```

### 3. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head             # creates the tables
uvicorn app.main:app --reload    # http://localhost:8000  (docs at /docs)
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev                      # http://localhost:3000
```

### 5. Tests

```bash
cd backend && pytest -v
```

Covers: auth, profile validation, BMI/BMR/TDEE/calorie/macro/hydration maths (known examples), hydration, meal planner (including diet rules), and cross-user data isolation.

## API overview

All routes are under `/api`. Errors are `{ "detail": "message" }`. Everything except register/login needs `Authorization: Bearer <token>`.

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Profile | `GET/POST/PUT /profile` (create/update recalculates targets) |
| Nutrition | `GET /nutrition/summary?date=&tz_offset=`, `POST /nutrition/calculate` |
| Meal planner | `GET /meal-planner?date=`, `POST /meal-planner/generate`, `GET/DELETE /meal-planner/{id}` |
| Meal consumption | `POST /meal-consumptions?tz_offset=` (body `{meal_plan_item_id, portion}`; repeating returns the existing record), `GET /meal-consumptions?date=`, `DELETE /meal-consumptions/{id}` (undo) |
| Activity | `GET /activity/streak?days=&tz_offset=` |
| Hydration | `GET /hydration/today?tz_offset=`, `POST /hydration`, `DELETE /hydration/{id}` |

Every user-owned query filters by the authenticated user's id; another user's record returns 404.

## Design decisions worth knowing

- **Consumed nutrition comes only from `meal_consumptions` rows** (a snapshot of the portion eaten). `remaining = target - consumed` and can be negative (over target). A planned item can be consumed once (unique constraint, safe under simultaneous clicks). Regenerating or deleting a plan keeps what you ate (the link to the plan item becomes NULL). Meals can be marked for today or earlier days, not future days.
- **Streak rule:** a day is active if it has at least one consumed meal or one hydration entry; many entries still count once. Days use the browser's UTC offset (`tz_offset`), like the rest of the app. A streak stays alive until the end of today. Limitation: one fixed offset is applied to the whole history, so entries logged across a daylight-saving change can fall on a neighbouring day.
- **Theme:** Tailwind `darkMode: "class"` with CSS-variable colour tokens in `app/globals.css`; a tiny inline script in `<head>` applies the saved theme before first paint. No extra dependency.
- **Logo:** one `LogoMark`/`Logo` component (`components/Logo.tsx`); the favicon (`app/icon.svg`, `app/favicon.ico`, `app/apple-icon.png`) uses the same artwork.
- **All formulas live in `backend/app/services/nutrition_config.py`** (activity multipliers, goal adjustments, calorie floors, macro strategy, hydration factor). Change a number there and the whole app follows.
- Macro strategy: protein by g/kg (1.2-1.8 depending on goal), fat 25% of calories, carbs = remaining calories.
- Calorie floor: 1500 (male) / 1200 (female) so a deficit never goes unreasonably low.
- Age is limited to 13-100. Mifflin-St Jeor is validated for adults, so say that in your report.
- "Today" is computed in the user's local time: the browser sends `tz_offset`; timestamps are stored as UTC.
- The JWT is kept in `localStorage` for simplicity. Production should prefer an httpOnly cookie.
- Route protection in the browser is a navigation convenience; the API enforces auth on every call.

## Adding AI later

`backend/app/services/food_recognition.py` defines the `FoodRecognizer` interface only. To add YOLO: train and evaluate on a documented dataset, implement the interface, add a router for `POST /api/food-recognition/predict`, and record the measured metrics before claiming any accuracy.
