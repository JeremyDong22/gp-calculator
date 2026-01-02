# GP Calculator - 咨询部项目管理系统

## Deployment

After pushing to GitHub, manually deploy to Cloudflare Pages:

```bash
npm run build && wrangler pages deploy dist --project-name=gp-calculator --commit-dirty=true
```

GitHub auto-deploy is not configured. Always use wrangler to deploy after git push.

## Version

Update `APP_VERSION` in `src/App.tsx` when making releases. Format: `vX.X-YYYYMMDD`

## Tech Stack

- React + TypeScript + Vite
- Cloudflare Pages hosting
- LocalStorage for data persistence
