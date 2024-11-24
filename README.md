# Password Manager

## Description
This project is a secure password manager designed for a cryptography class. It allows users to store, retrieve, and manage passwords securely using advanced cryptographic techniques. The password manager features strong encryption with AES-GCM, key derivation via PBKDF2, and data integrity ensured by HMAC. Additionally, it supports secure password sharing, enabling users to safely share credentials with trusted individuals using public-key cryptography. This project aims to provide a robust solution for password management while adhering to best practices in modern cryptography.

## Contributors
- 127156 Adrian Oduma
- 148224 Kitonga Sammy Musangi
- 147916 Obongo Shalom Boniface
- 152135 Makworo Peris Kemunto

## Features
- **Secure Storage**: Passwords are stored in an encrypted format.
- **HMAC Verification**: Each password entry is accompanied by an HMAC to ensure data integrity.
- **Key Derivation**: Uses PBKDF2 for deriving encryption keys from user passwords.
- **AES-GCM Encryption**: Implements AES-GCM for encrypting and decrypting passwords.
- **Dump and Restore**: Ability to serialize the password database and restore it later.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Development Mode

To run the application in development mode with hot reloading:

1. Start the backend server:
```bash
node server.js
```

2. In a new terminal, start the frontend development server:
```bash
npm run dev
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Odushhh/secure-password-manager
cd secure-password-manager
```

2. Install dependencies:
```bash
npm install
```

3. Build the frontend:
```bash
npm run build
```

4. Start the application:
```bash
npm start
```

The application will be available at:
- Frontend Development: http://localhost:5173 (when using npm run dev)
- Production: http://localhost:3000 (when using npm start)



## Usage

### First Time Setup
1. Visit the application in your browser
2. Enter your desired master password
3. This will create a new secure password vault

### Accessing Existing Vault
1. Enter your master password
2. If the password is correct, you'll see your stored passwords

### Managing Passwords
- **Add Password**: Use the form at the top of the dashboard
- **View Password**: Click the eye icon next to any password
- **Copy Password**: Click the copy icon to copy to clipboard
- **Delete Password**: Click the trash icon to remove a password

### Security Notes
- Your master password is never stored
- All passwords are encrypted before storage
- The application uses secure cryptographic methods
- Always use a strong master password

### Programmatic Usage

For developers who want to use the password manager programmatically:

```javascript
// Initialize with a master password
const keychain = await Keychain.init('your_master_password');

// Set a password
await keychain.set('service_name', 'your_password');

// Get a password
const password = await keychain.get('service_name');

// Remove a password
await keychain.remove('service_name');

// Save the current state
const data = await keychain.dump();

// Load a saved state
const newKeychain = await Keychain.load('your_master_password', serializedData, checksum);
```

## Testing

To run the tests, use the following command:

```bash
npm test
```

## Short-Answer Questions
### 1) Briefly describe your method for preventing the adversary from learning information about the lengths of the passwords stored in your password manager. 
- - To prevent adversaries from learning information about the lengths of the passwords stored in the password manager, we can use a fixed-length encoding scheme for all passwords. Regardless of the actual length of the password, we can pad shorter passwords to a predetermined maximum length using a secure padding scheme (e.g., using a random character or a specific padding character). This way, all stored passwords will appear to be of the same length, making it difficult for an attacker to infer the actual lengths of the passwords.
### 2) Briefly describe your method for preventing swap attacks (Section 2.2). Provide an argument for why the attack is prevented in your scheme. 
- To prevent swap attacks, we can ensure that sensitive data, such as passwords and cryptographic keys, are stored in memory in a way that minimizes their exposure. This can be achieved by using memory management techniques that clear sensitive data from memory as soon as it is no longer needed. Additionally, we can use secure memory allocation functions that prevent the operating system from swapping sensitive data to disk. By ensuring that sensitive data is not written to disk, we mitigate the risk of an attacker accessing this data through swap files.

### 3) In our proposed defense against the rollback attack (Section 2.2), we assume that we can store the SHA-256 hash in a trusted location beyond the reach of an adversary. Is it necessary to assume that such a trusted location exists, in order to defend against rollback attacks? Briefly justify your answer. 
- It is necessary to assume that a trusted location exists to defend against rollback attacks effectively. Without a trusted location to store the SHA-256 hash of the password or the state of the password manager, an adversary could potentially manipulate the stored data or the environment to revert to a previous state. This could allow them to bypass security measures and access sensitive information. A trusted location ensures that the integrity of the stored hash is maintained and that it cannot be tampered with by an adversary.

### 4) Because HMAC is a deterministic MAC (that is, its output is the same if it is run multiple times with the same input), we were able to look up domain names using their HMAC values. There are also randomized MACs, which can output different tags on multiple runs with the same input. Explain how you would do the look up if you had to use a randomized MAC instead of HMAC. Is there a performance penalty involved, and if so, what? 

- If we had to use a randomized MAC instead of HMAC for looking up domain names, we would need to store the MAC values along with the associated domain names in a secure manner. To perform a lookup, we would generate a MAC for the domain name using the same secret key and then search for the corresponding entry in the database. However, since the MAC is randomized, we cannot directly use the MAC value as a key for lookup. Instead, we would need to maintain a mapping of MAC values to domain names, which could introduce additional storage overhead and complexity.
There is a performance penalty involved in using a randomized MAC, as it requires additional computations to generate and store the MAC values for each lookup. This could lead to increased latency in accessing stored passwords, especially if the number of records is large. 

### 5) In our specification, we leak the number of records in the password manager. Describe an approach to reduce the information leaked about the number of records. Specifically, if there are k records, your scheme should only leak log2(k) (that is, if k1 and k2 are such that log2(k1) = log2(k2) , the attacker should not be able to distinguish between a case where the true number of records is k1 and another case where the true number of records is k2).

- To reduce the information leaked about the number of records in the password manager, we can implement a scheme that uses a fixed-size data structure to store the records. For example, we can use a binary tree or a hash table with a fixed number of slots. By ensuring that the number of slots is a power of two, we can limit the information leaked to log2(k), where k is the number of records. This way, if there are k1 and k2 records such that log2(k1) = log2(k2), the attacker cannot distinguish between the two cases based on the number of records.

### 6) What is a way we can add multi-user support for specific sites to our password manager system without compromising security for other sites that these users may wish to store passwords of? That is, if Alice and Bob wish to access one stored password (say for nytimes) that either of them can get and update, without allowing the other to access their passwords for other websites.

- To add multi-user support for specific sites in the password manager without compromising security for other sites, we can implement a shared access control mechanism. Each password entry can have an associated access control list (ACL) that specifies which users have access to that entry. For example, if Alice and Bob need to access the password for "nytimes," we can store the password in the key-value store with an ACL that includes both Alice and Bob.
When either user attempts to access the password, the system checks their credentials against the ACL. If they are authorized, they can retrieve or update the password. For other passwords, the ACL can be set to restrict access to only the user who created the entry, ensuring that users cannot access each other's passwords for other websites. This approach maintains the security of individual user data while allowing shared access to specific entries.

## Contributing

If you would like to contribute to this project, please fork the repository and submit a pull request. Make sure to follow the coding standards and include tests for any new features.

## License

This project is licensed under the ISC License. See the LICENSE file for more details.

## Acknowledgments

- Thanks to the contributors and the cryptography class for their support and guidance.
