/* eslint-disable @typescript-eslint/no-var-requires */
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql');

const secrets = new AWS.SecretsManager({});

exports.handler = async event => {
    try {
        console.log('event: ', event);
        // const {config} = event.params;
        const {password, username, host, dbname} = await getSecretValue('db-master-user-secret');

        const connection = mysql.createConnection({
            host: host,
            user: username,
            password: password,
            multipleStatements: true,
            database: dbname,
        });

        connection.connect();

        const sqlScript = fs.readFileSync(path.join(__dirname, './scripts/createLinkTable.sql').toString());
        const res = await query(connection, sqlScript);
        console.log('Response: ', res);

        connection.end();

        return {
            status: 'OK',
            results: res,
        };
    } catch (err) {
        console.log('Error: ', err);
        return {
            status: 'ERROR',
            err,
            message: err.message,
        };
    }
};

function query(client, sql) {
    return new Promise((resolve, reject) => {
        client.query(sql, [], (error, res) => {
            if (error) return reject(error);
            return resolve(res);
        });
    });
}

function getSecretValue(secretId) {
    return new Promise((resolve, reject) => {
        secrets.getSecretValue({SecretId: secretId}, (err, data) => {
            if (err) return reject(err);
            return resolve(JSON.parse(data.SecretString));
        });
    });
}
