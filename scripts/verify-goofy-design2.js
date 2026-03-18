#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

const failures = [];
const passes = [];

function check(condition, okText, failText) {
  if (condition) {
    passes.push(okText);
  } else {
    failures.push(failText);
  }
}

const visualDocPath = 'Screenshots_for_visual_verification_goofydesign2/VISUAL-REFERENCE.md';
check(exists(visualDocPath), 'VISUAL-REFERENCE finns.', 'Saknar VISUAL-REFERENCE.md.');

if (exists(visualDocPath)) {
  const visualDoc = read(visualDocPath);
  const expectedRefs = [
    '01-home.png',
    '02-home-teen-hover.png',
    '03-pin-empty.png',
    '04-pin-partial.png',
    '05-pin-error.png',
    '06-parental-dashboard.png',
    '07-parental-toggle.png',
    '08-profile-teen.png',
    '09-profile-kid.png',
    '10-home-1080x1920.png',
    '00-verification-grid.png',
  ];

  expectedRefs.forEach((name) => {
    const rel = `Screenshots_for_visual_verification_goofydesign2/${name}`;
    check(exists(rel), `${name} finns i referensmappen.`, `Saknar referensbild: ${name}`);
  });

  check(
    visualDoc.includes('Skärm 1 — Profilväljare') &&
      visualDoc.includes('Skärm 2 — PIN-pad') &&
      visualDoc.includes('Skärm 3 — Profil aktiv') &&
      visualDoc.includes('Skärm 4 — Föräldrakontroll'),
    'VISUAL-REFERENCE beskriver alla 4 skärmar.',
    'VISUAL-REFERENCE saknar någon kritisk skärmbeskrivning.'
  );
}

const indexHtmlPath = 'Goofy_design2/bundle/index.html';
check(exists(indexHtmlPath), 'index.html finns.', 'Saknar Goofy_design2/bundle/index.html.');

if (exists(indexHtmlPath)) {
  const html = read(indexHtmlPath);
  ['screen-home', 'screen-pin', 'screen-profile', 'screen-parental'].forEach((id) => {
    check(html.includes(`id="${id}"`), `${id} finns i index.html.`, `Saknar ${id} i index.html.`);
  });

  ['Välj TEEN-profil', 'Välj KID-profil', 'Föräldraåtkomst'].forEach((label) => {
    check(html.includes(label), `Knappetikett "${label}" finns.`, `Saknar knappetikett "${label}".`);
  });
}

const appJsPath = 'Goofy_design2/bundle/js/app.js';
check(exists(appJsPath), 'app.js finns.', 'Saknar Goofy_design2/bundle/js/app.js.');
if (exists(appJsPath)) {
  const js = read(appJsPath);
  ['const CORRECT_PIN = \'1234\'', 'function showPin()', 'function selectProfile(type)'].forEach((needle) => {
    check(js.includes(needle), `Hittade "${needle}" i app.js.`, `Saknar "${needle}" i app.js.`);
  });
}

const netlifyTomlPath = 'netlify.toml';
check(exists(netlifyTomlPath), 'netlify.toml finns.', 'Saknar netlify.toml.');
if (exists(netlifyTomlPath)) {
  const netlify = read(netlifyTomlPath);
  check(
    netlify.includes('publish = "Goofy_design2/bundle"'),
    'netlify.toml publish pekar till Goofy_design2/bundle.',
    'netlify.toml publish pekar inte till Goofy_design2/bundle.'
  );
}

const deployScriptPath = 'scripts/netlify-deploy.sh';
check(exists(deployScriptPath), 'Deploy-script finns.', 'Saknar scripts/netlify-deploy.sh.');
if (exists(deployScriptPath)) {
  const script = read(deployScriptPath);
  check(
    script.includes('PUBLISH_DIR="$ROOT_DIR/Goofy_design2/bundle"'),
    'Deploy-script publicerar Goofy_design2/bundle.',
    'Deploy-script publicerar inte Goofy_design2/bundle.'
  );
}

console.log('--- Verifieringsresultat: Goofy design + deploy ---');
passes.forEach((line) => console.log(`✅ ${line}`));

if (failures.length > 0) {
  failures.forEach((line) => console.error(`❌ ${line}`));
  process.exit(1);
}

console.log('Totalt OK:', passes.length, 'kontroller.');
