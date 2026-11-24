import { access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

// Build the shadcn/ui + Tailwind v4 client assets into public/ui/.
const viteBin = path.resolve('node_modules', '.bin', 'vite');
const viteResult = spawnSync(viteBin, ['build', '--mode', 'production'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'production' },
});
if (viteResult.status !== 0) {
  console.error('Build failed: Vite UI bundle compilation failed.');
  process.exit(viteResult.status || 1);
}

// Guard that every required production file is present before an image is built.
const required = [
  'server.js', 'app.js', 'index.html', 'style.css', 'cms.css', 'eshobe.theme.json',
  'src', 'vendor', 'public', 'public/ui/theme-ui.js', 'public/ui/theme-ui.css',
];

const missing = [];
for (const name of required) {
  try {
    await access(name);
  } catch {
    missing.push(name);
  }
}

if (missing.length) {
  console.error(`Build failed: missing production files: ${missing.join(', ')}`);
  process.exit(1);
}

console.log('Build OK: shadcn/ui assets compiled and production files verified.');
