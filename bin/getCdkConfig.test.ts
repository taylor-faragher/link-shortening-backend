import * as fs from 'fs';
import {getCdkConfig} from './getCdkConfig';

jest.mock('fs');

describe('getCdkConfig', () => {
    const mockConfig = {key: 'value'};

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should parse and return the JSON content when the file exists', () => {
        const env = 'dev';
        const mockJson = JSON.stringify(mockConfig);
        jest.spyOn(fs, 'existsSync').mockReturnValue(true);
        jest.spyOn(fs, 'readFileSync').mockReturnValue(mockJson);

        const config = getCdkConfig(env);

        expect(fs.existsSync).toHaveBeenCalledWith(`bin/config/${env}.config.json`);
        expect(fs.readFileSync).toHaveBeenCalledWith(`bin/config/${env}.config.json`, 'utf8');
        expect(config).toEqual(mockConfig);
    });

    it('should log an error and exit if the config file does not exist', () => {
        const env = 'someEnv';
        jest.spyOn(fs, 'existsSync').mockReturnValue(false);
        const logSpy = jest.spyOn(console, 'error').mockImplementation();
        const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

        getCdkConfig(env);

        expect(fs.existsSync).toHaveBeenCalledWith(`bin/config/${env}.config.json`);
        expect(logSpy).toHaveBeenCalledWith(`Config file for environment '${env}' does not exist.`);
        expect(exitSpy).toHaveBeenCalledWith(1);

        logSpy.mockRestore();
        exitSpy.mockRestore();
    });

    it('should throw an error if the config file contains invalid JSON', () => {
        const env = 'dev';
        const invalidJson = '{ key: "value"'; // invalid JSON
        jest.spyOn(fs, 'existsSync').mockReturnValue(true);
        jest.spyOn(fs, 'readFileSync').mockReturnValue(invalidJson);

        expect(() => getCdkConfig(env)).toThrow(SyntaxError);

        expect(fs.existsSync).toHaveBeenCalledWith(`bin/config/${env}.config.json`);
        expect(fs.readFileSync).toHaveBeenCalledWith(`bin/config/${env}.config.json`, 'utf8');
    });
});
