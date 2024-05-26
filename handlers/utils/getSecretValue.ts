import {SecretsManager} from '@aws-sdk/client-secrets-manager';

const secrets = new SecretsManager({});

export const getSecretValue = async secret => {
    const data = await secrets.getSecretValue({SecretId: secret});
    return JSON.parse(data.SecretString as string);
};
