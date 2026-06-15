// Set theme from local storage
const theme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', theme);

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        if (newTheme === 'dark') {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    }
}

// Global initialization for dynamic settings and categories
var restaurantCategories = JSON.parse(localStorage.getItem('categories'));
if (!restaurantCategories || restaurantCategories.length === 0) {
    restaurantCategories = ["Pizza", "Burger", "Pasta", "Drinks", "Desserts"];
    localStorage.setItem('categories', JSON.stringify(restaurantCategories));
}

var restaurantSettings = JSON.parse(localStorage.getItem('settings'));
if (!restaurantSettings) {
    restaurantSettings = { taxRate: 5, deliveryFee: 40 };
    localStorage.setItem('settings', JSON.stringify(restaurantSettings));
}

// Global Cart Badge Update
function updateCartBadge() {
    const cartStr = localStorage.getItem('cart');
    const cart = cartStr ? JSON.parse(cartStr) : [];
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-badge');
    
    if (badge) {
        badge.innerText = totalItems;
        if (totalItems > 0) {
            badge.classList.remove('d-none');
            // Little bounce animation when updated
            badge.style.transform = 'scale(1.2)';
            setTimeout(() => badge.style.transform = 'scale(1)', 200);
        } else {
            badge.classList.add('d-none');
        }
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Initial UI Setup
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        if (theme === 'dark') {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    }

    updateCartBadge();
    injectChatbotWidget();
    injectAdminLoginModal();
});

// Global Chatbot Widget Injection
function injectChatbotWidget() {
    // Don't inject if we are on the chatbot page itself
    if (window.location.pathname.includes('chatbot.html')) return;
    
    const widgetHtml = `
        <a href="chatbot.html" class="chat-widget-btn" title="Chat with us!">
            <i class="fas fa-comment-dots"></i>
        </a>
    `;
    
    document.body.insertAdjacentHTML('beforeend', widgetHtml);
}

// --- Admin Login Logic ---
function injectAdminLoginModal() {
    if (document.getElementById('adminLoginModal')) return;

    const modalHtml = `
        <div class="modal fade" id="adminLoginModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered modal-sm">
            <div class="modal-content bg-body-tertiary">
              <div class="modal-header border-0 pb-0">
                <h5 class="modal-title fw-bold"><i class="fas fa-user-shield text-primary"></i> Admin Login</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body p-4">
                <form id="admin-login-form" onsubmit="handleAdminLogin(event)">
                  <div class="mb-3">
                    <label class="form-label small fw-bold">Email Address</label>
                    <input type="email" class="form-control" id="admin-email" placeholder="food123@admin.com" required>
                  </div>
                  <div class="mb-4">
                    <label class="form-label small fw-bold">Password</label>
                    <input type="password" class="form-control" id="admin-pass" placeholder="••••••••" required>
                  </div>
                  <button type="submit" class="btn btn-primary w-100 fw-bold">Login to Dashboard</button>
                </form>
              </div>
            </div>
          </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

let adminLoginModalInstance = null;

function openAdminLogin() {
    if (!adminLoginModalInstance) {
        adminLoginModalInstance = new bootstrap.Modal(document.getElementById('adminLoginModal'));
    }
    document.getElementById('admin-login-form').reset();
    adminLoginModalInstance.show();
}

function handleAdminLogin(e) {
    e.preventDefault();
    const email = document.getElementById('admin-email').value.trim();
    const pass = document.getElementById('admin-pass').value.trim();
    
    // Credentials provided by the user
    if (email === 'food123@admin.com' && pass === 'food123@') {
        localStorage.setItem('isAdmin', 'true');
        adminLoginModalInstance.hide();
        window.location.href = 'admin.html';
    } else {
        alert('Invalid Admin Credentials. Please try again.');
    }
}
