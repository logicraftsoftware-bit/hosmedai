import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import pages from '../src/pages.generated.js';

const root = resolve(import.meta.dirname, '..');
const pageFile = join(root, 'src', 'pages.generated.js');
const refs = new Set();

for (const page of Object.values(pages)) {
  for (const match of page.html.matchAll(/assets\/images\/[^"')?#]+\.html/gi)) {
    refs.add(match[0]);
  }
}

function allCssFiles(folder) {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = join(folder, entry.name);
    return entry.isDirectory() ? allCssFiles(path) : entry.name.endsWith('.css') ? [path] : [];
  });
}

const cssFiles = allCssFiles(join(root, 'public', 'assets'));
for (const file of cssFiles) {
  const css = readFileSync(file, 'utf8');
  for (const match of css.matchAll(/(?:\.\.\/)+images\/[^"')?#]+\.html/gi)) {
    const relative = match[0].slice(match[0].indexOf('images/'));
    refs.add(`assets/${relative}`);
  }
}

const extensions = ['jpg', 'png', 'webp', 'gif', 'svg'];
const replacements = new Map();
let restored = 0;

async function restore(ref) {
  const base = ref.slice(0, -5);
  for (const extension of extensions) {
    const corrected = `${base}.${extension}`;
    const url = `https://pixydrops.com/heartox/${corrected}`;
    try {
      const response = await fetch(url);
      const type = response.headers.get('content-type') || '';
      if (!response.ok || !type.startsWith('image/')) continue;
      const target = join(root, 'public', decodeURIComponent(corrected));
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, Buffer.from(await response.arrayBuffer()));
      replacements.set(ref, corrected);
      restored += 1;
      return;
    } catch {
      // Try the next likely image extension.
    }
  }
  console.warn(`Not found: ${ref}`);
}

const queue = [...refs];
const workers = Array.from({ length: 12 }, async () => {
  while (queue.length) await restore(queue.shift());
});
await Promise.all(workers);

let generated = readFileSync(pageFile, 'utf8');
for (const [oldRef, newRef] of replacements) generated = generated.split(oldRef).join(newRef);
writeFileSync(pageFile, generated);

for (const file of cssFiles) {
  let css = readFileSync(file, 'utf8');
  for (const [oldRef, newRef] of replacements) {
    const oldRelative = oldRef.slice('assets/'.length);
    const newRelative = newRef.slice('assets/'.length);
    css = css.split(oldRelative).join(newRelative);
    css = css.split(oldRef).join(newRef);
    const filename = oldRelative.slice('images/'.length);
    const correctedFilename = newRelative.slice('images/'.length);
    css = css.split(filename).join(correctedFilename);
  }
  writeFileSync(file, css);
}

console.log(`Restored ${restored} of ${refs.size} missing image assets.`);
