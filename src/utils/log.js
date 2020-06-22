const moment = require('moment')

logger = (msg) => {
    console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${msg}`);
  };

module.exports = logger