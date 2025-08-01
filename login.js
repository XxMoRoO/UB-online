// login.js

// استيراد عميل Supabase الذي أنشأناه
import { supabase } from './supabase-client.js';

// --- DOM Element Selection ---
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginError = document.getElementById('login-error-message');
const signupError = document.getElementById('signup-error-message');
const loginView = document.getElementById('login-view');
const signupView = document.getElementById('signup-view');
const showSignupBtn = document.getElementById('show-signup');
const showLoginBtn = document.getElementById('show-login');

// --- View Switching Logic ---
function switchToView(viewToShow) {
    [loginView, signupView].forEach(view => view.classList.add('hidden'));
    [loginError, signupError].forEach(error => error && error.classList.add('hidden'));
    viewToShow.classList.remove('hidden');
}

showSignupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    switchToView(signupView);
});

showLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    switchToView(loginView);
});


// --- Form Submission Logic ---

// Handle login form submission with Supabase
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (loginError) loginError.classList.add('hidden');
    const email = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        if (loginError) {
            loginError.textContent = error.message;
            loginError.classList.remove('hidden');
        }
        console.error('Login Error:', error.message);
    } else {
        // Login successful, redirect to the main app
        // We need to pass the session info to the main process to open the main window
        window.electronAPI.loginSuccess(data.session);
    }
});

// Handle sign-up form submission with Supabase
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (signupError) signupError.classList.add('hidden');
    const email = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;

    if (!email || !password) {
        if (signupError) {
            signupError.textContent = 'Email and password are required.';
            signupError.classList.remove('hidden');
        }
        return;
    }

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password
    });

    if (error) {
        if (signupError) {
            signupError.textContent = error.message;
            signupError.classList.remove('hidden');
        }
        console.error('Signup Error:', error.message);
    } else {
        // Show a message to the user to check their email for confirmation
        alert('Account created successfully! Please check your email to verify your account before logging in.');
        signupForm.reset();
        switchToView(loginView);
    }
});

// --- Utility: Password visibility toggle ---
document.querySelectorAll('.password-toggle-icon').forEach(icon => {
    icon.addEventListener('click', function () {
        const passwordInput = this.closest('.password-container').querySelector('input');
        const isPassword = passwordInput.getAttribute('type') === 'password';
        passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
    });
});

// Check if a user is already logged in when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        // If there's a session, inform the main process to open the main window
        window.electronAPI.loginSuccess(session);
    }
});
