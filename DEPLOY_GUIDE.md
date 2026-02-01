# 🚀 Deploy Bill Bot to Vercel

## Quick Deploy Steps

### Option 1: Deploy via GitHub (Recommended)

1. **Push to GitHub**
   ```bash
   cd /Users/bp/clawd/bill-bot
   git init
   git add .
   git commit -m "Initial commit - Bill Bot medical bill negotiator"
   gh repo create bill-bot --public --source=. --remote=origin --push
   ```

2. **Visit Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Connect your GitHub account
   - Select the `bill-bot` repository
   - Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd /Users/bp/clawd/bill-bot
   vercel
   ```

3. **Follow prompts**:
   - Set up and deploy? **Yes**
   - Which scope? **Select your account**
   - Link to existing project? **No**
   - What's your project's name? **bill-bot**
   - In which directory is your code located? **./**
   - Want to modify settings? **No**

## 🎯 After Deployment

Your app will be live at:
- **Production**: `https://bill-bot.vercel.app`
- **Preview**: `https://bill-bot-[hash].vercel.app`

### Custom Domain (Optional)
1. Go to your Vercel dashboard
2. Select the Bill Bot project
3. Go to Settings → Domains
4. Add your custom domain (e.g., `billbot.com`)

## 🔧 Environment Variables

For production, add these in Vercel dashboard:
- `NODE_ENV`: production
- Future: `TESSERACT_WORKER_PATH`, `DATABASE_URL`, etc.

## 📊 Analytics

Vercel provides basic analytics. For more insights, add:
```html
<!-- Add to index.html before </head> -->
<script defer data-domain="bill-bot.vercel.app" src="https://plausible.io/js/script.js"></script>
```

## 🚨 Quick Fixes

**If deployment fails:**
1. Check `vercel.json` is correct
2. Ensure all dependencies are in `package.json`
3. Run `npm install` locally first
4. Check Vercel logs for specific errors

**Common issues:**
- Port conflicts: Vercel handles ports automatically
- Build errors: Check Node version compatibility
- 404 errors: Verify routes in `vercel.json`

---

Ready to help millions fight medical debt! 🏥💪