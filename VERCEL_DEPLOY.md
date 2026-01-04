# 🚀 Vercel Deployment Guide

## Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

## Step 2: Initial Deployment

```bash
cd c:\Users\junai\Desktop\securedash\securedash-next
vercel
```

**Follow the prompts:**
- Link to existing project? → No
- Project name? → `securedash-next` (or your choice)
- Which directory? → `./` (press Enter)
- Override settings? → No

This creates a **preview deployment** (not production yet).

---

## Step 3: Add Vercel Postgres Database

1. Go to https://vercel.com/dashboard
2. Click on your project (`securedash-next`)
3. Go to **Storage** tab
4. Click **Create Database**
5. Choose **Postgres**
6. Accept defaults and click **Create**

**Vercel automatically injects these environment variables:**
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL` ← This is what Prisma needs
- `POSTGRES_URL_NON_POOLING`

---

## Step 4: Update Prisma Configuration

Your `schema.prisma` already uses `env("DATABASE_URL")`, which is perfect!

Vercel will automatically set `DATABASE_URL` to `POSTGRES_PRISMA_URL`.

**No code changes needed!** ✅

---

## Step 5: Add JWT Secret

In Vercel Dashboard:
1. Project Settings → **Environment Variables**
2. Add new variable:
   - **Key:** `JWT_SECRET`
   - **Value:** `your-super-secret-production-key-min-32-chars`
   - **Environments:** Production, Preview, Development (select all)
3. Click **Save**

---

## Step 6: Push Database Schema

Vercel will run `prisma generate` automatically during build, but you need to push the schema:

**Option A: Use Vercel CLI**
```bash
# This runs migrations on your Vercel database
vercel env pull .env.local
npx prisma db push
```

**Option B: Add to package.json** (Recommended)
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "postinstall": "prisma generate",
    "vercel-build": "prisma generate && prisma db push && next build"
  }
}
```

---

## Step 7: Deploy to Production

```bash
vercel --prod
```

**Your app is now live!** 🎉

Example URL: `https://securedash-next.vercel.app`

---

## Step 8: Test Your Deployment

1. Visit your production URL
2. Sign up for a new account
3. Create some todos/notes
4. Test drag-and-drop, Markdown, etc.

---

## Troubleshooting

### Issue: "Prisma Client did not initialize yet"
**Fix:** Add this to `package.json`:
```json
"postinstall": "prisma generate"
```

### Issue: "Can't reach database server"
**Fix:** Ensure environment variables are set in Vercel dashboard, then redeploy.

### Issue: Build fails with TypeScript errors
**Fix:** Run `npm run build` locally first to catch errors.

---

## Environment Variables Summary

**Local (.env):**
```env
DATABASE_URL="postgresql://postgres:root@localhost:5432/securedash_next"
JWT_SECRET="local-dev-secret"
```

**Vercel (auto-configured):**
- `DATABASE_URL` → Points to Vercel Postgres
- `POSTGRES_PRISMA_URL` → Connection pooling enabled
- `JWT_SECRET` → Set manually in dashboard

---

## Quick Deploy Checklist

- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Run `vercel` to create project
- [ ] Add Postgres database in Vercel dashboard
- [ ] Add `JWT_SECRET` environment variable
- [ ] Update `package.json` with `vercel-build` script
- [ ] Run `vercel --prod`
- [ ] Test signup/login on production URL
- [ ] Update README.md with production URL

---

**Need help?** Check Vercel docs: https://vercel.com/docs/storage/vercel-postgres
