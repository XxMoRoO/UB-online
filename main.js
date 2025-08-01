const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');

let mainWindow;
let loginWindow;

// --- إدارة نوافذ التطبيق ---

// إنشاء نافذة تسجيل الدخول عند بدء التشغيل
function createLoginWindow() {
    loginWindow = new BrowserWindow({
        width: 450,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            // من المهم تفعيل contextIsolation و تعطيل nodeIntegration للأمان
            contextIsolation: true,
            nodeIntegration: false,
        },
        resizable: false,
        autoHideMenuBar: true,
    });
    loginWindow.loadFile('login.html');
    loginWindow.on('closed', () => {
        loginWindow = null;
    });
}

// إنشاء النافذة الرئيسية بعد تسجيل الدخول بنجاح
function createMainWindow(user) {
    if (mainWindow) {
        mainWindow.focus();
        return;
    }

    mainWindow = new BrowserWindow({
        fullscreen: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            webSecurity: false // ضروري أحيانًا لعرض الصور المحلية
        }
    });

    // إنشاء قائمة بسيطة للتطبيق
    const menuTemplate = [
        {
            label: 'File',
            submenu: [
                { role: 'toggleDevTools' }, // أدوات المطور مفيدة جداً
                { role: 'reload' },
                { role: 'togglefullscreen' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        }
    ];
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    mainWindow.loadFile('index.html');

    // إرسال بيانات المستخدم الحالي إلى النافذة الرئيسية عند تحميلها
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('set-user', user);
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// --- معالجات الأحداث (IPC Handlers) ---

// الاستماع لحدث نجاح تسجيل الدخول من نافذة تسجيل الدخول
ipcMain.on('login-success', (event, session) => {
    // استخراج بيانات المستخدم من الجلسة
    const user = {
        email: session.user.email,
        id: session.user.id,
        // يمكن إضافة أي بيانات أخرى هنا
    };

    createMainWindow(user);

    // إغلاق نافذة تسجيل الدخول
    if (loginWindow) {
        loginWindow.close();
    }
});

// الاستماع لحدث تسجيل الخروج من النافذة الرئيسية
ipcMain.on('logout', () => {
    if (mainWindow) {
        mainWindow.close();
    }
    createLoginWindow();
});


// --- دورة حياة التطبيق ---

app.whenReady().then(createLoginWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        if (mainWindow) {
            mainWindow.focus();
        } else {
            createLoginWindow();
        }
    }
});
