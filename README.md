# Collaborative Drawing Canvas

A real-time collaborative drawing application where multiple users can draw simultaneously on the same canvas with instant synchronization.

## Features

### Core Functionality
- **Real-time Drawing Synchronization**: See other users' strokes as they draw in real-time
- **Multiple Drawing Tools**:
  - Brush tool with customizable color and width
  - Eraser tool
  - 8 preset colors + custom color picker
  - Adjustable stroke width (1-50px)

- **User Management**:
  - Each user gets a unique color indicator
  - User list shows all connected participants
  - See cursor positions of other users
  - Auto-assigned user IDs

- **Undo/Redo System**:
  - Global undo/redo across all users
  - Keyboard shortcuts (Ctrl+Z, Ctrl+Y)
  - Works with all drawing operations

- **Room System**:
  - Multiple isolated drawing sessions
  - Default room for guests
  - All users in the same room see the same canvas

- **Connection Status**:
  - Real-time connection indicator
  - Automatic reconnection on disconnect
  - Latency display
  - Message queuing during disconnection

### Technical Features
- Mobile/Touch support for drawing
- Smooth line drawing with path optimization
- Efficient canvas redrawing
- Canvas state synchronization for new users
- Graceful error handling

## Project Structure

```
collaborative-canvas/
├── client/
│   ├── index.html          # Main HTML page
│   ├── style.css           # Styling and layout
│   ├── canvas.js           # Canvas drawing operations
│   ├── websocket.js        # WebSocket client management
│   └── main.js             # Application logic and UI coordination
├── server/
│   ├── server.js           # Express + WebSocket server
│   ├── rooms.js            # Room and user management
│   └── drawing-state.js    # Drawing operation history
├── package.json            # Dependencies
├── README.md               # This file
└── ARCHITECTURE.md         # Technical architecture details
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Modern browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone or extract the project**
   ```bash
   cd collaborative-canvas
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

   The server will start on `http://localhost:3000`

4. **Open in browser**
   - Open your browser and navigate to `http://localhost:3000`
   - The application will automatically connect to the WebSocket server
   - You'll be assigned a room and user ID automatically

### Running Multiple Instances Locally

To test with multiple users on the same machine:

1. Open multiple browser tabs
2. Navigate to `http://localhost:3000` in each tab
3. Start drawing in one tab - you'll see the strokes appear in all other tabs simultaneously
4. Try the different tools, colors, and undo/redo to see real-time synchronization

## Usage

### Drawing
1. **Select Tool**: Click "Brush" or "Eraser" button
2. **Choose Color**: Click preset colors or use the color picker
3. **Adjust Size**: Use the size slider to change stroke width
4. **Draw**: Click and drag on the canvas to draw

### Keyboard Shortcuts
- **Ctrl+Z** (or **Cmd+Z** on Mac): Undo last action
- **Ctrl+Y** (or **Cmd+Shift+Z** on Mac): Redo action

### Buttons
- **Clear**: Clears the entire canvas (requires confirmation)
- **Undo**: Undo the last drawing action
- **Redo**: Redo the last undone action

### Room Management
- Default room ID is "default"
- All users in the same room see the same canvas
- (Optional) Change room by modifying the connection URL

## How It Works

### Real-time Synchronization
1. **Local Drawing**: When you draw, the action is recorded locally on your canvas
2. **Send to Server**: Drawing events are sent to the server via WebSocket
3. **Server Broadcasts**: The server forwards the drawing event to all other users in the room
4. **Remote Drawing**: Other users' clients receive the event and render the stroke

### Undo/Redo Strategy
- **Local History**: Each client maintains its own undo/redo stack
- **Server Coordination**: When undo/redo is triggered, the server is notified
- **Global Synchronization**: The server maintains the operation history and broadcasts undo/redo events to ensure all clients stay in sync
- **Conflict Handling**: The server acts as the source of truth for history state

### Canvas State Synchronization
- When a new user joins, the server sends the current action history
- The new user replays all actions to reconstruct the current canvas state
- This ensures new joiners see the exact same canvas as existing users

## Performance Considerations

- **Path Optimization**: Drawing operations are optimized to prevent excessive redraws
- **Message Batching**: Drawing events are sent individually for low-latency updates
- **Throttled Cursor Updates**: Cursor positions are updated at a reasonable frequency
- **Canvas Caching**: Image data is only updated when necessary
- **History Limits**: Canvas history is limited to 50 states locally and 100 actions on the server to prevent memory issues

## Known Limitations

1. **Canvas Size**: Fixed at 1200x600 pixels (can be modified in index.html)
2. **Concurrent Users**: Tested up to 10 concurrent users; performance may degrade with many more
3. **Network Latency**: High latency connections may show visible delays in synchronization
4. **Browser Compatibility**: Requires modern browser with WebSocket and Canvas API support
5. **Mobile**: Touch support is implemented but UI is optimized for desktop

## Testing

### Single User Testing
1. Open the application in one browser tab
2. Use all drawing tools and verify they work correctly
3. Test undo/redo functionality
4. Test color selection
5. Test clear canvas button

### Multi-User Testing
1. Open the application in multiple browser tabs/windows
2. Draw in one window and verify it appears in others
3. Use undo in one window and verify the change appears in all windows
4. Test simultaneous drawing by drawing in multiple windows at once
5. Join a new window midway through and verify it shows the current canvas state

### Network Testing
1. Open browser DevTools (F12)
2. Go to Network tab
3. Throttle connection (e.g., "Slow 3G")
4. Draw and observe real-time updates with latency
5. Test disconnection by toggling offline mode

## Troubleshooting

### Application won't load
- Verify Node.js is installed: `node --version`
- Check server is running: Look for "Server is running on..." message
- Clear browser cache and reload (Ctrl+Shift+R)

### Can't draw
- Verify canvas is in focus (click on canvas)
- Check browser console for errors (F12 → Console tab)
- Verify connection status shows "Connected"

### Undo/Redo not working
- Verify at least one action has been performed
- Check browser console for errors
- Try refreshing the page

### Multiple users not seeing each other's drawings
- Verify all users are connecting to the same server
- Check that users are in the default room
- Verify WebSocket connection is active (check status indicator)
- Open browser console and look for error messages

### High latency
- Check network conditions
- Move closer to server if applicable
- Reduce number of concurrent users
- Check browser DevTools for performance bottlenecks

## Deployment

### Deploying to Heroku

1. **Create Heroku app**
   ```bash
   heroku create your-app-name
   ```

2. **Deploy code**
   ```bash
   git push heroku main
   ```

3. **Access application**
   Open `https://your-app-name.herokuapp.com`

### Deploying to Other Platforms
- Ensure Node.js version is specified in package.json
- Use appropriate environment variables for PORT
- Server automatically serves static files from `client/` directory

## Environment Variables

- **PORT**: Port number (default: 3000)
- **NODE_ENV**: Set to "production" for optimizations

## Development

### Adding New Tools
1. Modify `client/canvas.js` to add drawing logic
2. Add tool selection button in `client/index.html`
3. Handle the tool in the `handleMouseMove` method

### Scaling Considerations
- Current implementation supports ~10 concurrent users per server
- For larger scale:
  - Implement server clustering with Redis pub/sub
  - Use WebSocket load balancer
  - Consider offloading canvas state to database
  - Implement action log database for persistence

## Time Spent

- **Project Planning**: 30 minutes
- **Frontend Development**: 2 hours (HTML, CSS, Canvas API)
- **WebSocket Client Implementation**: 1 hour
- **Backend Server Development**: 1.5 hours
- **Room and State Management**: 1 hour
- **Testing and Debugging**: 1 hour
- **Documentation**: 1 hour

**Total**: ~8 hours

## Code Quality Notes

- Written in vanilla JavaScript (no frameworks)
- No external drawing libraries used (raw Canvas API)
- Proper separation of concerns (Canvas, WebSocket, UI)
- Error handling for network issues
- Clean, readable code with comments
- Modular architecture for easy extension

## Browser Support

- ✅ Chrome/Chromium (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ⚠️ Mobile browsers (touch support, but UI not optimized)

## License

MIT License

## Future Improvements

1. **Features**:
   - Shape tools (rectangle, circle, line)
   - Text tool
   - Image insertion
   - Layers system
   - Drawing templates/backgrounds

2. **Performance**:
   - Implement operational transformation for better conflict resolution
   - WebGL rendering for larger canvases
   - Streaming canvas updates for large drawings

3. **Persistence**:
   - Save drawings to database
   - Session history
   - Export to image formats (PNG, SVG)

4. **User Experience**:
   - User authentication
   - Named rooms
   - User permissions
   - Comments/annotations
   - Drawing timeline playback

## Support

For issues or questions:
1. Check the ARCHITECTURE.md for technical details
2. Review troubleshooting section above
3. Check browser console for error messages
4. Verify network connectivity
