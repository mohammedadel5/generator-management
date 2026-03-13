const { getDb } = require('./models');

const getKpis = () => {
  return new Promise((resolve, reject) => {
    const db = getDb();
    const query = `
      SELECT 
        COUNT(*) as total_customers,
        SUM(CASE WHEN status = 'paid' THEN total_price ELSE 0 END) as total_paid,
        SUM(CASE WHEN status = 'unpaid' THEN total_price ELSE 0 END) as total_unpaid,
        SUM(total_price) as total_revenue
      FROM customers
    `;
    db.get(query, [], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

module.exports = {
  getKpis
};
