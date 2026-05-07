/**
 * GLOBAL AUTO VARIASI Admin Dashboard JavaScript
 * Complete functionality for all admin pages
 */

// ===========================================
// GLOBAL CONFIGURATION
// ===========================================

const CONFIG = {
    pages: {
        dashboard: 'dashboard.html',
        analytics: 'analytics.html',
        inventory: 'inventory.html',
        stock: 'stock.html',
        settings: 'settings.html'
    },
    animations: {
        duration: 300,
        easing: 'ease-out'
    },
    breakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1200
    }
};

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

class Utils {
    static formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    }

    static formatDate(date) {
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(new Date(date));
    }

    static formatDateTime(date) {
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static animateNumber(element, target, duration = 1000) {
        const start = parseInt(element.textContent.replace(/[^\d]/g, '')) || 0;
        const increment = (target - start) / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
                element.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current).toLocaleString();
            }
        }, 16);
    }

    static createRippleEffect(event) {
        const button = event.currentTarget;
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        const rect = button.getBoundingClientRect();
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - rect.left - radius}px`;
        circle.style.top = `${event.clientY - rect.top - radius}px`;
        circle.classList.add('ripple-effect');

        const ripple = button.getElementsByClassName('ripple-effect')[0];
        if (ripple) {
            ripple.remove();
        }

        button.appendChild(circle);
        setTimeout(() => circle.remove(), 600);
    }

    static showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas ${this.getToastIcon(type)}"></i>
            <span>${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    static getToastIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    static getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().split('.')[0];
        return filename || 'dashboard';
    }

    static isMobile() {
        return window.innerWidth <= CONFIG.breakpoints.mobile;
    }

    static isTablet() {
        return window.innerWidth <= CONFIG.breakpoints.tablet && window.innerWidth > CONFIG.breakpoints.mobile;
    }

    static isDesktop() {
        return window.innerWidth > CONFIG.breakpoints.tablet;
    }
}

// ===========================================
// SIDEBAR MANAGEMENT
// ===========================================

class SidebarManager {
    constructor() {
        this.sidebar = document.querySelector('.sidebar');
        this.overlay = null;
        this.mobileMenuBtn = null;
        this.isOpen = false;
        this.init();
    }

    init() {
        this.createMobileElements();
        this.setupEventListeners();
        this.setActiveMenu();
        this.handleResponsive();
    }

    createMobileElements() {
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'sidebar-overlay';
        document.body.appendChild(this.overlay);

        // Create mobile menu button
        if (Utils.isMobile()) {
            this.mobileMenuBtn = document.createElement('button');
            this.mobileMenuBtn.className = 'mobile-menu-btn';
            this.mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            document.querySelector('.header-left').prepend(this.mobileMenuBtn);
        }
    }

    setupEventListeners() {
        // Navigation clicks
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.navigateToPage(page);
            });
        });

        // Mobile menu button
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', () => this.toggleMobile());
        }

        // Overlay click
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.closeMobile());
        }

        // Window resize
        window.addEventListener('resize', Utils.debounce(() => this.handleResponsive(), 250));
    }

    navigateToPage(page) {
        if (CONFIG.pages[page]) {
            // Show loading animation
            this.showPageTransition();

            // Navigate after short delay for smooth transition
            setTimeout(() => {
                window.location.href = CONFIG.pages[page];
            }, 300);
        }
    }

    setActiveMenu() {
        const currentPage = Utils.getCurrentPage();
        const navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === currentPage) {
                item.classList.add('active');
            }
        });
    }

    toggleMobile() {
        this.isOpen = !this.isOpen;
        this.updateMobileState();
    }

    closeMobile() {
        this.isOpen = false;
        this.updateMobileState();
    }

    updateMobileState() {
        if (this.isOpen) {
            this.sidebar.classList.add('mobile-open');
            this.overlay.classList.add('show');
            document.body.style.overflow = 'hidden';
        } else {
            this.sidebar.classList.remove('mobile-open');
            this.overlay.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    handleResponsive() {
        const wasMobile = this.mobileMenuBtn !== null;
        const isMobile = Utils.isMobile();

        if (isMobile && !wasMobile) {
            // Became mobile
            this.createMobileElements();
            this.setupEventListeners();
        } else if (!isMobile && wasMobile) {
            // Became desktop
            this.removeMobileElements();
        }

        // Update sidebar classes
        this.sidebar.classList.toggle('tablet', Utils.isTablet());
        this.sidebar.classList.toggle('mobile', Utils.isMobile());
    }

    removeMobileElements() {
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.remove();
            this.mobileMenuBtn = null;
        }
    }

    showPageTransition() {
        const transition = document.createElement('div');
        transition.className = 'page-transition';
        transition.innerHTML = '<div class="transition-spinner"></div>';
        document.body.appendChild(transition);

        setTimeout(() => transition.classList.add('show'), 10);
    }
}

// ===========================================
// NOTIFICATION SYSTEM
// ===========================================

class NotificationManager {
    constructor() {
        this.notifications = [
            {
                id: 1,
                type: 'error',
                title: 'Stok Michelin Pilot Sport 4 kritis',
                message: 'Stok ban Michelin Pilot Sport 4 tersisa di bawah ambang aman.',
                time: 'Baru saja',
                read: false
            },
            {
                id: 2,
                type: 'info',
                title: '3 transaksi baru hari ini',
                message: 'Terdapat 3 transaksi baru pada dashboard saat ini.',
                time: '10 menit yang lalu',
                read: false
            },
            {
                id: 3,
                type: 'warning',
                title: 'Produk JBL Club 6500C hampir habis',
                message: 'Stok JBL Club 6500C mendekati batas minimum.',
                time: '30 menit yang lalu',
                read: false
            }
        ];
        this.dropdown = null;
        this.init();
    }

    init() {
        this.createNotificationDropdown();
        this.setupEventListeners();
        this.updateNotificationBadge();
    }

    createNotificationDropdown() {
        const notificationBtn = document.querySelector('.notification-btn');
        if (!notificationBtn) return;

        this.dropdown = document.createElement('div');
        this.dropdown.className = 'notification-dropdown dropdown-panel';
        this.dropdown.innerHTML = this.renderNotifications();
        notificationBtn.appendChild(this.dropdown);
    }

    renderNotifications() {
        const unreadCount = this.notifications.filter(n => !n.read).length;

        return `
            <div class="notification-header">
                <h4>Notifikasi</h4>
                <span class="notification-count">${unreadCount} baru</span>
            </div>
            <div class="notification-list">
                ${this.notifications.map(notification => `
                    <button type="button" class="notification-item ${notification.read ? 'read' : 'unread'} ${notification.type}" data-id="${notification.id}">
                        <div class="notification-icon">
                            <i class="fas ${this.getNotificationIcon(notification.type)}"></i>
                        </div>
                        <div class="notification-content">
                            <div class="notification-title">${notification.title}</div>
                            <div class="notification-message">${notification.message}</div>
                            <div class="notification-time">${notification.time}</div>
                        </div>
                    </button>
                `).join('')}
            </div>
            <div class="notification-footer">
                <button class="mark-all-read btn btn-secondary" type="button">Tandai Semua Dibaca</button>
            </div>
        `;
    }

    getNotificationIcon(type) {
        const icons = {
            warning: 'fa-exclamation-triangle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle',
            success: 'fa-check-circle'
        };
        return icons[type] || icons.info;
    }

    setupEventListeners() {
        const notificationBtn = document.querySelector('.notification-btn');
        if (!notificationBtn || !this.dropdown) return;

        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        document.addEventListener('click', (e) => {
            if (!notificationBtn.contains(e.target)) {
                this.closeDropdown();
            }
        });

        this.dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            const item = e.target.closest('.notification-item');
            if (item) {
                const id = parseInt(item.dataset.id, 10);
                this.markAsRead(id);
            }

            const markAllBtn = e.target.closest('.mark-all-read');
            if (markAllBtn) {
                this.markAllAsRead();
            }
        });
    }

    toggleDropdown() {
        if (this.dropdown) {
            document.querySelectorAll('.dropdown-panel.show').forEach(panel => {
                if (panel !== this.dropdown) panel.classList.remove('show');
            });
            this.dropdown.classList.toggle('show');
        }
    }

    closeDropdown() {
        if (this.dropdown) {
            this.dropdown.classList.remove('show');
        }
    }

    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            this.updateNotificationBadge();
            this.refreshDropdown();
        }
    }

    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.updateNotificationBadge();
        this.refreshDropdown();
    }

    updateNotificationBadge() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const badge = document.querySelector('.notification-badge');
        const notificationBtn = document.querySelector('.notification-btn');

        if (!notificationBtn) return;

        if (unreadCount > 0) {
            if (!badge) {
                const newBadge = document.createElement('span');
                newBadge.className = 'notification-badge';
                newBadge.textContent = unreadCount > 9 ? '9+' : unreadCount;
                notificationBtn.appendChild(newBadge);
            } else {
                badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            }
        } else if (badge) {
            badge.remove();
        }
    }

    refreshDropdown() {
        if (this.dropdown) {
            this.dropdown.innerHTML = this.renderNotifications();
        }
    }
}

class ProfileManager {
    constructor() {
        this.profileBtn = document.querySelector('.profile-btn');
        this.dropdown = null;
        this.init();
    }

    init() {
        this.createProfileDropdown();
        this.setupEventListeners();
    }

    createProfileDropdown() {
        if (!this.profileBtn) return;

        this.dropdown = document.createElement('div');
        this.dropdown.className = 'profile-dropdown dropdown-panel';
        this.dropdown.innerHTML = `
            <div class="profile-card">
                <div class="profile-avatar-large">A</div>
                <div class="profile-details">
                    <div class="profile-name">Admin User</div>
                    <div class="profile-role">Administrator</div>
                </div>
            </div>
            <div class="profile-actions">
                <button type="button" class="dropdown-action" data-action="settings">Pengaturan</button>
                <button type="button" class="dropdown-action logout-action">Logout</button>
            </div>
        `;
        this.profileBtn.appendChild(this.dropdown);
    }

    setupEventListeners() {
        if (!this.profileBtn || !this.dropdown) return;

        this.profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        document.addEventListener('click', (e) => {
            if (!this.profileBtn.contains(e.target)) {
                this.closeDropdown();
            }
        });

        this.dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            const settingsBtn = e.target.closest('[data-action="settings"]');
            if (settingsBtn) {
                window.location.href = 'settings.html';
            }

            const logoutBtn = e.target.closest('.logout-action');
            if (logoutBtn) {
                ModalManager.open('logout-modal');
            }
        });
    }

    toggleDropdown() {
        if (this.dropdown) {
            document.querySelectorAll('.dropdown-panel.show').forEach(panel => {
                if (panel !== this.dropdown) panel.classList.remove('show');
            });
            this.dropdown.classList.toggle('show');
        }
    }

    closeDropdown() {
        if (this.dropdown) {
            this.dropdown.classList.remove('show');
        }
    }
}

// ===========================================
// MODAL MANAGEMENT
// ===========================================

class ModalManager {
    static init() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.show');
                if (openModal) {
                    openModal.classList.remove('show');
                }
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('show');
            }

            const closeTrigger = e.target.closest('.modal-close');
            if (closeTrigger) {
                const modal = closeTrigger.closest('.modal');
                if (modal) {
                    modal.classList.remove('show');
                }
            }

            const logoutTrigger = e.target.closest('.confirm-logout');
            if (logoutTrigger) {
                window.location.href = '../login.html';
            }
        });
    }

    static open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            // Focus trap for accessibility
            const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }
        }
    }

    static close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    }
}

// ===========================================
// TABLE MANAGEMENT
// ===========================================

class TableManager {
    constructor(tableId) {
        this.table = document.getElementById(tableId);
        this.tbody = this.table?.querySelector('tbody');
        this.searchInput = null;
        this.filters = {};
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.init();
    }

    init() {
        if (!this.table) return;

        this.createSearchAndFilters();
        this.setupEventListeners();
        this.setupSorting();
    }

    createSearchAndFilters() {
        const tableWrapper = this.table.closest('.table-container') || this.table.parentElement;
        const controls = document.createElement('div');
        controls.className = 'table-controls';

        controls.innerHTML = `
            <div class="table-search">
                <i class="fas fa-search"></i>
                <input type="text" placeholder="Cari produk..." class="search-input">
            </div>
            <div class="table-filters">
                <select class="filter-select" data-filter="category">
                    <option value="">Semua Kategori</option>
                    <option value="ban">Ban</option>
                    <option value="velg">Velg</option>
                    <option value="audio">Audio</option>
                    <option value="aksesoris">Aksesoris</option>
                </select>
                <select class="filter-select" data-filter="status">
                    <option value="">Semua Status</option>
                    <option value="tersedia">Tersedia</option>
                    <option value="menipis">Menipis</option>
                    <option value="habis">Habis</option>
                </select>
            </div>
        `;

        tableWrapper.insertBefore(controls, this.table);
        this.searchInput = controls.querySelector('.search-input');
    }

    setupEventListeners() {
        // Search
        if (this.searchInput) {
            this.searchInput.addEventListener('input', Utils.debounce(() => this.filter(), 300));
        }

        // Filters
        const filterSelects = this.table.closest('.table-container').querySelectorAll('.filter-select');
        filterSelects.forEach(select => {
            select.addEventListener('change', () => {
                this.filters[select.dataset.filter] = select.value;
                this.filter();
            });
        });
    }

    setupSorting() {
        const headers = this.table.querySelectorAll('thead th[data-sort]');
        headers.forEach(header => {
            header.style.cursor = 'pointer';
            header.addEventListener('click', () => this.sort(header.dataset.sort));
        });
    }

    filter() {
        const searchTerm = this.searchInput?.value.toLowerCase() || '';
        const rows = this.tbody.querySelectorAll('tr');

        rows.forEach(row => {
            let show = true;

            // Search filter
            if (searchTerm) {
                const text = row.textContent.toLowerCase();
                show = show && text.includes(searchTerm);
            }

            // Category filter
            if (this.filters.category) {
                const category = row.cells[2]?.textContent.toLowerCase();
                show = show && category.includes(this.filters.category);
            }

            // Status filter
            if (this.filters.status) {
                const statusBadge = row.querySelector('.status-badge');
                const status = statusBadge?.classList.contains(this.filters.status);
                show = show && status;
            }

            row.style.display = show ? '' : 'none';
        });
    }

    sort(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }

        const rows = Array.from(this.tbody.querySelectorAll('tr'));
        const columnIndex = this.getColumnIndex(column);

        rows.sort((a, b) => {
            const aVal = a.cells[columnIndex]?.textContent.trim() || '';
            const bVal = b.cells[columnIndex]?.textContent.trim() || '';

            let comparison = 0;
            if (aVal < bVal) comparison = -1;
            if (aVal > bVal) comparison = 1;

            return this.sortDirection === 'asc' ? comparison : -comparison;
        });

        // Re-append sorted rows
        rows.forEach(row => this.tbody.appendChild(row));

        // Update sort indicators
        this.updateSortIndicators();
    }

    getColumnIndex(column) {
        const headers = this.table.querySelectorAll('thead th');
        for (let i = 0; i < headers.length; i++) {
            if (headers[i].dataset.sort === column) return i;
        }
        return 0;
    }

    updateSortIndicators() {
        const headers = this.table.querySelectorAll('thead th');
        headers.forEach(header => {
            header.classList.remove('sort-asc', 'sort-desc');
            if (header.dataset.sort === this.sortColumn) {
                header.classList.add(`sort-${this.sortDirection}`);
            }
        });
    }
}

// ===========================================
// SETTINGS MANAGEMENT
// ===========================================

class SettingsManager {
    constructor() {
        this.darkMode = localStorage.getItem('darkMode') === 'true';
        this.init();
    }

    init() {
        this.setupDarkMode();
        this.setupPasswordVisibility();
        this.setupFormValidation();
        this.loadSettings();
    }

    setupDarkMode() {
        const toggle = document.getElementById('darkMode');
        if (toggle) {
            toggle.checked = this.darkMode;
            toggle.addEventListener('change', () => this.toggleDarkMode());
        }
        this.applyDarkMode();
    }

    toggleDarkMode() {
        this.darkMode = !this.darkMode;
        localStorage.setItem('darkMode', this.darkMode);
        this.applyDarkMode();
        Utils.showToast(`Dark mode ${this.darkMode ? 'diaktifkan' : 'dinonaktifkan'}`, 'info');
    }

    applyDarkMode() {
        document.documentElement.classList.toggle('dark-mode', this.darkMode);
    }

    setupPasswordVisibility() {
        const passwordFields = document.querySelectorAll('input[type="password"]');
        passwordFields.forEach(field => {
            const wrapper = field.parentElement;
            const toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.className = 'password-toggle';
            toggle.innerHTML = '<i class="fas fa-eye"></i>';
            toggle.addEventListener('click', () => this.togglePasswordVisibility(field, toggle));

            wrapper.style.position = 'relative';
            wrapper.appendChild(toggle);
        });
    }

    togglePasswordVisibility(field, toggle) {
        const isVisible = field.type === 'text';
        field.type = isVisible ? 'password' : 'text';
        toggle.innerHTML = `<i class="fas fa-eye${isVisible ? '' : '-slash'}"></i>`;
    }

    setupFormValidation() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => this.validateForm(e));
        });
    }

    validateForm(e) {
        const form = e.target;
        const password = form.querySelector('input[name="newPassword"]');
        const confirmPassword = form.querySelector('input[name="confirmPassword"]');

        if (password && confirmPassword && password.value !== confirmPassword.value) {
            e.preventDefault();
            Utils.showToast('Konfirmasi password tidak cocok!', 'error');
            return false;
        }

        // Simulate save
        e.preventDefault();
        Utils.showToast('Pengaturan berhasil disimpan!', 'success');
        return false;
    }

    loadSettings() {
        // Load other settings from localStorage
        const settings = ['emailNotifications', 'stockAlerts', 'systemLanguage'];
        settings.forEach(setting => {
            const element = document.getElementById(setting);
            if (element) {
                const value = localStorage.getItem(setting);
                if (value !== null) {
                    if (element.type === 'checkbox') {
                        element.checked = value === 'true';
                    } else {
                        element.value = value;
                    }
                }
            }
        });
    }
}

// ===========================================
// CHART MANAGEMENT
// ===========================================

class ChartManager {
    static init() {
        this.resizeObserver = new ResizeObserver(entries => {
            entries.forEach(entry => {
                const canvas = entry.target;
                const chart = Chart.getChart(canvas);
                if (chart) {
                    chart.resize();
                }
            });
        });
    }

    static createChart(canvasId, config) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        // Destroy existing chart
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }

        // Create new chart with responsive config
        const chart = new Chart(canvas, {
            ...config,
            options: {
                ...config.options,
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    ...config.options.plugins,
                    tooltip: {
                        ...config.options.plugins?.tooltip,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false
                    }
                },
                scales: {
                    ...config.options.scales,
                    x: {
                        ...config.options.scales?.x,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#94A3B8'
                        }
                    },
                    y: {
                        ...config.options.scales?.y,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#94A3B8'
                        }
                    }
                }
            }
        });

        // Observe for resize
        this.resizeObserver.observe(canvas);

        return chart;
    }
}

// ===========================================
// INITIALIZATION
// ===========================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize core systems
    const sidebar = new SidebarManager();
    const notifications = new NotificationManager();
    const profile = new ProfileManager();
    ModalManager.init();
    ChartManager.init();

    const logoutButton = document.querySelector('.logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => ModalManager.open('logout-modal'));
    }

    // Initialize page-specific functionality
    const currentPage = Utils.getCurrentPage();

    switch (currentPage) {
        case 'dashboard':
            initializeDashboard();
            break;
        case 'analytics':
            initializeAnalytics();
            break;
        case 'inventory':
            initializeInventory();
            break;
        case 'stock':
            initializeStock();
            break;
        case 'settings':
            initializeSettings();
            break;
    }

    // Global event listeners
    setupGlobalEventListeners();

    // Animate numbers on load
    animateNumbersOnLoad();
});

// ===========================================
// PAGE INITIALIZERS
// ===========================================

function initializeDashboard() {
    // Animate stat cards
    const cards = document.querySelectorAll('.stat-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });

    // Initialize dashboard charts
    if (document.getElementById('stockChart')) {
        ChartManager.createChart('stockChart', {
            type: 'line',
            data: {
                labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
                datasets: [{
                    label: 'Stok Masuk',
                    data: [12, 19, 15, 25, 22, 18, 14],
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Stok Keluar',
                    data: [8, 15, 12, 20, 18, 16, 10],
                    borderColor: '#DC2626',
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {}
        });
    }
}

function initializeAnalytics() {
    // Sales Chart
    ChartManager.createChart('salesChart', {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Penjualan',
                data: [120, 150, 180, 200, 250, 280, 320, 350, 380, 420, 450, 480],
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#10B981',
                pointBorderColor: '#FFFFFF',
                pointBorderWidth: 2
            }]
        },
        options: {}
    });

    // Category Chart
    ChartManager.createChart('categoryChart', {
        type: 'doughnut',
        data: {
            labels: ['Audio', 'Ban', 'Velg', 'Aksesoris', 'Lainnya'],
            datasets: [{
                data: [35, 25, 20, 15, 5],
                backgroundColor: [
                    '#10B981',
                    '#3B82F6',
                    '#F59E0B',
                    '#8B5CF6',
                    '#EF4444'
                ],
                borderWidth: 0
            }]
        },
        options: {
            cutout: '60%'
        }
    });

    // Stock Flow Chart
    ChartManager.createChart('stockFlowChart', {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Stok Masuk',
                data: [120, 150, 180, 200, 250, 280],
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: '#10B981',
                borderWidth: 1
            }, {
                label: 'Stok Keluar',
                data: [100, 130, 160, 180, 220, 260],
                backgroundColor: 'rgba(220, 38, 38, 0.8)',
                borderColor: '#DC2626',
                borderWidth: 1
            }]
        },
        options: {}
    });
}

function initializeInventory() {
    // Initialize table manager
    new TableManager('inventoryTable');

    // Setup modals
    setupInventoryModals();
}

function initializeStock() {
    // Initialize table manager for transactions
    new TableManager('transactionTable');

    // Setup stock forms
    setupStockForms();
}

function initializeSettings() {
    new SettingsManager();
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

function setupGlobalEventListeners() {
    // Button ripple effects
    document.addEventListener('click', (e) => {
        if (e.target.closest('.btn-primary, .btn-secondary, .btn-danger')) {
            Utils.createRippleEffect(e);
        }
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function animateNumbersOnLoad() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(number => {
        const target = parseInt(number.textContent.replace(/[^\d]/g, ''));
        if (!isNaN(target)) {
            Utils.animateNumber(number, target, 1500);
        }
    });
}

function setupInventoryModals() {
    // Add product modal
    const addBtn = document.getElementById('addProductBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            ModalManager.open('productModal');
        });
    }

    // Edit buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.edit-btn')) {
            const id = e.target.closest('.edit-btn').dataset.id;
            // Load product data and open modal
            ModalManager.open('productModal');
        }

        if (e.target.closest('.delete-btn')) {
            const id = e.target.closest('.delete-btn').dataset.id;
            // Show delete confirmation
            ModalManager.open('deleteModal');
        }
    });
}

function setupStockForms() {
    const stockInForm = document.getElementById('stockInForm');
    const stockOutForm = document.getElementById('stockOutForm');

    if (stockInForm) {
        stockInForm.addEventListener('submit', (e) => {
            e.preventDefault();
            Utils.showToast('Barang masuk berhasil dicatat!', 'success');
            e.target.reset();
        });
    }

    if (stockOutForm) {
        stockOutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            Utils.showToast('Barang keluar berhasil dicatat!', 'success');
            e.target.reset();
        });
    }
}

// ===========================================
// CSS FOR DYNAMIC ELEMENTS
// ===========================================

const style = document.createElement('style');
style.textContent = `
/* Mobile Menu Button */
.mobile-menu-btn {
    display: none;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    width: 40px;
    height: 40px;
    color: var(--text-primary);
    cursor: pointer;
    margin-right: 12px;
    transition: var(--transition);
}

.mobile-menu-btn:hover {
    background: var(--bg-secondary);
}

/* Sidebar Responsive */
.sidebar.mobile .sidebar-nav {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
}

.sidebar.mobile.mobile-open .sidebar-nav {
    transform: translateX(0);
}

.sidebar.tablet .sidebar-nav {
    width: 200px;
}

/* Sidebar Overlay */
.sidebar-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.sidebar-overlay.show {
    opacity: 1;
}

/* Notification Dropdown */
.notification-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    width: 350px;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.3s ease;
    z-index: 1000;
    margin-top: 8px;
}

.notification-dropdown.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.notification-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: between;
    align-items: center;
}

.notification-header h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
}

.notification-count {
    font-size: 12px;
    color: var(--accent-red);
    background: rgba(220, 38, 38, 0.1);
    padding: 2px 8px;
    border-radius: 12px;
}

.notification-list {
    max-height: 300px;
    overflow-y: auto;
}

.notification-item {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color);
    cursor: pointer;
    transition: var(--transition);
    position: relative;
}

.notification-item:hover {
    background: var(--bg-secondary);
}

.notification-item.unread {
    background: rgba(59, 130, 246, 0.05);
}

.notification-item.warning {
    border-left: 3px solid #F59E0B;
}

.notification-item.error {
    border-left: 3px solid #DC2626;
}

.notification-item.info {
    border-left: 3px solid #3B82F6;
}

.notification-icon {
    width: 32px;
    height: 32px;
    background: var(--bg-secondary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent-red);
    margin-right: 12px;
    flex-shrink: 0;
}

.notification-content {
    flex: 1;
}

.notification-title {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
}

.notification-message {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 4px;
}

.notification-time {
    font-size: 12px;
    color: var(--text-muted);
}

.notification-dot {
    width: 8px;
    height: 8px;
    background: var(--accent-red);
    border-radius: 50%;
    position: absolute;
    top: 16px;
    right: 20px;
}

.notification-footer {
    padding: 12px 20px;
    border-top: 1px solid var(--border-color);
    text-align: center;
}

.mark-all-read {
    background: none;
    border: none;
    color: var(--accent-red);
    cursor: pointer;
    font-size: 14px;
    padding: 8px;
    transition: var(--transition);
}

.mark-all-read:hover {
    background: var(--bg-secondary);
    border-radius: var(--border-radius);
}

/* Notification Badge */
.notification-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: var(--accent-red);
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--bg-primary);
}

/* Table Controls */
.table-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    gap: 20px;
}

.table-search {
    position: relative;
    flex: 1;
    max-width: 300px;
}

.table-search i {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
}

.table-search input {
    width: 100%;
    padding: 12px 12px 12px 40px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    color: var(--text-primary);
    font-size: 14px;
}

.table-filters {
    display: flex;
    gap: 12px;
}

.table-filters select {
    padding: 12px 16px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    color: var(--text-primary);
    cursor: pointer;
}

/* Sort Indicators */
th[data-sort] {
    position: relative;
}

th.sort-asc::after {
    content: '↑';
    position: absolute;
    right: 8px;
    color: var(--accent-red);
}

th.sort-desc::after {
    content: '↓';
    position: absolute;
    right: 8px;
    color: var(--accent-red);
}

/* Password Toggle */
.password-toggle {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 4px;
    transition: var(--transition);
}

.password-toggle:hover {
    color: var(--text-primary);
}

/* Ripple Effect */
.ripple-effect {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: scale(0);
    animation: ripple 0.6s linear;
    pointer-events: none;
}

@keyframes ripple {
    to {
        transform: scale(4);
        opacity: 0;
    }
}

/* Toast Notifications */
.toast {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: 16px 20px;
    box-shadow: var(--shadow);
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 10000;
    transform: translateX(400px);
    transition: transform 0.3s ease;
    max-width: 400px;
}

.toast.show {
    transform: translateX(0);
}

.toast-success {
    border-left: 4px solid #10B981;
}

.toast-success i {
    color: #10B981;
}

.toast-error {
    border-left: 4px solid #DC2626;
}

.toast-error i {
    color: #DC2626;
}

.toast-warning {
    border-left: 4px solid #F59E0B;
}

.toast-warning i {
    color: #F59E0B;
}

.toast-info {
    border-left: 4px solid #3B82F6;
}

.toast-info i {
    color: #3B82F6;
}

.toast-close {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 4px;
    margin-left: auto;
}

/* Page Transition */
.page-transition {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--bg-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.page-transition.show {
    opacity: 1;
}

.transition-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border-color);
    border-top: 3px solid var(--accent-red);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Dark Mode */
.dark-mode {
    --bg-primary: #0F172A;
    --bg-secondary: #1E293B;
    --bg-card: #334155;
    --text-primary: #F8FAFC;
    --text-secondary: #CBD5E1;
    --text-muted: #64748B;
    --border-color: #475569;
    --accent-red: #EF4444;
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .mobile-menu-btn {
        display: flex;
    }

    .table-controls {
        flex-direction: column;
        align-items: stretch;
    }

    .table-filters {
        justify-content: center;
    }

    .notification-dropdown {
        width: calc(100vw - 40px);
        right: -20px;
    }

    .toast {
        left: 20px;
        right: 20px;
        max-width: none;
    }
}
`;
document.head.appendChild(style);