import {Client, connect} from 'ts-postgres';
import {getSecretValue} from '../utils/getSecretValue';

export const getDBClient = async (): Promise<Client> => {
    const {password, username, host, dbname} = await getSecretValue('LinkShortenerMasterSecret');

    const client = await connect({
        user: username,
        host: host,
        database: dbname,
        password: password,
    });

    return client;
};
