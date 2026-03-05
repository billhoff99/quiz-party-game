# Quick Start - Deploy to Vercel in 5 Minutes

## Method 1: Deploy via GitHub (Recommended - Easiest!)

### Step 1: Create GitHub Repository
1. Go to [github.com](https://github.com) and create a new repository
2. Name it `quiz-party-game`
3. Keep it public or private (your choice)

### Step 2: Upload Files
Upload these files to your repository:
```
quiz-party-game/
├── package.json
├── next.config.js
├── README.md
└── app/
    ├── layout.jsx
    └── page.jsx
```

### Step 3: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/login (can use your GitHub account)
3. Click "Add New..." → "Project"
4. Select your `quiz-party-game` repository
5. Click "Deploy" (Vercel auto-detects Next.js!)
6. Wait 2 minutes... Done! 🎉

Your game will be live at: `https://quiz-party-game.vercel.app`

---

## Method 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to project folder
cd quiz-party-game

# Deploy!
vercel

# Follow prompts:
# - Login to Vercel
# - Confirm project settings
# - Deploy!
```

---

## Method 3: Drag & Drop (Manual)

1. Install dependencies locally:
   ```bash
   npm install
   npm run build
   ```

2. Go to [vercel.com](https://vercel.com) → "Add New" → "Project"
3. Drag and drop the entire project folder
4. Vercel will build and deploy automatically

---

## After Deployment

✅ **Test your game:**
1. Open your Vercel URL
2. Create a game as host
3. Open another browser/incognito window
4. Join as a player using the game code
5. Play through both rounds!

✅ **Share with friends:**
- Send them your Vercel URL
- They join as players
- Have fun! 🎉

---

## Troubleshooting

**Build fails on Vercel:**
- Check that all files are in the correct directories
- Verify `package.json` dependencies are correct
- Look at build logs in Vercel dashboard

**Game not working after deployment:**
- Clear browser cache and refresh
- Check browser console for errors
- Ensure you're using a modern browser (Chrome, Firefox, Safari)

**Storage not persisting:**
- This uses browser storage API - it should work automatically
- If issues persist, you may need to upgrade to Vercel KV or a database

---

## Free Tier Limits

Vercel Free Tier includes:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth per month
- ✅ Automatic HTTPS
- ✅ Custom domain support
- ✅ Perfect for party games with friends!

---

## Next Steps

After deploying:
1. **Custom Domain**: Add your own domain in Vercel dashboard
2. **Analytics**: Enable Vercel Analytics to see visitor stats
3. **Database**: Upgrade to Vercel Postgres for permanent storage
4. **Share**: Send your game link to friends!

---

**Questions?** The Vercel docs are great: [vercel.com/docs](https://vercel.com/docs)

**Ready to play?** Deploy and start your first quiz party! 🎊
