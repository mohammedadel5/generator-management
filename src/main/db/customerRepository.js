const { getDb } = require('./models');

const addCustomer = (customer) => {
  return new Promise((resolve, reject) => {
    const db = getDb();
    const { name, phone, amper_price, num_ampers, total_price, status } = customer;
    db.run(
      `INSERT INTO customers (name, phone, amper_price, num_ampers, total_price, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, phone, amper_price, num_ampers, total_price, status],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...customer });
      }
    );
  });
};

const getCustomers = (status) => {
  return new Promise((resolve, reject) => {
    const db = getDb();
    let query = `SELECT * FROM customers ORDER BY created_at DESC`;
    let params = [];
    if (status) {
      query = `SELECT * FROM customers WHERE status = ? ORDER BY created_at DESC`;
      params = [status];
    }
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const updateCustomer = (id, customer) => {
  return new Promise((resolve, reject) => {
    const db = getDb();
    const { name, phone, amper_price, num_ampers, total_price, status } = customer;
    db.run(
      `UPDATE customers SET name = ?, phone = ?, amper_price = ?, num_ampers = ?, total_price = ?, status = ? WHERE id = ?`,
      [name, phone, amper_price, num_ampers, total_price, status, id],
      function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      }
    );
  });
};

const deleteCustomer = (id) => {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.run(`DELETE FROM customers WHERE id = ?`, [id], function (err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
};

const updateCustomerStatus = (id, status) => {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.run(
      `UPDATE customers SET status = ? WHERE id = ?`,
      [status, id],
      function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      }
    );
  });
};

module.exports = {
  addCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer,
  updateCustomerStatus
};
