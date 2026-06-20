# Buddhi - Senior Support Portal

Buddhi is a mobile-first, accessible support portal for senior citizens in H-West Ward, Mumbai. It provides emergency SOS, verified local services, call-to-book concierge support, reviews, and an admin dashboard.

## Stack

- Next.js 15, TypeScript, Tailwind CSS
- Node.js, Express, TypeScript
- PostgreSQL, Prisma
- OTP login with SMS provider abstraction
- WhatsApp Business API provider abstraction
- Docker-ready deployment

## Local Setup

1. Copy environment values:

```bash
cp .env.example .env
```

2. Start PostgreSQL:

```bash
docker compose up postgres -d
```

3. Install dependencies:

```bash
npm install
```

4. Prepare the database:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

5. Run the app:

```bash
npm run dev
```

- Public portal: http://localhost:3000
- API: http://localhost:4000

## Production Deployment

1. Set strong values for `JWT_SECRET` and `ADMIN_JWT_SECRET`.
2. Configure a production PostgreSQL database in `DATABASE_URL`.
3. Configure either MSG91 or Twilio for SMS.
4. Configure WhatsApp Business API credentials or keep `WHATSAPP_PROVIDER=mock` for non-production testing.
5. Run:

```bash
npm ci
npm run prisma:generate
npm run prisma:deploy
npm run build
npm run start
```

## Security Notes

- Prisma parameterizes database queries to protect against SQL injection.
- API input is validated with Zod.
- Helmet, CORS allowlisting, rate limiting, JWT auth, and cookie settings are configured in the API.
- SOS and OTP endpoints have stricter rate limits.
- Admin routes require a separate admin JWT.

## Accessibility Notes

- Minimum base font size is 16px.
- Touch targets are large and high contrast.
- SOS is available as a fixed action on every public page.
- Forms use explicit labels and error text.
- Motion is intentionally minimal.
