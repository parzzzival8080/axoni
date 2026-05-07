// Skip react-snap in environments without Chromium system libs (Vercel, CI).
// Set SKIP_PRERENDER=1 locally too if you want to opt out.
import { spawnSync } from 'child_process';

if (process.env.VERCEL || process.env.CI || process.env.SKIP_PRERENDER) {
  console.log('[postbuild] Skipping react-snap (VERCEL/CI/SKIP_PRERENDER detected)');
  process.exit(0);
}

const result = spawnSync('npx', ['react-snap'], { stdio: 'inherit', shell: true });
process.exit(result.status ?? 0);
