import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, match => match.slice(1))), '..');
const sourceRoot = path.join(root, 'src');
const fontAwesomePath = path.join(root, 'public/assets/vendors/fontawesome/css/all.min.css');
const outputPath = path.join(root, 'public/assets/css/fontawesome-subset.css');

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(target) : /\.(?:js|jsx|css)$/.test(entry.name) ? [target] : [];
  });
}

const source = sourceFiles(sourceRoot).map(file => fs.readFileSync(file, 'utf8')).join('\n');
const iconNames = new Set([...source.matchAll(/\bfa-([a-z0-9-]+)/g)].map(match => `fa-${match[1]}`));
const fullCss = fs.readFileSync(fontAwesomePath, 'utf8');
const iconRules = [...iconNames].sort().map(name => {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return fullCss.match(new RegExp(`\\.${escaped}:before\\{content:"[^"]+"\\}`))?.[0] || '';
}).filter(Boolean).join('');

const baseCss = `@font-face{font-family:"Font Awesome 5 Brands";font-style:normal;font-weight:400;font-display:swap;src:url("/assets/vendors/fontawesome/webfonts/fa-brands-400.woff2") format("woff2")}@font-face{font-family:"Font Awesome 5 Free";font-style:normal;font-weight:400;font-display:swap;src:url("/assets/vendors/fontawesome/webfonts/fa-regular-400.woff2") format("woff2")}@font-face{font-family:"Font Awesome 5 Free";font-style:normal;font-weight:900;font-display:swap;src:url("/assets/vendors/fontawesome/webfonts/fa-solid-900.woff2") format("woff2")}.fa,.fab,.far,.fas{display:inline-block;font-style:normal;font-variant:normal;text-rendering:auto;line-height:1;-webkit-font-smoothing:antialiased}.fab{font-family:"Font Awesome 5 Brands";font-weight:400}.fa,.far,.fas{font-family:"Font Awesome 5 Free"}.far{font-weight:400}.fa,.fas{font-weight:900}.fa-spin{animation:fa-spin 2s linear infinite}@keyframes fa-spin{to{transform:rotate(1turn)}}`;
fs.writeFileSync(outputPath, `${baseCss}${iconRules}\n`);
console.log(`Generated Font Awesome subset with ${iconRules ? iconRules.split('content:').length - 1 : 0} icons.`);
