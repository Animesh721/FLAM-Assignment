# Deployment Guide - Collaborative Drawing Canvas

This guide covers deployment options for the Collaborative Drawing Canvas application.

## Deployment Options

### 1. Vercel (Recommended for Frontend + Node.js API)

**Important Note**: Vercel's free tier does not support WebSocket connections. For production use with WebSockets, you'll need:
- Vercel Pro plan, OR
- Use a different hosting service for the WebSocket server

#### Option A: Vercel + External WebSocket Server

**Frontend on Vercel + Backend on Another Service**

1. **Deploy Frontend to Vercel**:
   ```bash
   vercel
   ```

2. **Deploy Backend to a WebSocket-supporting service**:
   - Heroku (see below)
   - Railway.app
   - Render.com
   - AWS Lambda + API Gateway

3. **Update WebSocket URL in `client/main.js`**:
   ```javascript
   // Change from:
   const wsUrl = `${protocol}//${window.location.host}`;
   // To:
   const wsUrl = `wss://your-backend-server.herokuapp.com`;
   ```

#### Option B: Vercel Pro (With WebSocket Support)

Vercel Pro supports WebSocket connections:
1. Upgrade to Vercel Pro
2. Deploy with the included `vercel.json`
3. Everything works out of the box

### 2. Heroku (Best for Full-Stack Deployment)

Heroku supports WebSockets and is perfect for this application.

#### Steps:

1. **Install Heroku CLI**:
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**:
   ```bash
   heroku login
   ```

3. **Create a new Heroku app**:
   ```bash
   heroku create your-app-name
   ```

4. **Add this `Procfile` to your project root**:
   ```
   web: node server/server.js
   ```

5. **Commit and push to Heroku**:
   ```bash
   git add Procfile
   git commit -m "Add Procfile for Heroku"
   git push heroku master
   ```

6. **Access your app**:
   ```
   https://your-app-name.herokuapp.com
   ```

### 3. Railway.app (Modern Alternative)

Railway is a modern deployment platform with WebSocket support.

#### Steps:

1. **Connect your GitHub repository**:
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"

2. **Select your repository**

3. **Railway will auto-detect Node.js**

4. **The app will deploy automatically**

5. **Access at the Railway-provided URL**

### 4. Docker + Cloud Deployment

#### Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

#### Build and Deploy:

```bash
# Build image
docker build -t collaborative-canvas .

# Run locally
docker run -p 3000:3000 collaborative-canvas

# Push to Docker Hub
docker tag collaborative-canvas yourusername/collaborative-canvas
docker push yourusername/collaborative-canvas
```

Then deploy to:
- AWS ECS
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform

### 5. Local Deployment (Development)

For local testing:

```bash
npm install
npm start
```

Server runs on `http://localhost:3000`

---

## Recommended Deployment Paths

### For Learning / Prototyping
→ **Local Development** or **Railway.app** (free tier)

### For Production with WebSockets
→ **Heroku** or **Railway.app**

### For Scale
→ **Docker + AWS/GCP/Azure**

### For Simple Frontend-Only Demo
→ **Vercel** (with backend elsewhere)

---

## Environment Configuration

### For Production

Create a `.env` file (not in git):

```env
NODE_ENV=production
PORT=3000
```

### Vercel Environment Variables

Go to Vercel Project Settings → Environment Variables:

```
NODE_ENV = production
```

### Heroku Environment Variables

```bash
heroku config:set NODE_ENV=production
heroku config:set PORT=3000
```

---

## SSL/HTTPS Configuration

### Vercel
- Automatic HTTPS

### Heroku
- Automatic HTTPS on `.herokuapp.com` domain

### Railway
- Automatic HTTPS

### Custom Domain
- Use Cloudflare for free SSL

---

## Database Persistence (Future Enhancement)

Currently, the application stores drawing state in memory. For persistence:

1. **MongoDB**:
   ```bash
   npm install mongoose
   ```

2. **PostgreSQL**:
   ```bash
   npm install pg
   ```

3. **Update `drawing-state.js`** to persist to database

---

## Troubleshooting Deployment Issues

### Issue: 404 Not Found

**Solution**: Ensure `vercel.json` is properly configured or you're using Heroku/Railway

### Issue: WebSocket Connection Failed

**Problem**: Service doesn't support WebSockets
**Solution**:
- Use Heroku, Railway, or Vercel Pro
- OR split frontend and backend

### Issue: Static Files Not Loading

**Problem**: Client files not being served
**Solution**: Check that `client/` directory is included in deployment

### Issue: Port Already in Use

**Solution**:
```bash
PORT=3001 npm start
```

### Issue: Module Not Found

**Solution**:
```bash
npm install
```

---

## Monitoring & Logs

### Vercel
```bash
vercel logs
```

### Heroku
```bash
heroku logs --tail
```

### Railway
- View in dashboard

---

## Performance Optimization for Production

1. **Enable GZIP compression**:
   - Already enabled in Express by default

2. **Minify client files**:
   ```bash
   npm install -g terser
   terser client/canvas.js -c -m -o client/canvas.min.js
   ```

3. **Use CDN for static files**:
   - Configure Cloudflare
   - Point to your deployed site

4. **Enable caching**:
   - Configure cache headers in server

5. **Rate limiting**:
   - Add npm package: `express-rate-limit`

---

## Security Checklist for Production

- [ ] Use HTTPS/WSS only
- [ ] Add authentication
- [ ] Add rate limiting
- [ ] Validate all inputs
- [ ] Use environment variables for secrets
- [ ] Add CORS configuration
- [ ] Enable security headers
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Monitor for errors

---

## Summary Table

| Platform | WebSocket | Cost | Setup Time | Notes |
|----------|-----------|------|-----------|-------|
| Local | ✅ | Free | 2 min | Development only |
| Vercel | ❌ (free) | Free | 5 min | Frontend only |
| Heroku | ✅ | Free* | 10 min | **Recommended** |
| Railway | ✅ | Free | 5 min | Modern, fast |
| Docker | ✅ | Varies | 20 min | Most control |

*Heroku free tier is being phased out as of Nov 2022

---

## Getting Help

- **Heroku**: https://devcenter.heroku.com/
- **Railway**: https://docs.railway.app/
- **Vercel**: https://vercel.com/docs
- **Docker**: https://docs.docker.com/
- **WebSocket**: https://socket.io/ or native WebSocket API

---

**Current Deployment Status**:
- ✅ Ready for local deployment
- ✅ Ready for Heroku deployment
- ✅ Ready for Railway deployment
- ✅ Ready for Docker deployment
- ⚠️ Partial support on Vercel (frontend only without Pro)
