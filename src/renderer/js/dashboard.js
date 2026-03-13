import { formatCurrency } from './ui-utils.js';

export const updateKpis = async (kpiElements) => {
    try {
        const kpis = await window.api.getKpis();
        const { totalCustomers, totalPaid, totalUnpaid, totalRevenue } = kpiElements;
        
        if (totalCustomers) totalCustomers.textContent = kpis.total_customers || 0;
        if (totalPaid) totalPaid.textContent = formatCurrency(kpis.total_paid);
        if (totalUnpaid) totalUnpaid.textContent = formatCurrency(kpis.total_unpaid);
        if (totalRevenue) totalRevenue.textContent = formatCurrency(kpis.total_revenue);
    } catch (err) {
        console.error('Error updating KPIs:', err);
    }
};

export const renderDashboardTable = (customers, container) => {
    if (!container) return;
    if (!customers || customers.length === 0) {
        container.innerHTML = '<tr><td colspan="5" style="text-align:center;">لا يوجد مشتركين</td></tr>';
        return;
    }
    
    container.innerHTML = customers.map(c => `
        <tr>
            <td>${c.name}</td>
            <td>${c.phone}</td>
            <td>${c.num_ampers}</td>
            <td>${formatCurrency(c.total_price)}</td>
            <td><span class="status-badge status-${c.status}">${c.status === 'paid' ? 'واصل' : 'غير واصل'}</span></td>
        </tr>
    `).join('');
};
