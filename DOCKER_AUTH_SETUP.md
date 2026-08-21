# Authentication Setup for Docker

## ✅ What's Already Done

All code changes are complete:
- ✅ Database schema updated with users table
- ✅ Backend authentication routes created
- ✅ All API routes protected with JWT
- ✅ Frontend login pages and auth context
- ✅ Protected routes in frontend

## 📋 What You Need to Do

### Step 1: Set Up Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Configure OAuth consent screen if prompted:
   - App name: **JobLens**
   - Add your email as test user
6. Create OAuth client ID:
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:4001/api/auth/google/callback`
7. Copy the **Client ID** and **Client Secret**

### Step 2: Configure Environment Variables

Create or update `/Users/I764616/joblens/.env` in the **root** directory:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_actual_google_client_id
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret

# JWT Secret (generate a random string)
JWT_SECRET=your_random_secret_here

# Backend/Frontend URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:4001

# Anthropic API Key
ANTHROPIC_API_KEY=your_anthropic_key

# Database (already configured in docker-compose.yml)
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/joblens
QDRANT_URL=http://qdrant:6333
PORT=4001
```

**Generate a secure JWT secret:**
```bash
openssl rand -base64 32
```

### Step 3: Rebuild and Restart Docker Containers

Since we added new dependencies to `package.json`, you need to rebuild:

```bash
# Stop existing containers
docker-compose down

# Rebuild with no cache to ensure fresh install
docker-compose build --no-cache

# Start everything
docker-compose up -d

# Check logs to ensure everything started
docker-compose logs -f backend
```

### Step 4: Verify Database Schema

The schema should auto-apply on first run, but you can verify:

```bash
# Check if users table exists
docker exec -it joblens_postgres psql -U postgres -d joblens -c "\dt"

# You should see: users, resumes, jobs, match_results, etc.
```

If the users table is missing:

```bash
docker exec -it joblens_postgres psql -U postgres -d joblens -f /docker-entrypoint-initdb.d/schema.sql
```

### Step 5: Test Authentication

1. Open [http://localhost:3000](http://localhost:3000)
2. You should be redirected to `/login`
3. Click "Continue with Google"
4. Sign in with your Google account
5. You should be redirected back and see your profile

## 🔍 Troubleshooting

### Check Backend Logs
```bash
docker-compose logs -f backend
```

Look for:
- ✅ "Backend running on http://localhost:4001"
- ❌ Any passport or authentication errors

### Check if Packages Installed
```bash
docker exec -it joblens_backend npm list passport passport-google-oauth20 jsonwebtoken
```

### Rebuild if Dependencies Missing
```bash
docker-compose down
docker-compose build --no-cache backend
docker-compose up -d
```

### Check Environment Variables
```bash
docker exec -it joblens_backend env | grep GOOGLE
docker exec -it joblens_backend env | grep JWT_SECRET
```

### Google OAuth Errors

**"redirect_uri_mismatch":**
- Ensure redirect URI in Google Console is exactly: `http://localhost:4001/api/auth/google/callback`

**"access_blocked":**
- Add your Gmail as a test user in OAuth consent screen
- Make sure app is in "Testing" mode

### Database Issues

**Users table missing:**
```bash
docker exec -it joblens_postgres psql -U postgres -d joblens -c "\d users"
```

**Recreate database:**
```bash
docker-compose down -v  # ⚠️ This deletes all data!
docker-compose up -d
```

## 🔄 Development Workflow

After setup, when you make code changes:

```bash
# Code changes are auto-reloaded (volume mounted)
# No rebuild needed for code changes

# Only rebuild if you change package.json:
docker-compose restart backend
```

## 📦 What Docker Handles Automatically

- ✅ Installing npm dependencies (on build)
- ✅ Creating database tables (on first run)
- ✅ Network connectivity between containers
- ✅ Hot reload for code changes (via volumes)

You do **NOT** need to run `npm install` manually since Docker handles it during the build process.
