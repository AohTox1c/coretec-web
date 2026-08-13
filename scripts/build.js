const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const versionFile = 'site-version.json';
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
  'favicon.ico',
  'favicon-48.png',
  'apple-touch-icon.png',
];
const directories = ['css', 'js', 'functions'];

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

fs.cpSync(
  path.join(root, 'img', 'corporativo'),
  path.join(output, 'img', 'corporativo'),
  { recursive: true },
);

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
  'img/corporativo/real/coretec-foto-01-trabajo-altura-aereo-01.webp': [1280, 720],
  'img/corporativo/real/coretec-foto-02-trabajo-altura-aereo-02.webp': [1280, 720],
  'img/corporativo/real/coretec-foto-03-trabajo-vertical-panoramica.webp': [1280, 960],
  'img/corporativo/real/coretec-foto-04-detalle-pala-cuerdas.webp': [960, 1280],
  'img/corporativo/real/coretec-foto-05-tecnico-rigging.webp': [960, 1280],
  'img/corporativo/real/coretec-foto-06-reparacion-pala-tecnico.webp': [960, 1280],
  'img/corporativo/real/coretec-foto-07-reparacion-interior-pala.webp': [1600, 1206],
  'img/corporativo/real/coretec-foto-08-tecnico-sobre-pala-aerea.webp': [1664, 928],
  'img/corporativo/real/coretec-foto-08-tecnico-sobre-pala-aerea-hd-preservado.webp': [1920, 1072],
};

function getSiteVersion() {
  const configuredVersion = JSON.parse(
    fs.readFileSync(path.join(root, versionFile), 'utf8'),
  );
  const baseLabel = `V${configuredVersion.major}.${configuredVersion.minor}`;
  const fallback = {
    label: baseLabel,
    commit: 'unknown',
    warning: `Git history unavailable; using the ${baseLabel} fallback.`,
  };

  try {
    const versionBaseCommit = execFileSync(
      'git',
      ['log', '-1', '--format=%H', '--', versionFile],
      {
        cwd: root,
        encoding: 'utf8',
      },
    ).trim();
    const commit = execFileSync('git', ['rev-parse', '--short=7', 'HEAD'], {
      cwd: root,
      encoding: 'utf8',
    }).trim();

    // Before the version file's first commit, local builds still show its configured base.
    if (!versionBaseCommit) {
      return {
        ...fallback,
        commit,
        warning: null,
      };
    }

    const commitsAfterBase = Number.parseInt(
      execFileSync('git', ['rev-list', '--count', `${versionBaseCommit}..HEAD`], {
        cwd: root,
        encoding: 'utf8',
      }).trim(),
      10,
    );

    if (!Number.isInteger(commitsAfterBase) || commitsAfterBase < 0 || !commit) {
      return fallback;
    }

    return {
      label: `V${configuredVersion.major}.${configuredVersion.minor + commitsAfterBase}`,
      commit,
      warning: null,
    };
  } catch (error) {
    return fallback;
  }
}

const siteVersion = getSiteVersion();

for (const file of files.filter((name) => name.endsWith('.html'))) {
  const target = path.join(output, file);
  let html = fs.readFileSync(target, 'utf8').replace(/<img\b[^>]*>/g, (tag) => {
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

  html = html
    .replace(
      /href="css\/style\.css(?:\?v=[^"]*)?"/g,
      `href="css/style.css?v=${siteVersion.commit}"`,
    )
    .replace(
      /src="js\/main\.js(?:\?v=[^"]*)?"/g,
      `src="js/main.js?v=${siteVersion.commit}"`,
    );

  if (file === 'index.html') {
    html = html.replace(
      /<span class="site-version"[^>]*>[^<]*<\/span>/,
      `<span class="site-version" data-site-version="${siteVersion.label}" data-commit="${siteVersion.commit}" title="Commit ${siteVersion.commit}">${siteVersion.label}</span>`,
    );
  }

  fs.writeFileSync(target, html);
}

if (siteVersion.warning) {
  console.warn(`Warning: ${siteVersion.warning}`);
}
console.log(`Built ${output} (${siteVersion.label}, commit ${siteVersion.commit})`);
