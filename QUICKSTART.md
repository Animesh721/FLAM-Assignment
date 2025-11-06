# Quick Start Guide

Get the Collaborative Drawing Canvas running in minutes!

## 30-Second Setup

### Prerequisites
- Node.js v14+ installed
- npm installed
- A modern web browser

### Start the Application

```bash
# Navigate to project directory
cd collaborative-canvas

# Install dependencies (first time only)
npm install

# Start the server
npm start
```

Server will run on **http://localhost:3000**

## Using the Application

### Open in Browser
1. Open your browser
2. Navigate to `http://localhost:3000`
3. You're ready to draw!

### Test with Multiple Users

Open multiple browser tabs/windows and navigate to `http://localhost:3000`:
- Each tab connects as a separate user
- Draw in one tab, see updates in others instantly
- Try tools, colors, undo/redo, clear canvas

## Basic Usage

### Drawing
- **Select Tool**: Click "Brush" or "Eraser"
- **Choose Color**: Click a preset color or use color picker
- **Adjust Size**: Drag the size slider
- **Draw**: Click and drag on canvas

### Keyboard Shortcuts
- `Ctrl+Z` (or `Cmd+Z`): Undo
- `Ctrl+Y` (or `Cmd+Shift+Z`): Redo

### Buttons
- **Clear**: Clear entire canvas (confirms first)
- **Undo**: Undo last action
- **Redo**: Redo last undone action

## Testing Synchronization

### Real-Time Test
1. Open app in **Tab A** and **Tab B**
2. Draw in Tab A
3. Watch strokes appear in Tab B instantly

### Undo/Redo Test
1. Open app in **Tab A** and **Tab B**
2. Draw something in Tab A
3. Click "Undo" in Tab A
4. Both tabs show the undo immediately

### Cursor Test
1. Open app in **Tab A** and **Tab B**
2. Move mouse in Tab A
3. See cursor position indicator in Tab B

## Connection Status

### Green Indicator = Connected ✓
- Server is connected
- All features work
- Real-time sync active

### Red Indicator = Disconnected ✗
- Trying to reconnect automatically
- Local drawing still works
- Changes will sync when reconnected

## Troubleshooting

### Can't connect to localhost:3000
- Check server is running: look for "Server is running on..." message
- Check port isn't in use: `netstat -ano | find "3000"`
- Try a different port: `PORT=3001 npm start`

### Draw button doesn't work
- Make sure canvas has focus (click on it)
- Check connection status (green indicator)
- Refresh page and try again

### Undo doesn't work
- You need at least one drawing action first
- Undo button should be enabled after drawing
- Check browser console (F12) for errors

### Can't see other users' drawings
- Verify all users are on same server (http://localhost:3000)
- Check connection status indicators are green
- Open browser console and look for errors
- Refresh all windows

## Performance Tips

- Close other applications if experiencing lag
- Use simpler drawings if performance is slow
- Reduce number of concurrent users for testing
- Use Chrome for best performance

## Environment Variables

### Change Port
```bash
PORT=3001 npm start
```

### Set Node Environment
```bash
NODE_ENV=production npm start
```

## Next Steps

For more details, see:
- **README.md** - Full documentation and features
- **ARCHITECTURE.md** - Technical implementation details

## Common Questions

**Q: Does drawing persist between sessions?**
A: No, drawings are lost when server restarts (by design for this version)

**Q: Can I save drawings?**
A: Not in this version, but it's listed as a future enhancement

**Q: How many users can connect?**
A: Tested up to 10 concurrent users; more possible but performance may vary

**Q: Can I use multiple rooms?**
A: Default room is "default"; multiple rooms can exist but all users join the same one by default

**Q: Does it work on mobile?**
A: Yes, touch is supported but UI is optimized for desktop

**Q: Is there authentication?**
A: No authentication in this version; added features for security considerations in ARCHITECTURE.md

## Quick Demo Script

Try this sequence to see all features:

```
1. Open http://localhost:3000 in Tab A and Tab B
2. In Tab A, select Brush tool, draw something
3. In Tab B, verify you see the same drawing
4. In Tab A, click Undo - both should show undo
5. In Tab A, click Redo - both should show redo
6. In Tab B, select Eraser, erase part of drawing
7. In Tab A, verify erasure appears
8. Click Clear button (confirm)
9. Verify both tabs show empty canvas
10. In Tab A, draw a smiley face
11. In Tab B, add eyes to the face
12. In Tab A, verify you see Tab B's additions
```

## Getting Help

If you encounter issues:

1. Check browser console for errors: Press `F12` → Console tab
2. Check server terminal for error messages
3. Verify Node.js is installed: `node --version`
4. Verify npm is installed: `npm --version`
5. Try restarting the server
6. Check README.md for detailed documentation

---

**You're all set!** Happy drawing! 🎨
