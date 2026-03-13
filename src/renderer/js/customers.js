import { formatCurrency } from './ui-utils.js';

export const renderCustomerRows = (customers, container) => {
    if (!container) return;
    if (!customers || customers.length === 0) {
        container.innerHTML = '<tr><td colspan="6" style="text-align:center;">لا يوجد مشتركين</td></tr>';
        return;
    }
    
    container.innerHTML = customers.map(c => `
        <tr>
            <td>${c.name}</td>
            <td>${c.phone}</td>
            <td>${c.num_ampers}</td>
            <td>${formatCurrency(c.total_price)}</td>
            <td><span class="status-badge status-${c.status}">${c.status === 'paid' ? 'واصل' : 'غير واصل'}</span></td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="window.toggleStatus(${c.id}, '${c.status}')">
                    ${c.status === 'paid' ? 'إلغاء الوصل' : 'تأكيد الوصل'}
                </button>
                <button class="btn btn-secondary btn-sm btn-edit" onclick="window.editCustomer(${c.id})">تعديل</button>
                <button class="btn btn-primary btn-sm btn-delete" style="background-color: #ef4444;" onclick="window.deleteCustomer(${c.id})">حذف</button>
                ${c.status === 'paid' ? `<button class="btn btn-primary btn-sm" onclick="window.printReceiptById(${c.id})">طباعة</button>` : ''}
            </td>
        </tr>
    `).join('');
};

export const handleSearch = (query, allCustomers, container) => {
    const filtered = allCustomers.filter(c => 
        c.name.toLowerCase().includes(query.toLowerCase()) || 
        c.phone.includes(query)
    );
    renderCustomerRows(filtered, container);
};
