# CK STYLE – Supabase Setup

Auth and all data now use **Supabase** (publishable key in frontend; secret key only on server if you add one).

---

## 1. Create the `profiles` table and RLS

**Do not paste the whole SUPABASE_SETUP.md into the SQL Editor** (it’s markdown and will cause errors).

In **Supabase Dashboard** → **SQL Editor**:

1. Open the file **`supabase-profiles.sql`** in this folder (it contains only SQL), **or**
2. Copy the SQL from that file.

Paste **only that SQL** into the SQL Editor and click **Run**.

---

## 2. Disable email confirmation (optional)

To allow **immediate signup and login** without email verification:

1. **Supabase Dashboard** → **Authentication** → **Providers** → **Email**.
2. Turn **off** “Confirm email” (or equivalent).
3. Save.

Then new users can sign in right after signup.

---

## 3. Password reset (Forgot password) – required to avoid “Failed to fetch”

**Do not open the app from `file://`.** Use a local server (e.g. Live Server, `npx serve`, or `python -m http.server`) so the site runs at `http://localhost:PORT` or `https://...`.

1. **Supabase Dashboard** → **Authentication** → **URL Configuration**.
2. Set **Site URL** to your app origin, e.g. `http://localhost:5500` or `https://yourdomain.com`.
3. Under **Redirect URLs**, add the **exact** URL of your reset page (where users land after clicking the email link), e.g.  
   - Local: `http://localhost:5500/reset-password.html` (adjust port/path to match your server).  
   - Production: `https://yourdomain.com/reset-password.html`.  
   You can add multiple entries (local + production). Wildcards are allowed (e.g. `http://localhost:*/**`).
4. Save.

If **Redirect URLs** is missing the URL you’re using, or you’re on `file://`, the Forgot password request can fail with a network-style error (“Failed to fetch”). The app only uses the **publishable (anon) key** and the **Project URL** in the browser; no secret key is used.

**Important:** If you use `http://127.0.0.1:5500`, set **Site URL** to `http://127.0.0.1:5500` and add **Redirect URL** `http://127.0.0.1:5500/ck-style-html/reset-password.html` (path must match your app).

---

## 4. Password reset emails (SMTP)

For users to **receive** the reset link by email:

1. **Supabase Dashboard** → **Project Settings** (gear) → **Authentication** → **SMTP Settings**.
2. Either use Supabase’s built-in sender (limited; good for testing) or configure **Custom SMTP** (e.g. Gmail, SendGrid, Brevo, AWS SES).
3. If you use custom SMTP, fill in **Sender email**, **Sender name**, **Host**, **Port**, and **Username/Password** (or API key) for your provider.
4. Save.

If SMTP is not configured or fails, the “Send Reset Link” request can still **succeed** (you’ll see the success message), but the email may not arrive. Check **Authentication** → **Logs** (or **Auth logs**) for delivery errors.

---

## 5. Client config (already set)

- **Project URL:** `https://xlrzoylmgwsrxjcdwsos.supabase.co` (in `js/supabase.js`).
- **Publishable (anon) key only** is set in `js/supabase.js`. The secret key is **never** used in the frontend.

---

## 6. Verify: tables and RLS

If signup or profile creation fails, check:

1. **Table exists:** **Table Editor** → `public.profiles` with columns: `id` (uuid, PK), `email`, `full_name`, `avatar_url`, `created_at`, `updated_at`. If missing, run **`supabase-profiles.sql`** in the SQL Editor.
2. **RLS is on:** **Table Editor** → `profiles` → RLS enabled.
3. **Policies:** For `profiles` you need:
   - **SELECT** using `(auth.uid() = id)`
   - **INSERT** with check `(auth.uid() = id)`
   - **UPDATE** using `(auth.uid() = id)`

Without these, “permission denied” or missing table errors will appear; fix by running the SQL in **`supabase-profiles.sql`**.

---

## 7. Verify: auth (immediate session after signup)

For signup to create a **valid session** so the user is logged in immediately:

1. **Authentication** → **Providers** → **Email**.
2. Turn **OFF** “Confirm email”.
3. Save.

If “Confirm email” is ON, Supabase will not return a session until the user confirms; login after signup will work only after confirmation.

---

## 8. Run the app

Open your site (e.g. via a local server so the origin matches what you added in Redirect URLs). Signup and login use Supabase Auth; profile data is stored in the `profiles` table. On failure, the exact Supabase error is shown on the page and logged in the browser console (F12 → Console).
