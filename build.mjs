import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const template = read('src/index.html');
let css = read('styles.css');
const i18n = read('i18n.js');
const app = read('app.js');

for (const assetName of ['thinker', 'mascot-faq', 'mascot-guide', 'mascot-calc', 'mascot-formula', 'mascot-scene']) {
  const asset = fs.readFileSync(path.join(root, 'assets', assetName + '.webp')).toString('base64');
  css = css.split('url("assets/' + assetName + '.webp")').join('url("data:image/webp;base64,' + asset + '")');
}

for (const [name, source] of [['i18n.js', i18n], ['app.js', app]]) {
  if (/<\/script>/i.test(source)) throw new Error(name + ' contains a closing script tag');
}

let out = template;
out = out.replace('<link rel="stylesheet" href="../styles.css" />', () => '<style>\n' + css + '\n</style>');
out = out.replace('<script src="../i18n.js"></script>', () => '<script>\n' + i18n + '\n</script>');
out = out.replace('<script src="../app.js"></script>', () => '<script>\n' + app + '\n</script>');
out = out.replace('<!DOCTYPE html>', '<!DOCTYPE html>\n<!-- Standalone build. Source: src/index.html + styles.css + i18n.js + app.js. Rebuild with: node build.mjs -->');
fs.writeFileSync(path.join(root, 'index.html'), out);
console.log('Built index.html:', (out.length / 1024).toFixed(1) + ' KB');
