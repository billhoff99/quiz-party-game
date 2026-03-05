# Quiz Party Game - Project Structure

## File Structure

```
quiz-party-game/
│
├── package.json           # Node.js dependencies and scripts
├── next.config.js         # Next.js configuration
├── README.md              # Full documentation
├── DEPLOY.md              # Quick deployment guide
│
└── app/                   # Next.js App Router directory
    ├── layout.jsx         # Root layout with metadata
    └── page.jsx           # Main game component
```

## Files Explanation

### `package.json`
Defines project dependencies and scripts. Contains:
- Next.js (React framework optimized for Vercel)
- React and React-DOM
- Lucide React (icons)

### `next.config.js`
Basic Next.js configuration with:
- React Strict Mode enabled
- SWC minification for faster builds

### `app/layout.jsx`
Root layout component that:
- Sets page metadata (title, description)
- Wraps all pages in HTML structure

### `app/page.jsx`
The main Quiz Party game component containing:
- All game logic and state management
- UI components for host and player views
- Storage API integration for data persistence
- Two-round game flow implementation

## How to Set Up Locally

### 1. Install Node.js
Make sure you have Node.js 18+ installed:
```bash
node --version  # Should be v18.0.0 or higher
```

### 2. Install Dependencies
```bash
cd quiz-party-game
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

## Deployment Options

### Option A: Vercel (Easiest - Recommended)
See `DEPLOY.md` for step-by-step instructions.
Perfect for this project - optimized for Next.js!

### Option B: Other Platforms
- **Netlify**: Similar to Vercel, great Next.js support
- **Railway**: Good for full-stack apps
- **Cloudflare Pages**: Fast global deployment

## Key Features

✅ **Persistent Storage**: Uses browser Storage API
✅ **Real-time Updates**: Auto-refresh every 2 seconds
✅ **Random Assignment**: Players never get their own questions in Round 2
✅ **Mobile Responsive**: Works great on phones and tablets
✅ **No Database Required**: All data stored in browser (can upgrade later)

## Game Data Structure

```javascript
// Game Session
{
  gameId: "abc123",
  hostId: "xyz789",
  hostName: "Alice",
  questions: ["Q1", "Q2", "Q3"],
  status: "waiting" | "round1" | "round2" | "completed",
  participants: ["id1", "id2", "id3"],
  createdAt: "2024-01-01T00:00:00Z"
}

// Participant
{
  participantId: "xyz789",
  name: "Bob",
  isHost: false,
  joinedAt: "2024-01-01T00:00:00Z"
}

// Round 1 Answers
{
  participantId: "xyz789",
  answers: ["answer1", "answer2", "answer3"],
  submittedAt: "2024-01-01T00:00:00Z"
}

// Round 2 Assignments
{
  "participantId1": [
    { questionIndex: 0, assignedParticipantId: "id2" },
    { questionIndex: 1, assignedParticipantId: "id3" }
  ]
}

// Round 2 Answers
{
  participantId: "xyz789",
  answers: ["answer1", "answer2", "answer3"],
  submittedAt: "2024-01-01T00:00:00Z"
}
```

## Customization Tips

### Change Color Scheme
Edit the gradients in `app/page.jsx`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
```

### Add More Features
Ideas to implement:
- Scoring system
- Timer for each round
- Multiple game modes
- PDF export of results
- Team-based gameplay

### Integrate Database
For permanent storage, consider:
- **Vercel Postgres**: Built into Vercel
- **Supabase**: Easy PostgreSQL
- **Firebase**: Real-time database

## Development Tips

### Testing Locally
1. Open multiple browser tabs/windows
2. Create game in one (host)
3. Join in others (players)
4. Test full game flow

### Debugging
- Check browser console for errors
- Use React DevTools to inspect state
- Monitor Network tab for storage operations

### Best Practices
- Test with at least 3 participants
- Try different question types
- Test on mobile devices
- Check print layout for results

## Performance

The app is optimized for:
- Fast initial load (<2s)
- Smooth animations
- Responsive interactions
- Efficient re-renders with React

## Browser Support

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+
✅ Mobile browsers (iOS Safari, Chrome Mobile)

## License

Free to use, modify, and deploy!

## Support

Questions or issues? Check:
1. README.md - Full documentation
2. DEPLOY.md - Deployment guide
3. Browser console - Error messages
4. Vercel docs - Platform help

---

**Ready to deploy?** Follow the DEPLOY.md guide!
**Need help?** Check the README.md for detailed info!

Happy gaming! 🎉
