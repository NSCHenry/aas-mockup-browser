/**
 * AAS Dashboard Mockup Browser - Authentication Module
 * Simple client-side password protection with LocalStorage persistence
 */

// Configuration
const AUTH_CONFIG = {
    // Change this password to update access credentials
    PASSWORD: 'aas2024',
    SESSION_KEY: 'aas_mockup_session',
    SESSION_DURATION: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
};

/**
 * Check if user has a valid session
 */
function isAuthenticated() {
    const session = localStorage.getItem(AUTH_CONFIG.SESSION_KEY);

    if (!session) {
        return false;
    }

    try {
        const sessionData = JSON.parse(session);
        const now = Date.now();

        // Check if session has expired
        if (now > sessionData.expires) {
            logout();
            return false;
        }

        return sessionData.authenticated === true;
    } catch (e) {
        // Invalid session data
        logout();
        return false;
    }
}

/**
 * Create authenticated session
 */
function createSession() {
    const sessionData = {
        authenticated: true,
        expires: Date.now() + AUTH_CONFIG.SESSION_DURATION,
        timestamp: Date.now()
    };

    localStorage.setItem(AUTH_CONFIG.SESSION_KEY, JSON.stringify(sessionData));
}

/**
 * Clear session and logout
 */
function logout() {
    localStorage.removeItem(AUTH_CONFIG.SESSION_KEY);

    // Redirect to login page if on browser page
    if (window.location.pathname.includes('browser.html')) {
        window.location.href = './index.html';
    }
}

/**
 * Verify password
 */
function verifyPassword(password) {
    return password === AUTH_CONFIG.PASSWORD;
}

// ============================================================================
// Login Page Logic
// ============================================================================

if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
    // Check if already authenticated
    if (isAuthenticated()) {
        window.location.href = './browser.html';
    }

    // Handle login form submission
    document.addEventListener('DOMContentLoaded', () => {
        const loginForm = document.getElementById('loginForm');
        const passwordInput = document.getElementById('password');
        const errorMessage = document.getElementById('errorMessage');

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const password = passwordInput.value;

            if (verifyPassword(password)) {
                createSession();
                window.location.href = './browser.html';
            } else {
                // Show error message
                errorMessage.style.display = 'block';
                passwordInput.value = '';
                passwordInput.focus();

                // Shake animation
                loginForm.style.animation = 'shake 0.4s';
                setTimeout(() => {
                    loginForm.style.animation = '';
                }, 400);
            }
        });

        // Clear error on input
        passwordInput.addEventListener('input', () => {
            errorMessage.style.display = 'none';
        });

        // Auto-focus password field
        passwordInput.focus();
    });
}

// ============================================================================
// Browser Page Logic
// ============================================================================

if (window.location.pathname.includes('browser.html')) {
    // Protect browser page - redirect if not authenticated
    if (!isAuthenticated()) {
        window.location.href = './index.html';
    }

    // Handle logout button
    document.addEventListener('DOMContentLoaded', () => {
        const logoutBtn = document.getElementById('logoutBtn');

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to logout?')) {
                    logout();
                }
            });
        }
    });
}

// Add shake animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
        20%, 40%, 60%, 80% { transform: translateX(8px); }
    }
`;
document.head.appendChild(style);
