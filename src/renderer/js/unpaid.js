import { formatCurrency } from './ui-utils.js';

export const renderUnpaidRows = (customers, container) => {
    if (!container) return;
    if (!customers || customers.length === 0) {
        container.innerHTML = '<tr><td colspan="4" style="text-align:center;">لا يوجد ديون</td></tr>';
        return;
    }
    
    container.innerHTML = customers.map(c => `
        <tr>
            <td>${c.name}</td>
            <td>${c.phone}</td>
            <td>${formatCurrency(c.total_price)}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="window.toggleStatus(${c.id}, 'unpaid')">تأكيد دفع</button>
            </td>
        </tr>
    `).join('');
};
