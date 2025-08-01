const { contextBridge, ipcRenderer } = require('electron');

// contextBridge هو جسر آمن يسمح للكود الموجود في الواجهة الرسومية (Renderer Process)
// بالتواصل مع الكود الموجود في العملية الرئيسية (Main Process) دون تعريض وظائف Node.js بالكامل.
contextBridge.exposeInMainWorld('electronAPI', {
    // --- عمليات المصادقة والتحكم في النوافذ ---

    // إرسال إشعار للعملية الرئيسية بأن تسجيل الدخول قد نجح
    // ليتم إغلاق نافذة تسجيل الدخول وفتح النافذة الرئيسية
    loginSuccess: (session) => ipcRenderer.send('login-success', session),

    // إرسال طلب تسجيل الخروج
    logout: () => ipcRenderer.send('logout'),

    // --- مستمعو الأحداث (Event Listeners) ---
    // هذه الدالة تسمح للنافذة الرئيسية بإرسال بيانات المستخدم الحالي (مثل الإيميل)
    // إلى النافذة عند تحميلها
    onSetUser: (callback) => ipcRenderer.on('set-user', (event, user) => callback(user)),
});
