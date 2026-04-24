# MySmile Luxe Dental Lounge

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create your env file:

```bash
copy .env.example .env.local
```

3. Fill the required values in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SMTP_USER`
- `SMTP_PASS`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_FULL_NAME` (optional display name)

4. In Supabase SQL editor, run `supabase/schema.sql`.

5. Bootstrap the first admin user from env:

```bash
npm run setup:supabase
```

6. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Admin login

- Username (email): value of `ADMIN_EMAIL` in `.env.local`
- Password: value of `ADMIN_PASSWORD` in `.env.local`

No hardcoded admin credentials are stored in source code.
