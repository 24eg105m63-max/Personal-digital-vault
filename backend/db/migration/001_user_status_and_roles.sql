-- Apply once to an existing Personal Digital Vault database before enabling the prod Spring profile.
ALTER TABLE users
    ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE,
    MODIFY COLUMN role VARCHAR(20) NOT NULL DEFAULT 'USER';

UPDATE users SET role = 'USER' WHERE role = 'STUDENT';
