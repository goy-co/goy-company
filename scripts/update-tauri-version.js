const fs = require('fs');
const path = require('path');

// 1. Read package.json version from the Tauri frontend app
const pkgPath = path.join(__dirname, '../apps/fe-hub/package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const version = pkg.version;

console.log(`Updating Tauri Cargo.toml version to ${version}...`);

// 2. Read and update Cargo.toml
const cargoPath = path.join(__dirname, '../apps/fe-hub/src-tauri/Cargo.toml');
let cargoContent = fs.readFileSync(cargoPath, 'utf8');

// Replace the version line under [package]
cargoContent = cargoContent.replace(
  /(\[package\][^]*?version\s*=\s*")[^"]*(")/,
  `$1${version}$2`
);

fs.writeFileSync(cargoPath, cargoContent, 'utf8');
console.log('Cargo.toml version updated successfully.');
