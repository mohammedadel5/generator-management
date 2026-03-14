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

    // Report Elements
    const reportMonthSelector = document.getElementById('report-month-selector');
    const btnPrintReport = document.getElementById('btn-print-report');
    const btnManualReset = document.getElementById('btn-manual-reset');
    
    // Set default report month to current month YYYY-MM
    if (reportMonthSelector) {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        reportMonthSelector.value = `${yyyy}-${mm}`;
    }

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
            
            // Default to customers view for operators
            if (user.role !== 'admin') {
                const customersNavItem = document.querySelector('.nav-item[data-view="customers"]');
                if (customersNavItem) customersNavItem.click();
            }
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
                'reports': 'التقارير',
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
            // Default to today
            document.getElementById('subscription_date').valueAsDate = new Date();
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
                    status: formData.get('status'),
                    subscription_date: formData.get('subscription_date')
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
            
            updateReports();
        } catch (err) {
            console.error('Error updating data:', err);
        }
    }

    // Reports Logic
    const updateReports = () => {
        if (!reportMonthSelector) return;
        
        const selectedMonth = reportMonthSelector.value; // Format: "YYYY-MM"
        if (!selectedMonth) return;

        // Filter customers who have a subscription_date starting with the selected YYYY-MM
        const filteredCustomers = allCustomers.filter(c => {
            if (!c.subscription_date) return false;
            return c.subscription_date.startsWith(selectedMonth);
        });

        const totalCust = filteredCustomers.length;
        let paid = 0;
        let unpaid = 0;

        filteredCustomers.forEach(c => {
            if (c.status === 'paid') paid += (c.total_price || 0);
            if (c.status === 'unpaid') unpaid += (c.total_price || 0);
        });

        const revenue = paid + unpaid;

        document.getElementById('report-total-customers').textContent = totalCust;
        document.getElementById('report-total-paid').textContent = paid.toLocaleString() + ' د.ع';
        document.getElementById('report-total-unpaid').textContent = unpaid.toLocaleString() + ' د.ع';
        document.getElementById('report-total-revenue').textContent = revenue.toLocaleString() + ' د.ع';
    };

    if (reportMonthSelector) {
        reportMonthSelector.addEventListener('change', updateReports);
    }

    if (btnPrintReport) {
        btnPrintReport.addEventListener('click', () => {
            const selectedMonth = reportMonthSelector.value; // "YYYY-MM"
            if (!selectedMonth) return;

            const printContainer = document.getElementById('report-print-container');
            const receiptContainer = document.getElementById('receipt-container');
            
            // Hide normal receipt, show report
            if (receiptContainer) receiptContainer.style.display = 'none';
            if (printContainer) printContainer.style.display = 'block';

            // Populate report print fields
            const ownerNameEl = document.getElementById('license-owner-name');
            const ownerName = ownerNameEl ? ownerNameEl.textContent : '';
            const reportOwnerEl = document.getElementById('print-report-owner');
            if (reportOwnerEl) {
                reportOwnerEl.textContent = ownerName !== 'جاري التحميل...' && ownerName !== '---' ? ownerName : '';
            }

            document.getElementById('print-report-date').textContent = new Date().toLocaleDateString('ar-IQ');
            document.getElementById('print-report-month').textContent = selectedMonth;
            
            document.getElementById('print-report-customers').textContent = document.getElementById('report-total-customers').textContent;
            document.getElementById('print-report-paid').textContent = document.getElementById('report-total-paid').textContent;
            document.getElementById('print-report-unpaid').textContent = document.getElementById('report-total-unpaid').textContent;
            document.getElementById('print-report-revenue').textContent = document.getElementById('report-total-revenue').textContent;

            setTimeout(() => {
                window.api.print();
                
                // Restore visibility
                setTimeout(() => {
                    if (receiptContainer) receiptContainer.style.display = '';
                    if (printContainer) printContainer.style.display = '';
                }, 1000);
            }, 100);
        });
    }

    if (btnManualReset) {
        btnManualReset.addEventListener('click', async () => {
            if (confirm('تحذير: هل أنت متأكد من تصفير جميع المشتركين الـ "واصل" إلى "غير واصل"؟ لا يمكن التراجع عن هذه العملية.')) {
                try {
                    await window.api.manualReset();
                    await updateAllData();
                    alert('تمت عملية التصغير بنجاح');
                } catch (err) {
                    console.error('Error in manual reset:', err);
                    alert('حدث خطأ أثناء عملية التصفير');
                }
            }
        });
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
            
            // Set date if available
            if (customer.subscription_date) {
                document.getElementById('subscription_date').value = customer.subscription_date;
            } else {
                document.getElementById('subscription_date').valueAsDate = new Date();
            }

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
            const printContainer = document.getElementById('report-print-container');
            const receiptContainer = document.getElementById('receipt-container');
            
            // Hide report, show normal receipt
            if (printContainer) printContainer.style.display = 'none';
            if (receiptContainer) receiptContainer.style.display = 'block';

            const ownerNameEl = document.getElementById('license-owner-name');
            const ownerName = ownerNameEl ? ownerNameEl.textContent : '';
            const receiptOwnerEl = document.getElementById('receipt-generator-owner');
            if (receiptOwnerEl) {
                receiptOwnerEl.textContent = ownerName !== 'جاري التحميل...' && ownerName !== '---' ? ownerName : '';
            }

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
