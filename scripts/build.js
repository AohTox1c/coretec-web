const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const files = [
  'index.html',
  'servicios.html',
  'galeria.html',
  'somos.html',
  'certificaciones.html',
  'contacto.html',
  'gracias.html',
  '_headers',
  '_redirects',
  'robots.txt',
  'sitemap.xml',
];
const directories = ['css', 'js'];

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const file of files) {
  fs.copyFileSync(path.join(root, file), path.join(output, file));
}

for (const directory of directories) {
  fs.cpSync(path.join(root, directory), path.join(output, directory), {
    recursive: true,
  });
}

fs.mkdirSync(path.join(output, 'img', 'corporativo'), { recursive: true });
for (const file of fs.readdirSync(path.join(root, 'img', 'corporativo'))) {
  fs.copyFileSync(
    path.join(root, 'img', 'corporativo', file),
    path.join(output, 'img', 'corporativo', file),
  );
}

for (const file of ['CORETEC LOGO.png', 'CORETEC FAVICON.png']) {
  fs.copyFileSync(path.join(root, 'img', file), path.join(output, 'img', file));
}

const imageDimensions = {
  'img/CORETEC LOGO.png': [434, 324],
  'img/corporativo/identidad.webp': [1536, 1024],
  'img/corporativo/mantenimiento-aerogenerador.webp': [1536, 1024],
  'img/corporativo/operaciones.webp': [1402, 1122],
  'img/corporativo/parque-eolico.webp': [1536, 1024],
  'img/corporativo/reparacion-pala.webp': [1536, 1024],
  'img/corporativo/rope-access-vertical.webp': [676, 1014],
  'img/corporativo/trabajo-en-altura.webp': [1536, 1024],
};

for (const file of files.filter((name) => name.endsWith('.html'))) {
  const target = path.join(output, file);
  const html = fs.readFileSync(target, 'utf8').replace(/<img\b[^>]*>/g, (tag) => {
    const src = tag.match(/\bsrc="([^"]+)"/)?.[1];
    const dimensions = imageDimensions[src];
    if (!dimensions) return tag;

    let optimized = tag;
    if (!/\bwidth=/.test(optimized)) {
      optimized = optimized.replace('<img', `<img width="${dimensions[0]}" height="${dimensions[1]}"`);
    }
    if (!/\bdecoding=/.test(optimized)) {
      optimized = optimized.replace('<img', '<img decoding="async"');
    }
    if (src !== 'img/CORETEC LOGO.png' && !/\bloading=/.test(optimized)) {
      optimized = optimized.replace('<img', '<img loading="lazy"');
    }
    return optimized;
  });
  fs.writeFileSync(target, html);
}

console.log(`Built ${output}`);
