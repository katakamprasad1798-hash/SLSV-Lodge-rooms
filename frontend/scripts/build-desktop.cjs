const packager = require('electron-packager');
const path = require('path');
const fs = require('fs');

async function buildDesktop() {
  console.log('[Desktop Build] Preparing clean staging directory...');

  const frontendDir = path.resolve(__dirname, '..');
  const stageDir = path.resolve(frontendDir, '.desktop-stage');

  if (fs.existsSync(stageDir)) {
    fs.rmSync(stageDir, { recursive: true, force: true });
  }
  fs.mkdirSync(stageDir, { recursive: true });

  // 1. Copy dist
  const distSrc = path.join(frontendDir, 'dist');
  const distDest = path.join(stageDir, 'dist');
  fs.cpSync(distSrc, distDest, { recursive: true });

  // 2. Copy electron
  const electronSrc = path.join(frontendDir, 'electron');
  const electronDest = path.join(stageDir, 'electron');
  fs.cpSync(electronSrc, electronDest, { recursive: true });

  // 3. Copy public
  const publicSrc = path.join(frontendDir, 'public');
  const publicDest = path.join(stageDir, 'public');
  fs.cpSync(publicSrc, publicDest, { recursive: true });

  // 4. Create lightweight package.json without devDependencies
  const pkg = {
    name: 'slsv-lodge',
    version: '1.0.0',
    description: 'Sri Lakshmi Srungara Vallabha Service Rooms & Lodge Management',
    main: 'electron/main.cjs',
  };
  fs.writeFileSync(path.join(stageDir, 'package.json'), JSON.stringify(pkg, null, 2));

  console.log('[Desktop Build] Staging complete. Running Electron Packager...');

  const outDir = path.resolve(frontendDir, 'release');

  const options = {
    dir: stageDir,
    name: 'SLSV Lodge',
    platform: 'win32',
    arch: 'x64',
    icon: path.resolve(frontendDir, 'public', 'icon.ico'),
    out: outDir,
    overwrite: true,
    asar: true,
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

    // Clean up stageDir
    try {
      fs.rmSync(stageDir, { recursive: true, force: true });
    } catch (e) {}

    const exePath = path.join(appPaths[0], 'SLSV Lodge.exe');
    console.log(`[Desktop Build] Standalone application ready at:\n${exePath}`);
  } catch (err) {
    console.error('[Desktop Build] Packaging failed:', err);
    process.exit(1);
  }
}

buildDesktop();
