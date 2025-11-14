import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');
const TARGET_ROOT = path.join(ROOT, 'downloadable');
const BUNDLE_NAME = 'lash3z-interactive-stream-hub';
const BUNDLE_DIR = path.join(TARGET_ROOT, BUNDLE_NAME);

const INCLUDE_ITEMS = [
  'README.md',
  'server.js',
  'package.json',
  'package-lock.json',
  'src',
  'api',
  'vercel.json'
];

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function copyRecursive(src, dest) {
  const stats = await fs.stat(src);
  if (stats.isDirectory()) {
    await ensureDir(dest);
    const entries = await fs.readdir(src);
    for (const entry of entries) {
      await copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    await ensureDir(path.dirname(dest));
    await fs.copyFile(src, dest);
  }
}

async function main() {
  await fs.rm(BUNDLE_DIR, { recursive: true, force: true });
  await ensureDir(BUNDLE_DIR);

  for (const item of INCLUDE_ITEMS) {
    const srcPath = path.join(ROOT, item);
    try {
      await fs.access(srcPath);
    } catch (error) {
      console.warn(`[download] skipping missing item: ${item}`);
      continue;
    }

    const destPath = path.join(BUNDLE_DIR, item);
    await copyRecursive(srcPath, destPath);
  }

  const infoReadme = [
    '# LASH3Z Interactive Stream Hub (Download Bundle)',
    '',
    'This folder is auto-generated via `npm run create-download` and contains a copy of the backend code that can be zipped or shared as a standalone download.',
    '',
    'The bundle mirrors the project root (minus `node_modules`) so the server can be installed and launched with:',
    '',
    '```bash',
    'npm install',
    'npm run dev',
    '```',
    '',
    'Regenerate this folder whenever the backend changes to keep the downloadable bundle up to date.'
  ].join('\n') + '\n';

  await ensureDir(TARGET_ROOT);
  await fs.writeFile(path.join(TARGET_ROOT, 'README.md'), infoReadme, 'utf8');

  console.log(`Download bundle created at: ${path.relative(ROOT, BUNDLE_DIR)}`);
}

main().catch((error) => {
  console.error('Failed to create download bundle:', error);
  process.exit(1);
});
