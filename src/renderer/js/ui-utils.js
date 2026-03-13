// Shared UI Helpers
export const formatCurrency = (amount) => {
    return `${(amount || 0).toLocaleString()} د.ع`;
};

export const showModal = (modal) => {
    modal.classList.add('active');
};

export const hideModal = (modal) => {
    modal.classList.remove('active');
};

export const calculateTotalPrice = (ampers, price) => {
    return (parseFloat(ampers) || 0) * (parseFloat(price) || 0);
};
