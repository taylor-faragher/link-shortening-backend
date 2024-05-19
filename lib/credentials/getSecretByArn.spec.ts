import {Secret} from 'aws-cdk-lib/aws-secretsmanager';
import {Construct} from 'constructs';
import {getSecretByArn} from './getSecretByArn';

jest.mock('aws-cdk-lib/aws-secretsmanager', () => {
    const actualSecretsManager = jest.requireActual('aws-cdk-lib/aws-secretsmanager');
    return {
        ...actualSecretsManager,
        Secret: {
            ...actualSecretsManager.Secret,
            fromSecretAttributes: jest.fn(),
        },
    };
});

describe('getSecretByArn', () => {
    it('should retrieve and decode the secret value by ARN', () => {
        const mockUnsafeUnwrap = jest
            .fn()
            .mockReturnValue({toString: jest.fn().mockReturnValue('decoded-secret-value')});
        const mockSecretValueFromJson = jest.fn().mockReturnValue({unsafeUnwrap: mockUnsafeUnwrap});
        const mockFromSecretAttributes = Secret.fromSecretAttributes as jest.Mock;

        mockFromSecretAttributes.mockReturnValue({secretValueFromJson: mockSecretValueFromJson});

        const mockParent = {} as Construct; // as Construct just for typing, normally you would pass a real construct instance
        const secretValue = getSecretByArn(mockParent, 'my-secret-id', {
            secretCompleteArn: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:mySecret',
        });

        expect(Secret.fromSecretAttributes).toHaveBeenCalledWith(mockParent, 'my-secret-id', {
            secretCompleteArn: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:mySecret',
        });
        expect(mockSecretValueFromJson).toHaveBeenCalledWith('my-secret-id');
        expect(mockUnsafeUnwrap).toHaveBeenCalled();
        expect(secretValue).toEqual('decoded-secret-value');
    });
});
