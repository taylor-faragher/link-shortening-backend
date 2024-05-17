import * as fs from 'fs';

export const getCdkConfig = (env: string) => {
    const configPath = `bin/config/${env}.config.json`;

    if (!fs.existsSync(configPath)) {
        console.error(`Config file for environment '${env}' does not exist.`);
        process.exit(1);
    }

    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
};
