/* ========================================
   auth.js - Global Authentication System
   Handles: Login Popup, Login/Logout State,
            Session Storage, UI Updates
   ======================================== */

// Auth Class
class AuthSystem {
    constructor() {
        this.isLoggedIn = false;
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.createLoginPopup();
        this.setupEventListeners();
        this.updateUI();
        
        // Show login popup on home page load
        if (window.location.pathname.includes('home.html') || 
            window.location.pathname === '/' || 
            window.location.pathname.includes('index.html')) {
            setTimeout(() => {
                this.showLoginPopup();
            }, 1000);
        }
    }

    createLoginPopup() {
        // Check if popup already exists
        if (document.getElementById('loginPopup')) return;

        const popupHTML = `
            <div class="login-popup-overlay" id="loginPopup">
                <div class="login-popup">
                    <div class="close-popup" id="closeLoginPopup">
                        <i class="fa-solid fa-times"></i>
                    </div>
                    <div class="logo">Funky Teens</div>
                    <div class="detail">Welcome Back! 👋</div>
                    
                    <div class="username">
                        <i class="fa-solid fa-user"></i> Username
                    </div>
                    <div class="text-box">
                        <input type="text" id="loginUsername" placeholder="Enter your username">
                    </div>
                    
                    <div class="username">
                        <i class="fa-solid fa-lock"></i> Password
                    </div>
                    <div class="text-box">
                        <input type="password" id="loginPassword" placeholder="Enter your password">
                    </div>
                    
                    <button class="btn-getstart" id="loginBtn">
                        <span>Login</span>
                    </button>
                    
                    <div class="last">Don't have an account?</div>
                    <div class="signup">
                        <a href="#" id="signupLink">Sign up here</a>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', popupHTML);
    }

    setupEventListeners() {
        // Login button in popup
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Close popup
        const closeBtn = document.getElementById('closeLoginPopup');
        const popup = document.getElementById('loginPopup');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideLoginPopup();
            });
        }

        if (popup) {
            popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                    this.hideLoginPopup();
                }
            });
        }

        // Signup link
        const signupLink = document.getElementById('signupLink');
        if (signupLink) {
            signupLink.addEventListener('click', (e) => {
                e.preventDefault();
                alert('Signup functionality will be connected to database!');
            });
        }

        // Enter key in password field
        const passwordField = document.getElementById('loginPassword');
        if (passwordField) {
            passwordField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleLogin();
                }
            });
        }

        // Logout buttons (will be added dynamically)
        document.addEventListener('click', (e) => {
            if (e.target.closest('#logoutBtn')) {
                e.preventDefault();
                this.handleLogout();
            }
        });
    }

    handleLogin() {
        const username = document.getElementById('loginUsername')?.value;
        const password = document.getElementById('loginPassword')?.value;

        // Simple validation
        if (!username || !password) {
            this.showNotification('Please fill all fields!', 'error');
            return;
        }

        // For demo - accept any credentials
        // In production, this will connect to your database
        this.isLoggedIn = true;
        this.currentUser = {
            username: username,
            loginTime: new Date().toISOString()
        };

        this.saveToStorage();
        this.updateUI();
        this.hideLoginPopup();
        this.showNotification(`Welcome ${username}! 🎉`, 'success');

        // Log for database connection
        console.log('Login successful:', this.currentUser);
        console.log('Connect to database with these credentials');
    }

    handleLogout() {
        this.isLoggedIn = false;
        this.currentUser = null;
        this.saveToStorage();
        this.updateUI();
        this.showNotification('Logged out successfully! 👋', 'info');

        // Show login popup again after logout
        setTimeout(() => {
            if (!this.isLoggedIn) {
                this.showLoginPopup();
            }
        }, 1000);
    }

    updateUI() {
        // Update all auth buttons in navigation
        const navMenus = document.querySelectorAll('#menu');
        
        navMenus.forEach(menu => {
            // Remove existing auth button
            const existingAuth = menu.querySelector('.auth-btn');
            if (existingAuth) {
                existingAuth.remove();
            }

            // Create new auth button based on login state
            const authLi = document.createElement('li');
            
            if (this.isLoggedIn) {
                authLi.innerHTML = `
                    <a href="#" id="logoutBtn" class="auth-btn">
                        <i class="fa-solid fa-right-from-bracket"></i> Logout (${this.currentUser.username})
                    </a>
                `;
            } else {
                authLi.innerHTML = `
                    <a href="#" id="showLoginBtn" class="auth-btn">
                        <i class="fa-solid fa-right-to-bracket"></i> Login
                    </a>
                `;
            }

            menu.appendChild(authLi);

            // Add event listener for show login button
            const showLoginBtn = document.getElementById('showLoginBtn');
            if (showLoginBtn) {
                showLoginBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showLoginPopup();
                });
            }
        });

        // Also update in mobile menu
        this.updateMobileAuth();
    }

    updateMobileAuth() {
        // Same as above but for mobile if needed
        // Already covered by #menu selector
    }

    showLoginPopup() {
        const popup = document.getElementById('loginPopup');
        if (popup) {
            popup.classList.add('active');
            document.body.classList.add('modal-open');
            
            // Clear previous inputs
            document.getElementById('loginUsername').value = '';
            document.getElementById('loginPassword').value = '';
        }
    }

    hideLoginPopup() {
        const popup = document.getElementById('loginPopup');
        if (popup) {
            popup.classList.remove('active');
            document.body.classList.remove('modal-open');
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        
        let icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-exclamation-circle';
        if (type === 'info') icon = 'fa-info-circle';
        
        notification.innerHTML = `
            <i class="fa-solid ${icon}"></i>
            <span>${message}</span>
        `;

        // Add color based on type
        if (type === 'error') {
            notification.style.background = 'linear-gradient(135deg, #ff4444, #cc0000)';
        } else if (type === 'info') {
            notification.style.background = 'linear-gradient(135deg, #3498db, #2980b9)';
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    saveToStorage() {
        const authData = {
            isLoggedIn: this.isLoggedIn,
            currentUser: this.currentUser
        };
        localStorage.setItem('funky_auth', JSON.stringify(authData));
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('funky_auth');
            if (saved) {
                const data = JSON.parse(saved);
                this.isLoggedIn = data.isLoggedIn || false;
                this.currentUser = data.currentUser || null;
            }
        } catch (e) {
            console.log('Error loading auth from storage');
        }
    }
}

// Initialize auth system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.auth = new AuthSystem();
});

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);