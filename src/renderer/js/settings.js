export const initSettings = async () => {
    const adminForm = document.getElementById('admin-settings-form');
    const operatorForm = document.getElementById('operator-settings-form');
    
    const adminUsernameInput = document.getElementById('admin-new-username');
    const adminPasswordInput = document.getElementById('admin-new-password');
    const operatorUsernameInput = document.getElementById('operator-new-username');
    const operatorPasswordInput = document.getElementById('operator-new-password');

    // Load current usernames
    const loadCurrentData = async () => {
        try {
            const admin = await window.api.getUserByRole('admin');
            const operator = await window.api.getUserByRole('operator');

            if (admin) adminUsernameInput.value = admin.username;
            if (operator) operatorUsernameInput.value = operator.username;
        } catch (err) {
            console.error('Failed to load settings data:', err);
        }
    };

    if (adminForm) {
        adminForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = adminUsernameInput.value;
            const password = adminPasswordInput.value;

            if (confirm('هل أنت متأكد من تغيير بيانات المسؤول؟ سيتم تسجيل خروجك بعد العملية.')) {
                try {
                    const success = await window.api.updateCredentials('admin', username, password);
                    if (success) {
                        alert('تم تحديث بيانات المسؤول بنجاح. سيتم الآن تسجيل الخروج.');
                        localStorage.removeItem('currentUser');
                        window.location.reload();
                    }
                } catch (err) {
                    alert('فشل في تحديث البيانات: ' + err.message);
                }
            }
        });
    }

    if (operatorForm) {
        operatorForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = operatorUsernameInput.value;
            const password = operatorPasswordInput.value;

            if (confirm('هل أنت متأكد من تغيير بيانات المشغل؟')) {
                try {
                    const success = await window.api.updateCredentials('operator', username, password);
                    if (success) {
                        alert('تم تحديث بيانات المشغل بنجاح.');
                        operatorPasswordInput.value = '';
                    }
                } catch (err) {
                    alert('فشل في تحديث البيانات: ' + err.message);
                }
            }
        });
    }

    // Call load data whenever the view might become visible or on init
    await loadCurrentData();
};
