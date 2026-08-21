import { writeFile } from 'node:fs/promises';
import pages from '../src/pages.generated.js';

const runtimePages = Object.fromEntries(
  ['index.html', 'about.html', '404.html'].map(name => [name, pages[name]])
);

await writeFile(
  new URL('../src/pages.runtime.generated.js', import.meta.url),
  `// Generated subset used by the live HosmedAI routes.\nexport default ${JSON.stringify(runtimePages)};\n`
);
