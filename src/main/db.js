const models = require('./db/models');
const customerRepo = require('./db/customerRepository');
const kpiRepo = require('./db/kpiRepository');
const authRepo = require('./db/authRepository');

module.exports = {
  init: models.init,
  getDb: models.getDb,
  ...customerRepo,
  ...kpiRepo,
  ...authRepo
};
