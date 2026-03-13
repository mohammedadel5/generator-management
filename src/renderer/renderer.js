import { updateKpis, renderDashboardTable } from './js/dashboard.js';
import { renderCustomerRows, handleSearch } from './js/customers.js';
import { renderUnpaidRows } from './js/unpaid.js';
import { calculateTotalPrice, showModal, hideModal } from './js/ui-utils.js';
import { checkSession, login, logout, updateUIForRole } from './js/auth.js';
import { initSettings } from './js/settings.js';

document.addEventListener('DOMContentLoaded', () => {
    // Auth Elements
    const loginContainer = document.getElementById('login-container');
    const appContainer = document.getElementById('app-container');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');

    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.content-view');
    const viewTitle = document.getElementById('view-title');
    
    // Modal & Forms
    const openAddModalBtn = document.getElementById('open-add-modal');
    const closeAddModalBtn = document.getElementById('close-add-modal');
    const addCustomerModal = document.getElementById('add-customer-modal');
    const addCustomerForm = document.getElementById('add-customer-form');
    const modalTitle = document.getElementById('modal-title');
    const customerIdInput = document.getElementById('customer-id');
    
    // Form Inputs
    const numAmpersInput = document.getElementById('num_ampers');
    const amperPriceInput = document.getElementById('amper_price');
    const totalPriceInput = document.getElementById('total_price');
    
    // Containers
    const dashboardCustomersBody = document.getElementById('dashboard-customers-body');
    const allCustomersBody = document.getElementById('all-customers-body');
    const unpaidCustomersBody = document.getElementById('unpaid-customers-body');
    const searchInput = document.getElementById('search-customers');
    
    // KPI Elements
    const kpiElements = {
        totalCustomers: document.getElementById('kpi-total-customers'),
        totalPaid: document.getElementById('kpi-total-paid'),
        totalUnpaid: document.getElementById('kpi-total-unpaid'),
        totalRevenue: document.getElementById('kpi-total-revenue')
    };

    let allCustomers = [];

    // --- License Info ---
    const updateLicenseInfo = async () => {
        const info = await window.api.getActivationInfo();
        const statusBadge = document.getElementById('license-status-badge');
        const ownerName = document.getElementById('license-owner-name');

        if (info && info.activated) {
            if (statusBadge) {
                statusBadge.textContent = 'نسخة مرخصة';
                statusBadge.classList.add('active');
            }
            if (ownerName) {
                ownerName.textContent = info.customer_name;
            }
        } else {
            if (statusBadge) {
                statusBadge.textContent = 'غير مرخص';
                statusBadge.classList.add('inactive');
            }
            if (ownerName) {
                ownerName.textContent = '---';
            }
        }
    };

    // --- Session Handling ---
    const initApp = async () => {
        const user = checkSession();
        if (user) {
            loginContainer.style.display = 'none';
            appContainer.style.display = 'flex';
            updateUIForRole(user);
            await updateLicenseInfo();
            await initSettings();
            await updateAllData();
        } else {
            loginContainer.style.display = 'flex';
            appContainer.style.display = 'none';
        }
    };

    initApp();

    // Login logic
    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            loginError.style.display = 'none';
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            
            try {
                const user = await login(username, password);
                if (user) {
                    initApp();
                } else {
                    loginError.style.display = 'block';
                }
            } catch (err) {
                loginError.style.display = 'block';
            }
        };
    }

    // Logout logic
    if (logoutBtn) {
        logoutBtn.onclick = logout;
    }

    // Navigation logic
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = item.getAttribute('data-view');
            
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            views.forEach(v => v.style.display = 'none');
            const targetView = document.getElementById(`view-${viewId}`);
            if (targetView) targetView.style.display = 'block';
            
            const titles = {
                'dashboard': 'نظرة عامة',
                'customers': 'جميع المشتركين',
                'unpaid': 'الديون والمستحقات',
                'settings': 'الإعدادات'
            };
            viewTitle.textContent = titles[viewId] || 'لوحة التحكم';
            
            updateAllData();
        });
    });

    // Modal logic
    if (openAddModalBtn) {
        openAddModalBtn.onclick = () => {
            modalTitle.textContent = 'إضافة مشترك جديد';
            addCustomerForm.reset();
            customerIdInput.value = '';
            calculateTotal();
            showModal(addCustomerModal);
        };
    }
    if (closeAddModalBtn) closeAddModalBtn.onclick = () => hideModal(addCustomerModal);
    window.onclick = (event) => {
        if (event.target == addCustomerModal) hideModal(addCustomerModal);
    };

    // Auto-calculate total price
    const calculateTotal = () => {
        totalPriceInput.value = calculateTotalPrice(numAmpersInput.value, amperPriceInput.value);
    };
    if (numAmpersInput) numAmpersInput.oninput = calculateTotal;
    if (amperPriceInput) amperPriceInput.oninput = calculateTotal;

    // Handle Search
    if (searchInput) {
        searchInput.oninput = () => {
            handleSearch(searchInput.value, allCustomers, allCustomersBody);
        };
    }

    // Handle Form Submission
    if (addCustomerForm) {
        addCustomerForm.onsubmit = async (e) => {
            e.preventDefault();
            try {
                const formData = new FormData(addCustomerForm);
                const id = formData.get('id');
                const customer = {
                    name: formData.get('name'),
                    phone: formData.get('phone'),
                    num_ampers: parseInt(formData.get('num_ampers')),
                    amper_price: parseFloat(formData.get('amper_price')),
                    total_price: parseFloat(formData.get('total_price')),
                    status: formData.get('status')
                };
                
                if (id) {
                    await window.api.updateCustomer(parseInt(id), customer);
                } else {
                    await window.api.addCustomer(customer);
                }

                addCustomerForm.reset();
                calculateTotal();
                hideModal(addCustomerModal);
                await updateAllData();
            } catch (err) {
                console.error('Error saving customer:', err);
                alert('حدث خطأ أثناء الحفظ');
            }
        };
    }

    // Update everything
    async function updateAllData() {
        try {
            allCustomers = await window.api.getCustomers();
            await updateKpis(kpiElements);
            renderDashboardTable(allCustomers.slice(0, 5), dashboardCustomersBody);
            renderCustomerRows(allCustomers, allCustomersBody);
            
            const unpaid = allCustomers.filter(c => c.status === 'unpaid');
            renderUnpaidRows(unpaid, unpaidCustomersBody);
        } catch (err) {
            console.error('Error updating data:', err);
        }
    }

    // Global action functions (bound to window for HTML event handlers)
    window.toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';
        await window.api.updateCustomerStatus(id, newStatus);
        await updateAllData();
    };

    window.editCustomer = (id) => {
        const customer = allCustomers.find(c => c.id === id);
        if (customer) {
            modalTitle.textContent = 'تعديل بيانات المشترك';
            customerIdInput.value = customer.id;
            addCustomerForm.name.value = customer.name;
            addCustomerForm.phone.value = customer.phone;
            addCustomerForm.num_ampers.value = customer.num_ampers;
            addCustomerForm.amper_price.value = customer.amper_price;
            addCustomerForm.status.value = customer.status;
            calculateTotal();
            showModal(addCustomerModal);
        }
    };

    window.deleteCustomer = async (id) => {
        if (confirm('هل أنت متأكد من حذف هذا المشترك؟')) {
            await window.api.deleteCustomer(id);
            await updateAllData();
        }
    };

    window.printReceiptById = (id) => {
        const customer = allCustomers.find(c => c.id === id);
        if (customer) {
            printReceipt(customer);
        }
    };

    const printReceipt = (customer) => {
        try {
            document.getElementById('receipt-name').textContent = customer.name;
            document.getElementById('receipt-phone').textContent = customer.phone;
            document.getElementById('receipt-ampers').textContent = customer.num_ampers;
            document.getElementById('receipt-price').textContent = (customer.amper_price || 0).toLocaleString();
            document.getElementById('receipt-total-calc').textContent = (customer.total_price || 0).toLocaleString();
            document.getElementById('receipt-total').textContent = (customer.total_price || 0).toLocaleString();
            document.getElementById('receipt-date').textContent = new Date().toLocaleDateString('ar-IQ');
            
            setTimeout(() => {
                window.api.print();
            }, 100);
        } catch (err) {
            console.error('Error printing receipt:', err);
        }
    };
});
