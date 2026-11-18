// Comprueba las herramientas que se usan en el curso y crea el .env.
import { execSync } from 'node:child_process';
import { copyFileSync, existsSync } from 'node:fs';

let problems = 0;
let ghReady = false;
const ok = (message) => console.log(`✔ ${message}`);
const warn = (message) => console.log(`⚠ ${message}`);
const problem = (message) => {
  problems++;
  console.log(`✖ ${message}`);
};

/** Ejecuta un comando fijo y devuelve su salida, o null si falla o no existe. */
function run(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch {
    return null;
  }
}

const [major, minor] = process.versions.node.split('.').map(Number);
if (major > 22 || (major === 22 && minor >= 18)) {
  ok(`Node ${process.versions.node}`);
} else {
  problem(`Node ${process.versions.node}: hace falta la 22.18 o superior (recomendada la 24)`);
}

if (existsSync('node_modules')) {
  ok('Dependencias instaladas');
} else {
  problem('Faltan las dependencias: ejecuta npm install');
}

if (existsSync('.env')) {
  ok('.env ya existe');
} else {
  copyFileSync('.env.example', '.env');
  ok('.env creado a partir de .env.example');
}

const git = run('git --version');
if (git) ok(git);
else problem('No se encuentra git');

const claude = run('claude --version');
if (claude) ok(claude);
else problem('No se encuentra Claude Code (claude)');

if (!run('gh --version')) {
  warn('No se encuentra la CLI de GitHub (gh). Instálala desde https://cli.github.com');
} else if (run('gh auth status') === null) {
  warn('gh no tiene la sesión iniciada. Ejecuta: gh auth login');
} else {
  ghReady = true;
  ok('gh con la sesión iniciada');
}

if (problems > 0) {
  console.log(`\nHay ${problems} problema(s) que resolver antes de empezar.`);
  process.exitCode = 1;
} else if (ghReady) {
  console.log('\nTodo listo. Siguiente paso: npm run issues (crea los issues del curso).');
} else {
  console.log('\nTodo listo. Cuando tengas gh preparado, ejecuta npm run issues.');
}
