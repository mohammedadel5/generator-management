export const checkSession = () => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    return user;
};

export const login = async (username, password) => {
    try {
        const user = await window.api.login(username, password);
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            return user;
        }
        return null;
    } catch (err) {
        console.error('Login error:', err);
        throw err;
    }
};

export const logout = () => {
    localStorage.removeItem('currentUser');
    window.location.reload();
};

export const updateUIForRole = (user) => {
    const addModalBtn = document.getElementById('open-add-modal');
    const settingsNavItem = document.querySelector('.nav-item[data-view="settings"]');
    const deleteBtns = document.querySelectorAll('.btn-delete');
    const usernameEl = document.getElementById('current-username');
    const roleEl = document.getElementById('current-user-role');
    const avatarEl = document.getElementById('current-user-avatar');

    if (usernameEl) usernameEl.textContent = user.username;
    if (roleEl) roleEl.textContent = user.role === 'admin' ? 'مسؤول (Admin)' : 'مشغل (Operator)';
    if (avatarEl) avatarEl.textContent = user.username[0].toUpperCase();

    // Role-based restrictions
    const dashboardNavItem = document.querySelector('.nav-item[data-view="dashboard"]');
    if (user.role !== 'admin') {
        // Operators CAN add, but NOT edit/delete
        if (addModalBtn) addModalBtn.style.display = 'block'; 
        if (settingsNavItem) settingsNavItem.style.display = 'none';
        if (dashboardNavItem) dashboardNavItem.style.display = 'none';
        document.body.classList.add('role-operator');
    } else {
        if (settingsNavItem) settingsNavItem.style.display = 'flex';
        if (dashboardNavItem) dashboardNavItem.style.display = 'flex';
        document.body.classList.remove('role-operator');
    }
};
