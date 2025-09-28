#!/usr/bin/env node
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// function git(cmd) {
//   try {
//     return execSync(`git ${cmd}`, { encoding: 'utf8' }).trim();
//   } catch (e) {
//     return '';
//   }
// }

// Determine changed files relative to an upstream branch if available
function getChangedFiles() {
  // try to find upstream (e.g., origin/main)
  let upstream = '';
  try {
    upstream = execSync('git rev-parse --abbrev-ref --symbolic-full-name @{u}', {
      encoding: 'utf8',
    }).trim();
  } catch (e) {
    // ignore
  }

  let diffBase = '';
  if (upstream) diffBase = upstream;
  else if (fs.existsSync('.git/refs/remotes/origin/main')) diffBase = 'origin/main';
  else if (fs.existsSync('.git/refs/heads/main')) diffBase = 'main';
  else diffBase = '';

  let files = [];
  if (diffBase) {
    try {
      files = execSync(`git diff --name-only ${diffBase}...HEAD`, { encoding: 'utf8' })
        .split('\n')
        .map(Boolean);
    } catch (e) {
      files = [];
    }
  }

  // fallback to staged files
  if (!files || files.length === 0) {
    try {
      files = execSync('git diff --name-only --cached', { encoding: 'utf8' })
        .split('\n')
        .map(Boolean);
    } catch (e) {
      files = [];
    }
  }

  return files.filter(Boolean);
}

function findPackages() {
  const pkgsDir = path.join(process.cwd(), 'packages');
  if (!fs.existsSync(pkgsDir)) return [];
  const names = fs
    .readdirSync(pkgsDir)
    .filter((f) => fs.statSync(path.join(pkgsDir, f)).isDirectory());
  return names.map((n) => ({
    dir: path.join('packages', n),
    name: readPkgName(path.join(pkgsDir, n)),
  }));
}

function readPkgName(absPath) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(absPath, 'package.json'), 'utf8'));
    return pkg.name || null;
  } catch (e) {
    return null;
  }
}

function runSmokeForPackage(pkg) {
  if (!pkg.name) return true;
  console.log(`\n=== Running smoke (test:ci) for ${pkg.name} (${pkg.dir}) ===`);
  const res = spawnSync('npm', ['--workspace', pkg.name, 'run', 'test:ci'], { stdio: 'inherit' });
  return res.status === 0;
}

function main() {
  const changed = getChangedFiles();
  if (!changed || changed.length === 0) {
    console.log('No changed files detected (against upstream or staged). Skipping smoke tests.');
    process.exit(0);
  }

  const packages = findPackages();
  const changedPackages = packages.filter((p) =>
    changed.some((f) =>
      typeof f === 'string'
        ? f.startsWith(p.dir + path.sep) || f === p.dir || f.startsWith(p.dir + '/')
        : false
    )
  );

  if (changedPackages.length === 0) {
    console.log('No workspace packages affected by changes. Skipping smoke tests.');
    process.exit(0);
  }

  const results = [];
  for (const pkg of changedPackages) {
    const passed = runSmokeForPackage(pkg);
    results.push({ name: pkg.name, dir: pkg.dir, passed });
  }

  // Print summary
  console.log('\n=== Smoke test summary ===');
  for (const r of results) {
    console.log(`${r.passed ? '✅' : '❌'} ${r.name} (${r.dir})`);
  }

  const failed = results.filter((r) => !r.passed);
  if (failed.length > 0) {
    console.log('\nSome smoke tests failed.');
    process.exit(1);
  }

  console.log('\nAll smoke tests passed for changed packages.');
}

main();
