# Deploy to Render.com

Complete guide to deploy your Collaborative Drawing Canvas to Render.

## Why Render?

✅ **Full WebSocket Support** - Real-time collaboration works perfectly
✅ **Free Tier** - Deploy for free (with limitations)
✅ **Easy Deployment** - Connect GitHub, auto-deploys
✅ **Production Ready** - Scales easily
✅ **No Configuration Files Needed** - Auto-detects Node.js

---

## Prerequisites

1. **Render Account** - Create free account at https://render.com
2. **GitHub Repository** - Your code on GitHub (already done!)
3. **Git Access** - Render needs access to your GitHub

---

## Step-by-Step Deployment

### Step 1: Create Render Account

1. Go to https://render.com
2. Click "Sign Up"
3. Sign up with GitHub (easier)
4. Authorize Render to access your GitHub

### Step 2: Create New Service

1. Go to Dashboard (after login)
2. Click "New+" button (top right)
3. Select "Web Service"

### Step 3: Connect GitHub Repository

1. Search for repository: `FLAM-Assignment`
2. Click to select it
3. Click "Connect"

### Step 4: Configure Service

Fill in the form:

**Name**: `flam-assignment` (or any name)

**Environment**: `Node`

**Build Command**: `npm install`

**Start Command**: `npm start`

**Plan**: Free (optional, but free works)

### Step 5: Environment Variables

Click "Add Environment Variable":

**Key**: `NODE_ENV`
**Value**: `production`

(Optional - helps with performance)

### Step 6: Deploy

Click "Create Web Service"

Render will:
1. Clone your repository
2. Install dependencies
3. Start the server
4. Assign a URL

**Wait 2-3 minutes** for deployment to complete.

---

## Testing Your Deployment

### When Deployment Completes

You'll see:
```
Your service is live at: https://flam-assignment.onrender.com
```

### Test Collaborative Drawing

**Device 1**:
```
https://flam-assignment.onrender.com
```

**Device 2** (any device, anywhere):
```
https://flam-assignment.onrender.com
```

Both devices will have real-time drawing synchronization! ✅

---

## Verifying WebSocket Works

### Check 1: Open Both Devices
- Device 1: Draw something
- Device 2: See it appear instantly

### Check 2: Browser Console
- Press F12 (DevTools)
- Console tab
- Should NOT see WebSocket errors
- Should show "Connected" status

### Check 3: Cursor Tracking
- Move mouse in Device 1
- See cursor in Device 2
- Move mouse in Device 2
- See cursor in Device 1

---

## Features That Work

✅ Real-time drawing synchronization
✅ Multiple users drawing simultaneously
✅ Global undo/redo
✅ User presence (cursors, list)
✅ Connection status indicator
✅ Touch support on mobile
✅ Responsive design

---

## Troubleshooting

### "Build Failed"

Check the logs:
1. Go to your service dashboard
2. Click "Logs" tab
3. Look for error messages

Common issues:
- Missing `package.json` - Should be in root directory
- Dependencies not installing - Check `npm install` runs
- Server port - Render sets PORT automatically

### "Not Syncing Between Devices"

**Check 1**: Are you on HTTPS?
- Render gives you HTTPS URL
- Use that URL, not HTTP

**Check 2**: WebSocket error in console?
- F12 → Console
- Look for red errors
- Should show "WebSocket connected"

**Check 3**: Refresh the page
- Sometimes connection takes a moment

### "Slow Performance"

- Free tier has limited resources
- Upgrade to paid plan for better performance
- Or wait a moment for cold start

### "Getting 404 Errors"

**Common cause**: URL is wrong
- Use: `https://flam-assignment.onrender.com`
- Not: `http://` (must be HTTPS)
- Not: With extra `/` at end

---

## Free Tier Limitations

| Feature | Free | Paid |
|---------|------|------|
| Deployment | ✅ | ✅ |
| WebSocket | ✅ | ✅ |
| HTTPS | ✅ | ✅ |
| Concurrent Users | 5-10 | Unlimited |
| Uptime | Auto-sleeps after 15 min inactivity | 99.99% |
| Resources | 0.5 CPU, 512MB RAM | More |

**Note**: Free tier spins down if no requests for 15 minutes. First request after spin-down takes ~30 seconds.

---

## Upgrading to Paid Plan

If you need:
- Better performance
- No auto-sleep
- More concurrent users
- Custom domain

Go to Settings → Plan → Upgrade

**Cheapest paid plan**: $4.50/month (Starter)

---

## Auto-Deployment

After initial setup, **auto-deploy is enabled**:

1. Make code changes locally
2. Push to GitHub
3. Render automatically detects changes
4. Builds and deploys automatically

No manual deployment needed!

---

## Custom Domain (Optional)

To use a custom domain:

1. Go to Service Settings
2. Click "Custom Domain"
3. Add your domain
4. Update DNS settings (Render will show instructions)

---

## Monitoring & Logs

### View Live Logs

1. Go to your service dashboard
2. Click "Logs" tab
3. See real-time server logs

### Deployment History

1. Click "Deploys" tab
2. See all previous deployments
3. Rollback to previous version if needed

---

## Performance Tips

1. **Enable Gzip Compression** - Render does this automatically
2. **Use HTTPS** - Render provides free HTTPS
3. **Optimize Images** - Not needed for drawing app
4. **Monitor Performance** - Use Render's metrics

---

## Next Steps After Deployment

### 1. Test Thoroughly
- [ ] Open on 2 different devices
- [ ] Test drawing sync
- [ ] Test undo/redo
- [ ] Test user cursors
- [ ] Check connection status

### 2. Share the URL
- URL: `https://flam-assignment.onrender.com`
- Share with others for collaborative testing

### 3. Monitor Stability
- Check logs regularly
- Monitor for errors
- Test with multiple users

### 4. Plan for Growth
- If more users needed, upgrade plan
- If you want custom domain, set it up
- Consider premium features

---

## Common Questions

**Q: Do I need to pay?**
A: No, free tier works great for testing and learning.

**Q: Will it sleep?**
A: Yes, free tier goes to sleep after 15 min inactivity. Restart on first request (slow).

**Q: Can I upgrade later?**
A: Yes, anytime. Can upgrade when needed.

**Q: Does it support WebSockets?**
A: Yes! Render fully supports WebSockets, unlike Vercel free tier.

**Q: How many users can connect?**
A: Free tier: 5-10 concurrent. Paid: Unlimited.

**Q: Is it secure?**
A: Yes, Render provides HTTPS by default.

**Q: Can I use custom domain?**
A: Yes, with custom domain setup (optional).

---

## Render vs Other Platforms

| Platform | WebSocket | Free | Ease | Recommendation |
|----------|-----------|------|------|---|
| **Render** | ✅ | ✅ | ⭐⭐⭐⭐ | 🏆 Best overall |
| Heroku | ✅ | ⚠️ Phasing out | ⭐⭐⭐ | Good but phasing out |
| Railway | ✅ | ✅ | ⭐⭐⭐⭐ | Also great |
| Vercel | ❌ | ✅ | ⭐⭐⭐⭐ | Not suitable |

---

## Support

**Render Documentation**: https://render.com/docs
**Community Discord**: https://render.com/chat

---

## Quick Checklist

Before deploying:
- [ ] Code pushed to GitHub
- [ ] package.json in root directory
- [ ] server.js is entry point
- [ ] npm start works locally

During deployment:
- [ ] Authorize Render with GitHub
- [ ] Select correct repository
- [ ] Set NODE_ENV=production
- [ ] Click Create Web Service

After deployment:
- [ ] Wait for green "Live" status
- [ ] Get the URL
- [ ] Test on multiple devices
- [ ] Verify WebSocket works

---

## You're Ready!

Your Collaborative Drawing Canvas is ready to deploy to Render in minutes!

**Next Step**: Go to https://render.com and start the deployment! 🚀

Any questions? Check Render docs or ask! 🎉
