https://github.com/aws-samples/amazon-rds-init-cdk/blob/main/README.md

- Bastion Box Command

`ssh -i YOUR-KEYPAIR.pem -L 5555:RDS-ENDPOINT:5432 ec2-user@YOUR-BASTION-SERVER`

### Query to return just a boolean if it is successful
```const query = `
        SELECT EXISTS (
            INSERT INTO custom_key_table (custom_id, data)
            SELECT $1, $2
            WHERE NOT EXISTS (
                SELECT 1 FROM custom_key_table WHERE custom_id = $1
            )
            RETURNING custom_id
        ) AS inserted;
    `;```