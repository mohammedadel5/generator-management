const { getDb } = require('./models');

const login = (username, password) => {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.get(
      "SELECT id, username, role FROM users WHERE username = ? AND password = ?",
      [username, password],
      (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      }
    );
  });
};

const changePassword = (userId, newPassword) => {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.run(
      "UPDATE users SET password = ? WHERE id = ?",
      [newPassword, userId],
      function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      }
    );
  });
};

const updateCredentials = (role, newUsername, newPassword) => {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.run(
      "UPDATE users SET username = ?, password = ? WHERE role = ?",
      [newUsername, newPassword, role],
      function (err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
      }
    );
  });
};

const getUserByRole = (role) => {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.get(
      "SELECT username FROM users WHERE role = ?",
      [role],
      (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      }
    );
  });
};

module.exports = {
  login,
  changePassword,
  updateCredentials,
  getUserByRole
};
