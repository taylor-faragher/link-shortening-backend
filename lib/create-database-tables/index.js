/* eslint-disable @typescript-eslint/no-var-requires */
const AWS = require('aws-sdk');
const fs = require('fs');
const pg = require('pg');

const secrets = new AWS.SecretsManager({});

exports.handler = async event => {
    const {config} = event.params;

    const {password, username, host, dbname} = await getSecretValue(config.SecretId);

    const pool = new pg.Pool({
        user: username,
        password: password,
        host: host,
        port: 5432,
        database: dbname,
        ssl: false,
    });

    console.log('Created Connection. Starting table creation...');

    try {
        const sqlScript = fs.readFileSync(`./scripts/createTables.sql`).toString();
        const res = await pool.query(`${sqlScript}`);

        return {
            status: 'OK',
            results: res,
        };
    } catch (err) {
        return {
            status: 'ERROR',
            err,
            message: err.message,
        };
    }
};

function getSecretValue(secretId) {
    return new Promise((resolve, reject) => {
        secrets.getSecretValue({SecretId: secretId}, (err, data) => {
            if (err) return reject(err);
            return resolve(JSON.parse(data.SecretString));
        });
    });
}
