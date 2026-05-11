/**
 * GLOBAL AUTO VARIASI Admin Dashboard JavaScript
 * Complete functionality for all admin pages
 */

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

// NOTIFICATION SYSTEM

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

// MODAL MANAGEMENT

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

// TABLE MANAGEMENT

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

// SETTINGS MANAGEMENT

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

// CHART MANAGEMENT

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

// INITIALIZATION

document.addEventListener('DOMContentLoaded', function () {
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

// PAGE INITIALIZERS

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

// HELPER FUNCTIONS

function setupGlobalEventListeners() {
    // Button ripple effects
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-primary, .btn-secondary, .btn-danger');
        if (btn) {
            const fakeEvent = { currentTarget: btn, clientX: e.clientX, clientY: e.clientY };
            Utils.createRippleEffect(fakeEvent);
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
    // Handled by StockManager
}

// CSS FOR DYNAMIC ELEMENTS

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

// PRODUCT MANAGER (Inventory Page)

class ProductManager {
    constructor() {
        this.tableBody = document.getElementById('inventoryTableBody');
        this.productForm = document.getElementById('productForm');
        this.allProducts = [];
        this.deleteTargetId = null;
        this.init();
    }

    init() {
        if (!this.tableBody) return;
        this.loadProducts();

        if (this.productForm) {
            this.productForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        const addBtn = document.getElementById('addProductBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.productForm.reset();
                const title = document.getElementById('modalTitle');
                if (title) title.textContent = 'Tambah Produk';
                ModalManager.open('productModal');
            });
        }

        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                ModalManager.close('productModal');
            });
        }

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(() => this.applyFilters(), 250));
        }

        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.applyFilters());
        }

        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyFilters());
        }

        const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');
        if (deleteConfirmBtn) {
            deleteConfirmBtn.addEventListener('click', () => this.confirmDelete());
        }
        const deleteCancelBtn = document.getElementById('deleteCancelBtn');
        if (deleteCancelBtn) {
            deleteCancelBtn.addEventListener('click', () => ModalManager.close('deleteModal'));
        }
        const deleteModalClose = document.getElementById('deleteModalClose');
        if (deleteModalClose) {
            deleteModalClose.addEventListener('click', () => ModalManager.close('deleteModal'));
        }
    }

    async loadProducts() {
        try {
            const response = await fetch('/api/products');
            const result = await response.json();
            if (result.success) {
                this.allProducts = result.data;
                this.applyFilters();
            } else {
                Utils.showToast('Gagal memuat data produk', 'error');
            }
        } catch (error) {
            Utils.showToast('Kesalahan koneksi ke server', 'error');
        }
    }

    applyFilters() {
        const searchVal = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
        const categoryVal = (document.getElementById('categoryFilter')?.value || '').toLowerCase();
        const statusVal = (document.getElementById('statusFilter')?.value || '').toLowerCase();

        let filtered = this.allProducts;

        if (searchVal) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchVal) ||
                p.sku.toLowerCase().includes(searchVal) ||
                (p.description || '').toLowerCase().includes(searchVal) ||
                p.category.toLowerCase().includes(searchVal)
            );
        }

        if (categoryVal) {
            filtered = filtered.filter(p => p.category.toLowerCase() === categoryVal);
        }

        if (statusVal) {
            filtered = filtered.filter(p => p.status.toLowerCase() === statusVal);
        }

        this.renderTable(filtered);
    }

    renderTable(products) {
        this.tableBody.innerHTML = '';

        if (products.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="7" style="text-align:center; padding:40px; color:var(--text-muted);">Tidak ada produk ditemukan</td>';
            this.tableBody.appendChild(tr);
            return;
        }

        products.forEach(p => {
            const statusClass = p.status === 'aman' ? 'aman' : (p.status === 'menipis' ? 'menipis' : 'kritis');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="product-info">
                        <div class="product-name">${p.name}</div>
                        <div class="product-desc">${p.description || ''}</div>
                    </div>
                </td>
                <td>${p.sku}</td>
                <td style="text-transform: capitalize;">${p.category}</td>
                <td class="text-center">${p.stock}</td>
                <td class="text-center">${Utils.formatCurrency(p.price)}</td>
                <td><span class="status-badge ${statusClass}">${p.status.charAt(0).toUpperCase() + p.status.slice(1)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit-btn" data-id="${p.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" data-id="${p.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            this.tableBody.appendChild(tr);
        });

        this.tableBody.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.deleteTargetId = btn.dataset.id;
                ModalManager.open('deleteModal');
            });
        });
    }

    async confirmDelete() {
        if (!this.deleteTargetId) return;
        try {
            const response = await fetch(`/api/products/${this.deleteTargetId}`, { method: 'DELETE' });
            const result = await response.json();
            if (result.success) {
                Utils.showToast('Produk berhasil dihapus', 'success');
                ModalManager.close('deleteModal');
                this.deleteTargetId = null;
                this.loadProducts();
            } else {
                Utils.showToast(result.message || 'Gagal menghapus', 'error');
            }
        } catch (error) {
            Utils.showToast('Terjadi kesalahan', 'error');
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        const data = {
            name: document.getElementById('productName').value,
            sku: document.getElementById('productSKU').value,
            category: document.getElementById('productCategory').value,
            price: document.getElementById('productPrice').value,
            stock: document.getElementById('productStock').value,
            description: ''
        };

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();

            if (result.success) {
                Utils.showToast('Produk berhasil ditambahkan', 'success');
                ModalManager.close('productModal');
                this.productForm.reset();
                this.loadProducts();
            } else {
                Utils.showToast(result.message || 'Gagal menambahkan', 'error');
            }
        } catch (error) {
            Utils.showToast('Terjadi kesalahan', 'error');
        }
    }
}

class DashboardProductsManager {
    constructor() {
        this.tableBody = document.getElementById('dashboardTableBody');
        this.allProducts = [];
        this.init();
    }

    async init() {
        if (!this.tableBody) return;
        try {
            const response = await fetch('/api/products');
            const result = await response.json();
            if (result.success) {
                this.allProducts = result.data;
                this.renderTable(this.allProducts);
                this.setupSearch();
            }
        } catch (error) {
            // Silently fail for dashboard
        }
    }

    setupSearch() {
        const searchInput = document.getElementById('dashboardSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(() => this.applyFilters(), 250));
        }

        const categoryFilter = document.getElementById('dashboardCategoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.applyFilters());
        }
    }

    applyFilters() {
        const searchVal = (document.getElementById('dashboardSearchInput')?.value || '').toLowerCase().trim();
        const categoryVal = (document.getElementById('dashboardCategoryFilter')?.value || '').toLowerCase();

        let filtered = this.allProducts;

        if (searchVal) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchVal) ||
                p.sku.toLowerCase().includes(searchVal) ||
                (p.description || '').toLowerCase().includes(searchVal) ||
                p.category.toLowerCase().includes(searchVal)
            );
        }

        if (categoryVal) {
            filtered = filtered.filter(p => p.category.toLowerCase() === categoryVal);
        }

        this.renderTable(filtered);
    }

    renderTable(products) {
        this.tableBody.innerHTML = '';

        if (products.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="6" style="text-align:center; padding:40px; color:var(--text-muted);">Tidak ada produk ditemukan</td>';
            this.tableBody.appendChild(tr);
            return;
        }

        products.slice(0, 10).forEach(p => {
            const statusClass = p.status === 'aman' ? 'aman' : (p.status === 'menipis' ? 'menipis' : 'kritis');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="product-info">
                        <div class="product-name">${p.name}</div>
                        <div class="product-desc">${p.description || ''}</div>
                    </div>
                </td>
                <td>${p.sku}</td>
                <td style="text-transform: capitalize;">${p.category}</td>
                <td>${p.stock}</td>
                <td>5</td>
                <td><span class="status-badge ${statusClass}">${p.status.charAt(0).toUpperCase() + p.status.slice(1)}</span></td>
            `;
            this.tableBody.appendChild(tr);
        });
    }
}

class TransactionSearchManager {
    constructor() {
        this.tableBody = document.getElementById('transactionTableBody');
        this.allRows = [];
        this.init();
    }

    init() {
        if (!this.tableBody) return;

        this.allRows = Array.from(this.tableBody.querySelectorAll('tr'));

        const searchInput = document.getElementById('transactionSearch');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(() => this.applyFilters(), 250));
        }

        const typeFilter = document.getElementById('transactionTypeFilter');
        if (typeFilter) {
            typeFilter.addEventListener('change', () => this.applyFilters());
        }

        const dateFilter = document.getElementById('dateFilter');
        if (dateFilter) {
            dateFilter.addEventListener('change', () => this.applyFilters());
        }
    }

    applyFilters() {
        const searchVal = (document.getElementById('transactionSearch')?.value || '').toLowerCase().trim();
        const typeVal = (document.getElementById('transactionTypeFilter')?.value || '').toLowerCase();
        const dateVal = document.getElementById('dateFilter')?.value || '';

        this.allRows.forEach(row => {
            let show = true;
            const text = row.textContent.toLowerCase();

            if (searchVal) {
                show = show && text.includes(searchVal);
            }

            if (typeVal) {
                const badge = row.querySelector('.transaction-badge');
                if (badge) {
                    show = show && badge.classList.contains(typeVal);
                }
            }

            if (dateVal) {
                show = show && text.includes(dateVal);
            }

            row.style.display = show ? '' : 'none';
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SidebarManager();
    new NotificationManager();
    new ProfileManager();
    new SettingsManager();
    ModalManager.init();

    if (document.getElementById('inventoryTableBody')) {
        new ProductManager();
    }

    if (document.getElementById('dashboardTableBody')) {
        new DashboardProductsManager();
        new DashboardStatsManager();
    }

    if (document.getElementById('stockInForm') || document.getElementById('transactionTableBody')) {
        new StockManager();
    }
});

class StockManager {
    constructor() {
        this.tableBody = document.getElementById('transactionTableBody');
        this.allTransactions = [];
        this.filteredTransactions = [];
        this.currentPage = 1;
        this.perPage = 10;
        this.init();
    }

    async init() {
        await this.loadProductDropdowns();
        await this.loadTransactions();
        await this.loadStats();
        this.setupForms();
        this.setupFilters();
    }

    async loadProductDropdowns() {
        try {
            const response = await fetch('/api/products');
            const result = await response.json();
            if (!result.success) return;

            const selects = [
                document.getElementById('stockInProduct'),
                document.getElementById('stockOutProduct')
            ];

            selects.forEach(select => {
                if (!select) return;
                select.innerHTML = '<option value="">Pilih Produk</option>';
                result.data.forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = p.id;
                    opt.textContent = `${p.name} (Stok: ${p.stock})`;
                    select.appendChild(opt);
                });
            });
        } catch (error) {
            // silently fail
        }
    }

    async loadStats() {
        try {
            const response = await fetch('/api/stock-stats');
            const result = await response.json();
            if (!result.success) return;

            const el = (id) => document.getElementById(id);
            const d = result.data;

            const inEl = el('stockStatIn');
            if (inEl) inEl.textContent = d.totalIn.toLocaleString('id-ID');

            const outEl = el('stockStatOut');
            if (outEl) outEl.textContent = d.totalOut.toLocaleString('id-ID');

            const todayEl = el('stockStatToday');
            if (todayEl) todayEl.textContent = d.todayCount.toLocaleString('id-ID');

            const activeEl = el('stockStatActive');
            if (activeEl) activeEl.textContent = d.mostActive;
        } catch (error) {
            // silently fail
        }
    }

    async loadTransactions() {
        if (!this.tableBody) return;
        try {
            const response = await fetch('/api/transactions');
            const result = await response.json();
            if (result.success) {
                this.allTransactions = result.data;
                this.applyFilters();
            }
        } catch (error) {
            // silently fail
        }
    }

    setupForms() {
        const stockInForm = document.getElementById('stockInForm');
        if (stockInForm) {
            stockInForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.submitTransaction('in', {
                    product_id: document.getElementById('stockInProduct').value,
                    quantity: parseInt(document.getElementById('stockInQuantity').value),
                    supplier: document.getElementById('stockInSupplier').value,
                    notes: document.getElementById('stockInNotes').value
                });
                stockInForm.reset();
            });
        }

        const stockOutForm = document.getElementById('stockOutForm');
        if (stockOutForm) {
            stockOutForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.submitTransaction('out', {
                    product_id: document.getElementById('stockOutProduct').value,
                    quantity: parseInt(document.getElementById('stockOutQuantity').value),
                    destination: document.getElementById('stockOutDestination').value,
                    notes: document.getElementById('stockOutNotes').value
                });
                stockOutForm.reset();
            });
        }
    }

    async submitTransaction(type, data) {
        try {
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, type })
            });
            const result = await response.json();

            if (result.success) {
                Utils.showToast(result.message, 'success');
                await this.loadProductDropdowns();
                await this.loadTransactions();
                await this.loadStats();
            } else {
                Utils.showToast(result.message || 'Gagal memproses transaksi', 'error');
            }
        } catch (error) {
            Utils.showToast('Terjadi kesalahan koneksi', 'error');
        }
    }

    setupFilters() {
        const searchInput = document.getElementById('transactionSearch');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(() => this.applyFilters(), 250));
        }

        const typeFilter = document.getElementById('transactionTypeFilter');
        if (typeFilter) {
            typeFilter.addEventListener('change', () => this.applyFilters());
        }

        const dateFilter = document.getElementById('dateFilter');
        if (dateFilter) {
            dateFilter.addEventListener('change', () => this.applyFilters());
        }

        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        if (prevBtn) prevBtn.addEventListener('click', () => { this.currentPage--; this.renderTable(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { this.currentPage++; this.renderTable(); });
    }

    applyFilters() {
        const searchVal = (document.getElementById('transactionSearch')?.value || '').toLowerCase().trim();
        const typeVal = (document.getElementById('transactionTypeFilter')?.value || '');
        const dateVal = document.getElementById('dateFilter')?.value || '';

        this.filteredTransactions = this.allTransactions.filter(tx => {
            let show = true;

            if (searchVal) {
                const text = `${tx.product_name} ${tx.product_desc || ''} ${tx.admin || ''}`.toLowerCase();
                show = show && text.includes(searchVal);
            }

            if (typeVal) {
                show = show && tx.type === typeVal;
            }

            if (dateVal) {
                const txDate = new Date(tx.date).toISOString().slice(0, 10);
                show = show && txDate === dateVal;
            }

            return show;
        });

        this.currentPage = 1;
        this.renderTable();
    }

    renderTable() {
        if (!this.tableBody) return;
        this.tableBody.innerHTML = '';

        const totalPages = Math.max(1, Math.ceil(this.filteredTransactions.length / this.perPage));
        if (this.currentPage > totalPages) this.currentPage = totalPages;
        if (this.currentPage < 1) this.currentPage = 1;

        const start = (this.currentPage - 1) * this.perPage;
        const pageData = this.filteredTransactions.slice(start, start + this.perPage);

        if (pageData.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="7" style="text-align:center; padding:40px; color:var(--text-muted);">Tidak ada transaksi ditemukan</td>';
            this.tableBody.appendChild(tr);
        } else {
            pageData.forEach(tx => {
                const badgeClass = tx.type === 'in' ? 'masuk' : 'keluar';
                const badgeText = tx.type === 'in' ? 'Masuk' : 'Keluar';
                const dateStr = new Date(tx.date).toLocaleString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>STK-${String(tx.id).padStart(4, '0')}</td>
                    <td>
                        <div class="product-info">
                            <div class="product-name">${tx.product_name}</div>
                            <div class="product-desc">${tx.product_desc || ''}</div>
                        </div>
                    </td>
                    <td><span class="transaction-badge ${badgeClass}">${badgeText}</span></td>
                    <td class="text-center">${tx.quantity}</td>
                    <td>${dateStr}</td>
                    <td>${tx.admin || 'Admin User'}</td>
                    <td><span class="status-badge completed">Selesai</span></td>
                `;
                this.tableBody.appendChild(tr);
            });
        }

        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const pageInfo = document.getElementById('paginationInfo');

        if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
        if (nextBtn) nextBtn.disabled = this.currentPage >= totalPages;
        if (pageInfo) pageInfo.textContent = `Halaman ${this.currentPage} dari ${totalPages}`;
    }
}

class DashboardStatsManager {
    constructor() {
        this.stockChart = null;
        this.init();
    }

    async init() {
        if (!document.getElementById('statTotalSku')) return;
        try {
            const response = await fetch('/api/dashboard-stats');
            const result = await response.json();
            if (result.success) {
                this.populate(result.data);
            }
        } catch (error) {
            // Silently fail for dashboard
        }
    }

    formatCurrencyShort(value) {
        if (value >= 1000000000) return 'Rp ' + (value / 1000000000).toFixed(1) + 'B';
        if (value >= 1000000) return 'Rp ' + (value / 1000000).toFixed(1) + 'M';
        if (value >= 1000) return 'Rp ' + (value / 1000).toFixed(0) + 'K';
        return 'Rp ' + value.toLocaleString('id-ID');
    }

    populate(data) {
        const el = (id) => document.getElementById(id);

        const skuEl = el('statTotalSku');
        if (skuEl) skuEl.textContent = data.totalSku.toLocaleString('id-ID');

        const valEl = el('statNilaiStok');
        if (valEl) valEl.textContent = this.formatCurrencyShort(data.stockValue);

        const lowEl = el('statStokMenipis');
        if (lowEl) lowEl.textContent = data.lowStock;

        const turnEl = el('statPerputaran');
        if (turnEl) turnEl.textContent = data.turnover + '%';

        const soldEl = el('statDailySold');
        if (soldEl) soldEl.textContent = data.dailySold;

        const revEl = el('statDailyRevenue');
        if (revEl) revEl.textContent = this.formatCurrencyShort(data.dailyRevenue);

        const ordEl = el('statDailyOrders');
        if (ordEl) ordEl.textContent = data.dailyOrders;

        this.renderAlerts(data.alerts);
        this.renderChart(data.chartLabels, data.chartIn, data.chartOut);
    }

    renderAlerts(alerts) {
        const container = document.getElementById('alertsList');
        if (!container) return;

        if (!alerts || alerts.length === 0) {
            container.innerHTML = `
                <div class="alert-item info">
                    <div class="alert-icon"><i class="fas fa-check-circle"></i></div>
                    <div class="alert-content">
                        <div class="alert-title">Semua stok dalam kondisi aman</div>
                        <div class="alert-time">Baru saja</div>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = alerts.map(a => {
            const isCritical = a.status === 'kritis';
            const alertClass = isCritical ? 'critical' : 'warning';
            const icon = isCritical ? 'fa-exclamation-triangle' : 'fa-exclamation-circle';
            const msg = isCritical
                ? `Stok ${a.name} kritis (sisa ${a.stock})`
                : `${a.name} mendekati stok minimum (sisa ${a.stock})`;
            return `
                <div class="alert-item ${alertClass}">
                    <div class="alert-icon"><i class="fas ${icon}"></i></div>
                    <div class="alert-content">
                        <div class="alert-title">${msg}</div>
                        <div class="alert-time">Real-time</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderChart(labels, dataIn, dataOut) {
        const canvas = document.getElementById('stockChart');
        if (!canvas) return;

        if (this.stockChart) {
            this.stockChart.destroy();
        }

        this.stockChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Stok Masuk',
                        data: dataIn,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 3,
                        pointBackgroundColor: '#10b981'
                    },
                    {
                        label: 'Stok Keluar',
                        data: dataOut,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 3,
                        pointBackgroundColor: '#ef4444'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: { color: '#94a3b8', font: { size: 11 }, boxWidth: 12 }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#64748b' },
                        grid: { color: 'rgba(148,163,184,0.1)' }
                    },
                    y: {
                        ticks: { color: '#64748b' },
                        grid: { color: 'rgba(148,163,184,0.1)' }
                    }
                }
            }
        });
    }
}