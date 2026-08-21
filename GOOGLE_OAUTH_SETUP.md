# Google OAuth Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Name your project (e.g., "JobLens")
4. Click **"Create"**

## Step 2: Enable Google+ API

1. In the left sidebar, go to **"APIs & Services"** → **"Library"**
2. Search for "Google+ API"
3. Click on it and press **"Enable"**

## Step 3: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. If prompted, configure the OAuth consent screen:
   - User Type: **External**
   - App name: **JobLens**
   - User support email: Your email
   - Developer contact: Your email
   - Click **"Save and Continue"**
   - Scopes: Click **"Save and Continue"** (we'll use default scopes)
   - Test users: Add your email for testing
   - Click **"Save and Continue"**

4. Back to Create OAuth client ID:
   - Application type: **Web application**
   - Name: **JobLens Web Client**
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `http://localhost:4001`
   - Authorized redirect URIs:
     - `http://localhost:4001/api/auth/google/callback`
   - Click **"Create"**

5. Copy the **Client ID** and **Client Secret**

## Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env` in the backend directory:
   ```bash
   cd apps/backend
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```bash
   GOOGLE_CLIENT_ID=your_actual_client_id_here
   GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
   JWT_SECRET=generate_a_random_string_here
   ```

3. Generate a secure JWT secret (on Mac/Linux):
   ```bash
   openssl rand -base64 32
   ```

## Step 5: Install Dependencies

```bash
# Backend
cd apps/backend
npm install

# Frontend
cd ../frontend
npm install
```

## Step 6: Initialize Database

Make sure PostgreSQL is running and create the database:

```bash
psql -U postgres
CREATE DATABASE joblens;
\q
```

Then run the schema:

```bash
cd apps/backend
psql -U postgres -d joblens -f src/db/schema.sql
```

## Step 7: Start the Application

Open two terminals:

**Terminal 1 - Backend:**
```bash
cd apps/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd apps/frontend
npm run dev
```

## Step 8: Test Authentication

1. Open [http://localhost:3000](http://localhost:3000)
2. You should be redirected to the login page
3. Click **"Continue with Google"**
4. Sign in with your Google account (must be added as a test user)
5. You should be redirected back to the app and see your profile in the header

## Troubleshooting

### "Access blocked: This app's request is invalid"
- Check that your redirect URI exactly matches: `http://localhost:4001/api/auth/google/callback`
- Ensure JavaScript origins include both `http://localhost:3000` and `http://localhost:4001`

### "redirect_uri_mismatch"
- The redirect URI in your Google Console must exactly match the one in the code
- Check for trailing slashes - they must match exactly

### 401 Unauthorized on API calls
- Check that the JWT_SECRET is set in your `.env` file
- Make sure the token is being stored in localStorage
- Open browser DevTools → Application → Local Storage → check for `auth_token`

### Database connection errors
- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in `.env` matches your PostgreSQL credentials
- Ensure the `joblens` database exists

## Production Deployment

When deploying to production:

1. Update authorized origins and redirect URIs in Google Console
2. Use HTTPS URLs (e.g., `https://yourdomain.com/api/auth/google/callback`)
3. Generate a new, secure JWT_SECRET for production
4. Set all environment variables on your hosting platform
5. Update FRONTEND_URL and BACKEND_URL in `.env`

## Security Notes

- Never commit `.env` files to version control
- Keep your `GOOGLE_CLIENT_SECRET` and `JWT_SECRET` private
- Use different credentials for development and production
- Regularly rotate your JWT secret in production
