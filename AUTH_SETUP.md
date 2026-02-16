# CK STYLE – Authentication

Auth and data now use **Supabase** (no Firebase).

- **Setup:** See **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** for:
  - Creating the `profiles` table and RLS
  - Disabling email confirmation (optional, for immediate signup/login)
  - Password reset redirect URL
  - Keys (publishable in frontend only; never put the secret key in the browser)

## Intended flows

| Flow               | Behavior                                                                 |
|--------------------|---------------------------------------------------------------------------|
| **Signup**         | Account created → user signed in immediately → redirect to dashboard.    |
| **Login**          | Validate email/password → redirect to dashboard.                         |
| **Forgot password**| Send reset email → user clicks link → set new password (email only).     |

No “Confirm your signup” code screen; no code input is required for signup or login.
