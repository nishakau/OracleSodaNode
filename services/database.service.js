const oracledb = require('oracledb');
const oracleConfig = require('../config/db.conf');


async function initialize() {
    oracledb.autoCommit = false;
    const pool = await oracledb.createPool(oracleConfig.cvgData);
}

module.exports.initialize = initialize;

async function close() {
    await oracledb.getPool().close();
}

module.exports.close = close;

