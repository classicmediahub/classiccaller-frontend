# Classic Caller Frontend — Netlify Deployment

## Quick Deploy Steps

1. Push this folder to a GitHub repo
2. Go to netlify.com → New Site → Import from GitHub
3. Settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variable:
   - `VITE_API_BASE_URL` = your Render backend URL
5. Deploy!

The `netlify.toml` file in this folder handles all routing automatically.
See `DEPLOY.md` in the backend folder for the full step-by-step guide.
