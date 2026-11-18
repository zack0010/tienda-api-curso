// Crea en GitHub los issues de scripts/issues/.
// Hace falta porque los repositorios creados desde una plantilla no copian los issues.
// Se puede ejecutar varias veces: no duplica los issues que ya existen.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ISSUES_DIR = join(dirname(fileURLToPath(import.meta.url)), 'issues');
const LABELS = {
  bug: { color: 'd73a4a', description: 'Algo no funciona' },
  mejora: { color: 'a2eeef', description: 'Nueva funcionalidad o mejora' },
};

function gh(args, input) {
  return execFileSync('gh', args, { encoding: 'utf8', input, stdio: 'pipe' }).trim();
}

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

function parseIssue(file) {
  const text = readFileSync(join(ISSUES_DIR, file), 'utf8').replace(/\r\n/g, '\n');
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) fail(`Formato incorrecto en ${file}`);
  const meta = Object.fromEntries(
    match[1].split('\n').map((line) => {
      const i = line.indexOf(':');
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
    }),
  );
  return {
    title: meta.titulo,
    labels: (meta.etiquetas ?? '')
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean),
    body: match[2].trim(),
  };
}

try {
  gh(['--version']);
} catch {
  fail('No se encuentra la CLI de GitHub (gh). Instálala desde https://cli.github.com');
}
try {
  gh(['auth', 'status']);
} catch {
  fail('gh no tiene la sesión iniciada. Ejecuta: gh auth login');
}
let repo;
try {
  repo = gh(['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner']);
} catch {
  fail('Este repositorio no está conectado con GitHub. Comprueba el remoto con: git remote -v');
}

console.log(`Repositorio: ${repo}`);

for (const [name, { color, description }] of Object.entries(LABELS)) {
  gh(['label', 'create', name, '--color', color, '--description', description, '--force']);
}

const existing = new Set(
  JSON.parse(gh(['issue', 'list', '--state', 'all', '--limit', '200', '--json', 'title'])).map(
    (issue) => issue.title,
  ),
);

const files = readdirSync(ISSUES_DIR)
  .filter((file) => file.endsWith('.md'))
  .sort();

for (const issue of files.map(parseIssue)) {
  if (existing.has(issue.title)) {
    console.log(`- Ya existía: ${issue.title}`);
    continue;
  }
  const labelArgs = issue.labels.flatMap((label) => ['--label', label]);
  const url = gh(
    ['issue', 'create', '--title', issue.title, '--body-file', '-', ...labelArgs],
    issue.body,
  );
  console.log(`✔ ${url}  ${issue.title}`);
}
