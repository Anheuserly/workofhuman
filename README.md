# WorkOfHuman

WorkOfHuman is a Next.js 15 and Appwrite platform shell for a global creative expression network across human-made and AI-assisted work.

## Local Development

```bash
npm install
npm run dev
```

The app is intentionally Appwrite-first. Without server-side Appwrite credentials it renders a connection state instead of mock content.

## Required Environment

Copy `.env.example` to `.env.local` and set:

- `APPWRITE_ENDPOINT`
- `APPWRITE_PROJECT_ID`
- `APPWRITE_API_KEY`
- `APPWRITE_DATABASE_ID`
- `NEXT_PUBLIC_APPWRITE_ENDPOINT`
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID`

Then create the collections described in [appwrite.schema.md](./appwrite.schema.md) and run:

```bash
npm run appwrite:seed
```
