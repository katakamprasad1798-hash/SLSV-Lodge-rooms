const { app, BrowserWindow, Menu, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow = null;
let backendProcess = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const BACKEND_PORT = 8000;

// Helper to check if backend is already running
function checkBackendRunning() {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${BACKEND_PORT}/api`, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 404);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1200, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Helper to start the Python FastAPI backend in the background if not running
async function ensureBackendRunning() {
  const isRunning = await checkBackendRunning();
  if (isRunning) {
    console.log('[DesktopApp] Backend is already running on port ' + BACKEND_PORT);
    return;
  }

  const backendDir = path.resolve(__dirname, '..', '..', 'backend');
  const pythonExe = process.platform === 'win32'
    ? path.join(backendDir, 'venv', 'Scripts', 'python.exe')
    : path.join(backendDir, 'venv', 'bin', 'python');

  const fs = require('fs');
  if (fs.existsSync(pythonExe)) {
    try {
      console.log('[DesktopApp] Starting FastAPI backend via ' + pythonExe);
      backendProcess = spawn(
        pythonExe,
        ['-m', 'uvicorn', 'main:app', '--host', '0.0.0.0', '--port', BACKEND_PORT.toString()],
        {
          cwd: backendDir,
          stdio: 'ignore',
          detached: true,
          windowsHide: true,
        }
      );
      backendProcess.unref();
    } catch (err) {
      console.warn('[DesktopApp] Failed to auto-spawn backend:', err.message);
    }
  } else {
    console.log('[DesktopApp] Python virtualenv not found at ' + pythonExe + '. Operating in Standalone Offline DB Mode.');
  }
}

function createMainWindow() {
  const iconPath = path.join(__dirname, '..', 'public', 'icon.ico');

  mainWindow = new BrowserWindow({
    width: 1320,
    height: 840,
    minWidth: 980,
    minHeight: 640,
    title: 'Sri Lakshmi Srungara Vallabha Service Rooms & Lodge',
    icon: iconPath,
    backgroundColor: '#0f172a',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  // Smooth appearance once ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      // Optional devtools in dev
      // mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  });

  // Construct application menu
  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Print Bill / Invoice',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            if (mainWindow) mainWindow.webContents.print();
          },
        },
        {
          label: 'Reload Page',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) mainWindow.webContents.reload();
          },
        },
        { type: 'separator' },
        {
          label: 'Exit SLSV Lodge',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Full Screen',
          accelerator: 'F11',
          click: () => {
            if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen());
          },
        },
        {
          label: 'Actual Size',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            if (mainWindow) mainWindow.webContents.setZoomLevel(0);
          },
        },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            if (mainWindow) mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() + 0.5);
          },
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            if (mainWindow) mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() - 0.5);
          },
        },
        { type: 'separator' },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => {
            if (mainWindow) mainWindow.webContents.toggleDevTools();
          },
        },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About SLSV Lodge',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Sri Lakshmi Srungara Vallabha Service Rooms',
              message: 'SLSV Lodge Management Desktop Application',
              detail: 'Version 1.0.0 (Native Windows Desktop Edition)\n\n• Real-Time Room Status & Management\n• Instant Check-In & Guest Register\n• Automated GST Invoice & Bill Generation\n• Dual-Engine: Online Cloud + Offline Standalone DB\n\nDivili, Main Road Near Sai Baba Temple, Peddapuram',
              buttons: ['OK'],
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Load URL or build file
  const devUrl = process.env.VITE_DEV_SERVER_URL || (isDev ? 'http://localhost:5173' : null);

  if (devUrl) {
    mainWindow.loadURL(devUrl).catch(() => {
      // Fallback to dist if dev server not running
      const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
      mainWindow.loadFile(indexPath);
    });
  } else {
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
    mainWindow.loadFile(indexPath);
  }

  // Intercept window.open or target="_blank"
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers
ipcMain.handle('print', async (event, options = {}) => {
  if (!mainWindow) return false;
  return new Promise((resolve) => {
    mainWindow.webContents.print(
      {
        silent: options.silent || false,
        printBackground: true,
        deviceName: options.deviceName || '',
        ...options,
      },
      (success, failureReason) => {
        resolve({ success, failureReason });
      }
    );
  });
});

ipcMain.handle('print-to-pdf', async (event, options = {}) => {
  if (!mainWindow) return null;
  try {
    const data = await mainWindow.webContents.printToPDF({
      printBackground: true,
      margins: { marginType: 'printableArea' },
      ...options,
    });
    return data;
  } catch (err) {
    console.error('PDF Generation failed:', err);
    return null;
  }
});

ipcMain.handle('open-external', async (event, url) => {
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    shell.openExternal(url);
  }
});

// App Lifecycle
app.whenReady().then(async () => {
  await ensureBackendRunning();
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (backendProcess) {
    try {
      backendProcess.kill();
    } catch (e) {}
  }
});
