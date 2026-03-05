# Quiz Party Game 🎉

A fun, interactive party quiz game where players answer questions about themselves and each other!

## Game Flow

1. **Host Creates Game** - Host sets up questions and gets a unique game code
2. **Players Join** - Players use the game code to join the session
3. **Round 1** - All participants answer questions about themselves
4. **Round 2** - Questions are randomly reassigned - participants answer about others (never themselves!)
5. **Results** - Host views and prints comprehensive results showing both rounds

## Features

✅ Simple host/player login system
✅ Real-time game lobby with player list
✅ Persistent data storage (survives page refreshes)
✅ Random question assignment (no self-assignments)
✅ Beautiful, game-show inspired UI
✅ Print-friendly results page
✅ Mobile responsive design

## How to Deploy to Vercel

### Option 1: Quick Deploy (Easiest)

1. **Create a new project on Vercel:**
   - Go to [vercel.com](https://vercel.com) and sign up/login
   - Click "Add New" → "Project"

2. **Upload your files:**
   - Create a new GitHub repository
   - Add these files:
     - `quiz-party-game.jsx` (rename to `page.jsx`)
     - Create `package.json` (see below)
   - Connect GitHub repo to Vercel

3. **Deploy!**
   - Vercel will automatically detect Next.js and deploy
   - Your game will be live at `your-project.vercel.app`

### Option 2: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# In your project directory
vercel

# Follow the prompts to deploy
```

## Project Setup for Vercel

Create a `package.json` file:

```json
{
  "name": "quiz-party-game",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1"
  }
}
```

Create a Next.js project structure:

```
quiz-party-game/
├── package.json
├── next.config.js
└── app/
    └── page.jsx (your quiz-party-game.jsx file)
```

Create `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
```

## Alternative: Direct React Deployment

If you prefer a simpler setup without Next.js:

1. Convert to a standard React app (Create React App or Vite)
2. Build the project: `npm run build`
3. Deploy the `build` folder to Vercel

## Running Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## How to Play

### As Host:
1. Click "Create Game (Host)"
2. Enter your name
3. Create questions (e.g., "What's your favorite food?", "Where would you travel?")
4. Share the game code with players
5. Wait for players to join (need at least 2 total participants)
6. Click "Start Round 1"
7. Answer your own questions
8. When everyone finishes, start Round 2
9. Answer questions about the randomly assigned players
10. View and print final results!

### As Player:
1. Get the game code from the host
2. Click "Join Game (Player)"
3. Enter the game code and your name
4. Wait in lobby for host to start
5. Answer Round 1 questions about yourself
6. Wait for other players
7. Answer Round 2 questions about assigned players
8. Wait for host to view results

## Data Storage

This app uses browser storage API to persist data across sessions. All game data is stored in the browser and shared across all participants in the same session.

**Important:** Data persists as long as the app is running on the same domain. If you need permanent storage, consider integrating:
- Vercel KV (Redis)
- Vercel Postgres
- Supabase
- Firebase

## Customization

### Change Colors:
Edit the gradient colors in the `<style>` section:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
```

### Add More Questions:
The host can add unlimited questions by clicking "+ Add Question"

### Modify Fonts:
Change the Google Fonts import:
```css
@import url('https://fonts.googleapis.com/css2?family=YourFont&display=swap');
```

## Tech Stack

- **React** - UI framework
- **Lucide React** - Icons
- **CSS** - Styling (no framework needed!)
- **Browser Storage API** - Data persistence
- **Vercel** - Hosting platform

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

**Players can't join:**
- Verify the game code is correct (case-sensitive)
- Make sure the game hasn't started yet
- Check browser console for errors

**Data not persisting:**
- Ensure the storage API is supported
- Check browser settings allow storage
- Try clearing browser cache and restarting

**Game not progressing:**
- Make sure all players have submitted answers
- Check the auto-refresh is working (should update every 2 seconds)
- Refresh the page to force an update

## Future Enhancements

Ideas for expansion:
- [ ] Add scoring system
- [ ] Timer for each round
- [ ] Multiple game modes
- [ ] Export results as PDF
- [ ] Team-based gameplay
- [ ] Custom themes
- [ ] Sound effects and music
- [ ] Leaderboard across games
- [ ] Share results on social media

## License

Free to use for personal and commercial projects!

## Support

Questions? Issues? Feel free to modify and improve the game as needed!

---

**Have fun playing Quiz Party! 🎊**
