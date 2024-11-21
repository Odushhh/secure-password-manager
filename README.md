# Password Manager

## Description
This project is a secure password manager designed for a cryptography class. It allows users to store, retrieve, and manage passwords securely using cryptographic techniques.

## Contributors
- 
-
-
-


## Features
- **Secure Storage**: Passwords are stored in an encrypted format.
- **HMAC Verification**: Each password entry is accompanied by an HMAC to ensure data integrity.
- **Key Derivation**: Uses PBKDF2 for deriving encryption keys from user passwords.
- **AES-GCM Encryption**: Implements AES-GCM for encrypting and decrypting passwords.
- **Dump and Restore**: Ability to serialize the password database and restore it later.

## Installation

To install the necessary dependencies, run:
```bash
npm install
```

## Usage

To start using the password manager, you can initialize it with a master password:

```javascript
const keychain = await Keychain.init('your_master_password');
```

### Setting a Password

To set a password for a specific service:

```javascript
await keychain.set('service_name', 'your_password');
```

### Retrieving a Password

To retrieve a password for a specific service:

```javascript
const password = await keychain.get('service_name');
```

### Removing a Password

To remove a password for a specific service:

```javascript
await keychain.remove('service_name');
```

### Dumping the Database

To dump the current state of the password manager:

```javascript
const data = await keychain.dump();
```

### Loading the Database

To load a previously saved database:

```javascript
const newKeychain = await Keychain.load('your_master_password', serializedData, checksum);
```

## Testing

To run the tests, use the following command:

```bash
npm test
```

## Contributing

If you would like to contribute to this project, please fork the repository and submit a pull request. Make sure to follow the coding standards and include tests for any new features.

## License

This project is licensed under the ISC License. See the LICENSE file for more details.

## Acknowledgments

- Thanks to the contributors and the cryptography class for their support and guidance.
