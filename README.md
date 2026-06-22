# Deployment Request Sheet

Full-stack deployment request application with a **dynamic form schema**, role-based access (User / Admin), Next.js frontend, FastAPI backend, and PostgreSQL.

## Architecture

```
┌─────────────┐     REST/JWT      ┌─────────────┐     SQLAlchemy     ┌────────────┐
│  Next.js    │ ◄──────────────► │   FastAPI   │ ◄────────────────► │ PostgreSQL │
│  (React)    │                  │   Backend   │                    │            │
└─────────────┘                  └─────────────┘                    └────────────┘
```

- **Dynamic form**: Field definitions live in `form_fields`. The UI renders from `/api/form/schema` — admins can add/deactivate fields without redeploying.
- **EAV storage**: Submission values are stored in `request_field_values` keyed by field ID.
- **Roles**:
  - **User**: Register, submit requests, view own submissions
  - **Admin**: View all requests, edit any request, update status/notes, manage form fields

## Form Fields (seeded)

Matches your Deployment Request Sheet:

1. Name
2. Request Date
3. Application Name
4. Git Repository
5. Hosting URL
6. Environment (test / Production)
7. Deployment type (New deployment / Redeployment)
8. Estimated Duration
9. Deployment Date
10. Comments

## Quick Start

### Prerequisites

- Docker Desktop
- Python 3.11+
- Node.js 18+

### 1. Start PostgreSQL

```bash
docker-compose up -d
```

### 2. Backend

```bash
cd backend
python -m venv .venv

# Windows PowerShell
.venv\Scripts\Activate.ps1

pip install -r requirements.txt
copy .env.example .env
python seed.py
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```

App: http://localhost:3000

## Register

Go to **http://localhost:3000/register** and create an account. Choose **User** to submit deployment requests, or **Admin** to view and manage all requests.

## API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login/json` | Public | Login (JSON) |
| GET | `/api/auth/me` | Auth | Current user |
| GET | `/api/form/schema` | Public | Active form fields |
| GET | `/api/form/fields` | Admin | All fields |
| POST | `/api/form/fields` | Admin | Create field |
| PATCH | `/api/form/fields/{id}` | Admin | Update field |
| POST | `/api/requests` | User | Submit request |
| GET | `/api/requests` | Auth | List requests (own or all for admin) |
| GET | `/api/requests/{id}` | Auth | Get request |
| PATCH | `/api/requests/{id}` | Auth | Update request (admin: full edit + status) |

## Project Structure

```
Deployment_form/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── services.py      # Business logic
│   │   └── routers/         # API routes
│   ├── seed.py              # DB init + demo data
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── app/               # Next.js pages
│       ├── components/        # DynamicForm, Auth, etc.
│       └── lib/               # API client & types
└── docker-compose.yml
```

## Production Notes

- Change `SECRET_KEY` in backend `.env`
- Use HTTPS and secure cookie/token storage
- Run migrations with Alembic for schema changes
- Set strong passwords and disable demo accounts
