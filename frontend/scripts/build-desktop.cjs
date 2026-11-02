const packager = require('electron-packager');
const path = require('path');
const fs = require('fs');

async function buildDesktop() {
  console.log('[Desktop Build] Starting packaging for Windows x64...');

  const options = {
    dir: path.resolve(__dirname, '..'),
    name: 'SLSV Lodge',
    platform: 'win32',
    arch: 'x64',
    icon: path.resolve(__dirname, '..', 'public', 'icon.ico'),
    out: path.resolve(__dirname, '..', 'release'),
    overwrite: true,
    prune: true,
    asar: true,
    ignore: [
      /^\/android($|\/)/,
      /^\/ios($|\/)/,
      /^\/release($|\/)/,
      /^\/src($|\/)/,
      /^\/\.git($|\/)/,
      /^\/scripts($|\/)/,
    ],
    appCopyright: 'Copyright (C) 2026 Sri Lakshmi Srungara Vallabha Service Rooms & Lodge',
    appVersion: '1.0.0',
    buildVersion: '1.0.0',
    win32metadata: {
      CompanyName: 'SLSV Lodge',
      FileDescription: 'SLSV Lodge Management Desktop Application',
      OriginalFilename: 'SLSV Lodge.exe',
      ProductName: 'SLSV Lodge Management',
      InternalName: 'SLSV Lodge',
    },
  };

  try {
    const appPaths = await packager(options);
    console.log('[Desktop Build] Packaging completed successfully!');
    console.log('[Desktop Build] Output directory:', appPaths);

    // Copy the executable to a top-level friendly directory or root if needed
    const outputDir = appPaths[0];
    console.log(`[Desktop Build] Standalone application ready at:\n${outputDir}\\SLSV Lodge.exe`);
  } catch (err) {
    console.error('[Desktop Build] Packaging failed:', err);
    process.exit(1);
  }
}

buildDesktop();
