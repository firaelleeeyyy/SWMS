// JavaScript Dashboard Admin
document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi dashboard
    initializeDashboard();
    initializeCharts();
    setupEventListeners();
});

function initializeDashboard() {
    // Tambahkan animasi loading
    const cards = document.querySelectorAll('.stat-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });

    // Initialize page-specific functionality
    if (document.getElementById('inventoryTableBody')) {
        initializeInventory();
    } else if (document.getElementById('stockInForm')) {
        initializeStockManagement();
    } else if (document.getElementById('accountForm')) {
        initializeSettings();
    }
}

function initializeInventory() {
    if (!document.getElementById('inventoryTableBody')) return;

    // Initialize inventory functionality
    setupSearchFilter();
    setupModals();
    setupActionButtons();
    setupPagination();
}

function setupSearchFilter() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');

    if (searchInput) {
        searchInput.addEventListener('input', filterInventory);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterInventory);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', filterInventory);
    }
}

function filterInventory() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';

    const rows = document.querySelectorAll('#inventoryTableBody tr');

    rows.forEach(row => {
        const productName = row.querySelector('.product-name')?.textContent.toLowerCase() || '';
        const category = row.querySelector('td:nth-child(3)')?.textContent.toLowerCase() || '';
        const statusBadge = row.querySelector('.status-badge')?.classList.contains(statusFilter) || statusFilter === '';

        const matchesSearch = productName.includes(searchTerm);
        const matchesCategory = categoryFilter === '' || category.includes(categoryFilter.toLowerCase());
        const matchesStatus = statusFilter === '' || statusBadge;

        if (matchesSearch && matchesCategory && matchesStatus) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function setupModals() {
    const addProductBtn = document.getElementById('addProductBtn');
    const productModal = document.getElementById('productModal');
    const deleteModal = document.getElementById('deleteModal');
    const modalClose = document.getElementById('modalClose');
    const deleteModalClose = document.getElementById('deleteModalClose');
    const cancelBtn = document.getElementById('cancelBtn');
    const deleteCancelBtn = document.getElementById('deleteCancelBtn');
    const productForm = document.getElementById('productForm');

    // Open add product modal
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            document.getElementById('modalTitle').textContent = 'Tambah Produk';
            productForm.reset();
            productModal.classList.add('show');
        });
    }

    // Close modals
    [modalClose, cancelBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                productModal.classList.remove('show');
            });
        }
    });

    [deleteModalClose, deleteCancelBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                deleteModal.classList.remove('show');
            });
        }
    });

    // Close modal when clicking outside
    [productModal, deleteModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        }
    });

    // Form submission
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }
}

function setupActionButtons() {
    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.id;
            openEditModal(productId);
        });
    });

    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.id;
            openDeleteModal(productId);
        });
    });
}

function openEditModal(productId) {
    // Find the row with the product ID
    const row = document.querySelector(`[data-id="${productId}"]`)?.closest('tr');
    if (!row) return;

    // Populate form with existing data
    const productName = row.querySelector('.product-name').textContent;
    const sku = row.querySelector('td:nth-child(2)').textContent;
    const category = row.querySelector('td:nth-child(3)').textContent;
    const stock = row.querySelector('td:nth-child(4)').textContent;
    const priceText = row.querySelector('td:nth-child(5)').textContent;
    const price = priceText.replace(/[^\d]/g, '');

    document.getElementById('productName').value = productName;
    document.getElementById('productSKU').value = sku;
    document.getElementById('productCategory').value = category.toLowerCase();
    document.getElementById('productStock').value = stock;
    document.getElementById('productPrice').value = price;

    document.getElementById('modalTitle').textContent = 'Edit Produk';
    document.getElementById('productModal').classList.add('show');
}

function openDeleteModal(productId) {
    document.getElementById('deleteModal').classList.add('show');

    const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');
    const newConfirmBtn = deleteConfirmBtn.cloneNode(true);
    deleteConfirmBtn.parentNode.replaceChild(newConfirmBtn, deleteConfirmBtn);

    newConfirmBtn.addEventListener('click', () => {
        deleteProduct(productId);
        document.getElementById('deleteModal').classList.remove('show');
    });
}

function handleProductSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const productData = {
        name: formData.get('productName'),
        sku: formData.get('productSKU'),
        category: formData.get('productCategory'),
        price: formData.get('productPrice'),
        stock: formData.get('productStock'),
        image: formData.get('productImage')
    };

    // Here you would typically send the data to your backend
    console.log('Product data:', productData);

    // Show success message (you can implement a toast notification)
    alert('Produk berhasil disimpan!');

    // Close modal and reset form
    document.getElementById('productModal').classList.remove('show');
    e.target.reset();

    // In a real application, you would refresh the table data here
}

function deleteProduct(productId) {
    // Here you would typically send a delete request to your backend
    console.log('Deleting product:', productId);

    // Show success message
    alert('Produk berhasil dihapus!');

    // In a real application, you would remove the row from the table here
}

function setupPagination() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            // Handle previous page logic
            console.log('Previous page');
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            // Handle next page logic
            console.log('Next page');
        });
    }
}

/* ===========================================
   STOCK MANAGEMENT FUNCTIONS
   =========================================== */

function initializeStockManagement() {
    if (!document.getElementById('stockInForm')) return;

    // Initialize stock management functionality
    setupStockForms();
    setupTransactionFilters();
    setupPagination();
}

function setupStockForms() {
    const stockInForm = document.getElementById('stockInForm');
    const stockOutForm = document.getElementById('stockOutForm');

    if (stockInForm) {
        stockInForm.addEventListener('submit', handleStockInSubmit);
    }

    if (stockOutForm) {
        stockOutForm.addEventListener('submit', handleStockOutSubmit);
    }
}

function handleStockInSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const stockData = {
        product: formData.get('product'),
        quantity: formData.get('quantity'),
        supplier: formData.get('supplier'),
        notes: formData.get('notes'),
        type: 'masuk',
        timestamp: new Date().toISOString()
    };

    // Here you would typically send the data to your backend
    console.log('Stock In:', stockData);

    // Show success message
    alert('Barang masuk berhasil dicatat!');

    // Reset form
    e.target.reset();

    // In a real application, you would refresh the transaction table here
}

function handleStockOutSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const stockData = {
        product: formData.get('product'),
        quantity: formData.get('quantity'),
        destination: formData.get('destination'),
        notes: formData.get('notes'),
        type: 'keluar',
        timestamp: new Date().toISOString()
    };

    // Here you would typically send the data to your backend
    console.log('Stock Out:', stockData);

    // Show success message
    alert('Barang keluar berhasil dicatat!');

    // Reset form
    e.target.reset();

    // In a real application, you would refresh the transaction table here
}

function setupTransactionFilters() {
    const searchInput = document.getElementById('transactionSearch');
    const typeFilter = document.getElementById('transactionTypeFilter');
    const dateFilter = document.getElementById('dateFilter');

    if (searchInput) {
        searchInput.addEventListener('input', filterTransactions);
    }
    if (typeFilter) {
        typeFilter.addEventListener('change', filterTransactions);
    }
    if (dateFilter) {
        dateFilter.addEventListener('change', filterTransactions);
    }
}

function filterTransactions() {
    const searchTerm = document.getElementById('transactionSearch')?.value.toLowerCase() || '';
    const typeFilter = document.getElementById('transactionTypeFilter')?.value || '';
    const dateFilter = document.getElementById('dateFilter')?.value || '';

    const rows = document.querySelectorAll('#transactionTableBody tr');

    rows.forEach(row => {
        const productName = row.querySelector('.product-name')?.textContent.toLowerCase() || '';
        const transactionType = row.querySelector('.transaction-badge')?.classList.contains(typeFilter) || typeFilter === '';
        const transactionDate = row.cells[4]?.textContent.split(' ')[0] || '';

        const matchesSearch = productName.includes(searchTerm);
        const matchesType = typeFilter === '' || transactionType;
        const matchesDate = dateFilter === '' || transactionDate === dateFilter;

        if (matchesSearch && matchesType && matchesDate) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function initializeDashboardCharts() {
    // Chart Pergerakan Stok
    const ctx = document.getElementById('stockChart').getContext('2d');
    const stockChart = new Chart(ctx, {
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
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#94A3B8'
                    }
                },
                y: {
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
}

function initializeAnalyticsCharts() {
    // Sales Chart - Line Chart
    const salesCtx = document.getElementById('salesChart').getContext('2d');
    const salesChart = new Chart(salesCtx, {
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
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#94A3B8'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#94A3B8',
                        callback: function(value) {
                            return value + ' unit';
                        }
                    }
                }
            }
        }
    });

    // Category Chart - Donut Chart
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    const categoryChart = new Chart(categoryCtx, {
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
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#94A3B8',
                        padding: 20,
                        usePointStyle: true
                    }
                }
            },
            cutout: '60%'
        }
    });

    // Stock Flow Chart - Bar Chart
    const stockFlowCtx = document.getElementById('stockFlowChart').getContext('2d');
    const stockFlowChart = new Chart(stockFlowCtx, {
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
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#94A3B8'
                    }
                },
                y: {
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
}
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#94A3B8'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#94A3B8'
                    }
                }
            },
            elements: {
                point: {
                    radius: 0,
                    hoverRadius: 6
                }
            }
        }
    });
}

function setupEventListeners() {
    // Navigasi sidebar
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            // Hapus class active dari semua item
            navItems.forEach(nav => nav.classList.remove('active'));
            // Tambah class active ke item yang diklik
            this.classList.add('active');
            // Di sini Anda bisa memuat halaman berbeda
            // Untuk saat ini, hanya update state aktif
        });
    });

    // Fungsi pencarian
    const searchInput = document.querySelector('.search-box input');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const tableRows = document.querySelectorAll('.inventory-table tbody tr');

        tableRows.forEach(row => {
            const productName = row.querySelector('.product-name').textContent.toLowerCase();
            const productDesc = row.querySelector('.product-desc').textContent.toLowerCase();
            const sku = row.cells[1].textContent.toLowerCase();
            const category = row.cells[2].textContent.toLowerCase();

            if (productName.includes(searchTerm) ||
                productDesc.includes(searchTerm) ||
                sku.includes(searchTerm) ||
                category.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    // Fungsi filter
    const filterSelect = document.querySelector('.filter-select');
    filterSelect.addEventListener('change', function() {
        const selectedCategory = this.value.toLowerCase();
        const tableRows = document.querySelectorAll('.inventory-table tbody tr');

        tableRows.forEach(row => {
            const category = row.cells[2].textContent.toLowerCase();

            if (selectedCategory === 'semua kategori' || category === selectedCategory) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    // Tombol header
    const headerBtns = document.querySelectorAll('.header-btn');
    headerBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Tambahkan animasi klik
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);

            // Handle aksi tombol berbeda
            if (this.classList.contains('logout')) {
                // Handle logout
                console.log('Logout diklik');
            } else if (this.querySelector('.fa-bell')) {
                // Handle notifikasi
                console.log('Notifikasi diklik');
            } else if (this.querySelector('.fa-user')) {
                // Handle profile
                console.log('Profile diklik');
            }
        });
    });

    // Toggle sidebar mobile (jika diperlukan)
    const sidebar = document.querySelector('.sidebar');
    let sidebarOpen = false;

    // Tambah tombol menu mobile jika layar kecil
    if (window.innerWidth <= 1200) {
        const mobileMenuBtn = document.createElement('button');
        mobileMenuBtn.className = 'header-btn mobile-menu';
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        document.querySelector('.header-left').prepend(mobileMenuBtn);

        mobileMenuBtn.addEventListener('click', function() {
            sidebarOpen = !sidebarOpen;
            if (sidebarOpen) {
                sidebar.classList.add('open');
            } else {
                sidebar.classList.remove('open');
            }
        });

        // Tutup sidebar saat klik di luar
        document.addEventListener('click', function(e) {
            if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                sidebar.classList.remove('open');
                sidebarOpen = false;
            }
        });
    }
}

// Fungsi utilitas
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

function animateNumber(element, target, duration = 1000) {
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

// Inisialisasi animasi angka saat load
document.addEventListener('DOMContentLoaded', function() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(number => {
        const target = parseInt(number.textContent.replace(/[^\d]/g, ''));
        if (!isNaN(target)) {
            animateNumber(number, target, 1500);
        }
    });
});

// Optimasi performa: Debounce input pencarian
function debounce(func, wait) {
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

// Terapkan pencarian dengan debounce
const debouncedSearch = debounce(function() {
    const searchTerm = this.value.toLowerCase();
    const tableRows = document.querySelectorAll('.inventory-table tbody tr');

    tableRows.forEach(row => {
        const productName = row.querySelector('.product-name').textContent.toLowerCase();
        const productDesc = row.querySelector('.product-desc').textContent.toLowerCase();
        const sku = row.cells[1].textContent.toLowerCase();
        const category = row.cells[2].textContent.toLowerCase();

        if (productName.includes(searchTerm) ||
            productDesc.includes(searchTerm) ||
            sku.includes(searchTerm) ||
            category.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}, 300);

document.querySelector('.search-box input').addEventListener('input', debouncedSearch);

/* ===========================================
   SETTINGS PAGE FUNCTIONS
   =========================================== */

function initializeSettings() {
    if (!document.getElementById('accountForm')) return;

    // Initialize settings functionality
    setupSettingsForms();
    setupProfileModal();
    setupToggles();
    setupSecurityActions();
}

function setupSettingsForms() {
    const accountForm = document.getElementById('accountForm');

    if (accountForm) {
        accountForm.addEventListener('submit', handleAccountSubmit);
    }
}

function handleAccountSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    // Validate password confirmation
    if (newPassword && newPassword !== confirmPassword) {
        alert('Password konfirmasi tidak cocok!');
        return;
    }

    const accountData = {
        username: formData.get('username'),
        email: formData.get('email'),
        newPassword: newPassword ? '***' : null // Don't log actual password
    };

    // Here you would typically send the data to your backend
    console.log('Account update:', accountData);

    // Show success message
    alert('Pengaturan akun berhasil disimpan!');

    // Reset password fields
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

function setupProfileModal() {
    const editProfileBtn = document.getElementById('editProfileBtn');
    const profileModal = document.getElementById('profileModal');
    const profileModalClose = document.getElementById('profileModalClose');
    const cancelProfileBtn = document.getElementById('cancelProfileBtn');
    const profileForm = document.getElementById('profileForm');

    // Open modal
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            profileModal.classList.add('show');
        });
    }

    // Close modal
    [profileModalClose, cancelProfileBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                profileModal.classList.remove('show');
            });
        }
    });

    // Close modal when clicking outside
    if (profileModal) {
        profileModal.addEventListener('click', (e) => {
            if (e.target === profileModal) {
                profileModal.classList.remove('show');
            }
        });
    }

    // Form submission
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileSubmit);
    }
}

function handleProfileSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const profileData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone')
    };

    // Update UI
    document.getElementById('adminName').textContent = profileData.name;
    document.getElementById('adminEmail').textContent = profileData.email;
    document.getElementById('adminPhone').textContent = profileData.phone;
    document.getElementById('editName').value = profileData.name;
    document.getElementById('editEmail').value = profileData.email;
    document.getElementById('editPhone').value = profileData.phone;

    // Here you would typically send the data to your backend
    console.log('Profile update:', profileData);

    // Show success message and close modal
    alert('Profile berhasil diperbarui!');
    document.getElementById('profileModal').classList.remove('show');
}

function setupToggles() {
    const toggles = document.querySelectorAll('.toggle-switch input');

    toggles.forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const setting = e.target.id;
            const value = e.target.checked;

            // Here you would typically save the preference to your backend
            console.log(`${setting}: ${value}`);

            // Show feedback
            const status = value ? 'diaktifkan' : 'dinonaktifkan';
            console.log(`Pengaturan ${setting} ${status}`);
        });
    });

    // Language selector
    const languageSelect = document.getElementById('systemLanguage');
    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            const language = e.target.value;
            console.log(`Bahasa diubah ke: ${language}`);
            // Here you would typically change the interface language
        });
    }
}

function setupSecurityActions() {
    const logoutAllBtn = document.getElementById('logoutAllBtn');
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');

    if (logoutAllBtn) {
        logoutAllBtn.addEventListener('click', () => {
            if (confirm('Apakah Anda yakin ingin logout dari semua perangkat?')) {
                // Here you would typically call your logout API
                console.log('Logging out from all devices');
                alert('Berhasil logout dari semua perangkat!');
            }
        });
    }

    if (resetPasswordBtn) {
        resetPasswordBtn.addEventListener('click', () => {
            if (confirm('Apakah Anda yakin ingin reset password? Link reset akan dikirim ke email Anda.')) {
                // Here you would typically call your password reset API
                console.log('Password reset requested');
                alert('Link reset password telah dikirim ke email Anda!');
            }
        });
    }
}