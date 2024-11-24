// GitHub link to project:- https://github.com/Odushhh/secure-password-manager

"use strict";

// Import necessary cryptographic functions and utilities
import { stringToBuffer, bufferToString, encodeBuffer, decodeBuffer, getRandomBytes } from "./lib.js";    // Functions defined in lib.js
import { webcrypto } from 'crypto';
import fs from 'fs';
const { subtle } = webcrypto;

// Constants for cryptographic operations
const PBKDF2_ITERATIONS = 100000; // Number of iterations for PBKDF2
const SALT_LENGTH = 16;            // Length of the salt for key derivation
const AES_GCM_IV_LENGTH = 12;      // Length of the IV for AES-GCM

setTimeout(() => {}, 5000 * 100);

// Main Keychain class for the password manager
export class Keychain {  
  constructor() {
    this.kvs = {}; // Key Value Store for domain-password pairs
    this.masterKey = null; // Derived key from the master password
    this.salt = null; // Salt for PBKDF2
  }

  // Helper function to derive a key from the master password
  async deriveKey(password, salt) {
    const keyMaterial = await subtle.importKey("raw", stringToBuffer(password), { name: "PBKDF2" }, false, ["deriveBits", "deriveKey"]);

    this.masterKey = await subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: PBKDF2_ITERATIONS,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    // Check that masterKey has been correctly set
    if (!this.masterKey) {
      throw new Error("Failed to derive a valid master key.")
    }

    // Confirm masterKey is an ArrayBuffer
    // this.masterKey = await subtle.exportKey("raw", this.masterKey);
  }

  // Initialize the password manager with a master password
  static async init(password) {
    const keychain = new Keychain();
    keychain.salt = getRandomBytes(SALT_LENGTH); // Generate a random salt
    await keychain.deriveKey(password, keychain.salt); // Derive the master key
    return keychain;
  }

  // Load the password manager state from a serialized representation
  static async load(password, representation, parsedContents, trustedDataCheck) {
    if (!representation) throw new Error("Invalid representation: Data is undefined");

    const keychain = new Keychain();
    let data;
    try {
      data = JSON.parse(representation);
    } catch (error) {
      throw new Error("Invalid password dump format");
    }

    const { kvs, salt } = data;
    if (!salt) throw new Error("Invalid password dump: missing salt");
    
    keychain.salt = decodeBuffer(salt);
    await keychain.deriveKey(password, keychain.salt);
    
    // Load the KVS
    keychain.kvs = kvs || {};
    
    // Try to decrypt one password if any exist to verify the master password
    const domains = Object.keys(keychain.kvs);
    if (domains.length > 0) {
      try {
        await keychain.get(domains[0]);
      } catch (error) {
        throw new Error("Invalid master password");
      }
    }
    
    return keychain;
  }

  // Compute SHA-256 checksum for integrity verification
  async computeChecksum(data) {
    const hashBuffer = await subtle.digest("SHA-256", stringToBuffer(data));
    return bufferToString(hashBuffer);
  }

  // Serialize the current state of the password manager
  async dump() {
    // Include both KVS & salt in the dump
    const representation = JSON.stringify({ 
      kvs: this.kvs, 
      salt: encodeBuffer(this.salt) 
    }, null, 2);  // Added formatting for better readability
    const checksum = await this.computeChecksum(representation);

    try {
      // Save password dump into 'password_dump.json' file
      fs.writeFileSync('password_dump.json', representation, { encoding: 'utf8', flag: 'w' });
      console.log("\nPassword dump saved to the file 'password_dump.json'.\n");
    } catch (error) {
      console.error("Error saving password dump:", error);
      throw new Error("Failed to save password dump");
    }

    return { repr: representation, checksum }; // Returns object with serialized data and checksum
  }

  // Implementing computeHMAC using the SubtleCryptoAPI
  async computeHMAC(data) {
    if (!this.masterKey) {
      throw new Error("Master Key not initialised!")
    }

    const encoder = new TextEncoder();    // TextEncoder converts the string to a Uint8Array
    // const keyMaterial = new Uint8Array(this.masterKey);
    const key = await subtle.importKey(
        "raw",
        await subtle.exportKey("raw", this.masterKey), // Use the master key as the HMAC key
        { name: "HMAC", hash: "SHA-256" }, // Specify HMAC with SHA-256
        false,
        ["sign"] // Indicate that this key will be used for signing
    );

    const signature = await subtle.sign("HMAC", key, encoder.encode(data)); // Sign the data
    return bufferToString(signature); // Convert the signature to a string and return it
  }

  // Fetch the password for a given domain from the KVS
  async get(name) {
    const entry = this.kvs[name];
    if (!entry) return null;

    const { encryptedData, hmac } = entry;    // Remember, const entry = this.kvs[name]
    if (!encryptedData) return null;

    // Verify HMAC
    const computedHMAC = await this.computeHMAC(await this.decrypt(encryptedData));
    if (computedHMAC !== hmac) {
      throw new Error("HMAC verification failed!");
    }

    // Decrypt the password
    const decryptedPassword = await this.decrypt(encryptedData);
    return decryptedPassword;
  }

  // Insert or update the password for a given domain
  async set(name, value) {
    const encryptedData = await this.encrypt(value);
    const hmac = await this.computeHMAC(value); // Compute HMAC for the password
    this.kvs[name] = { encryptedData, hmac }; // Store encrypted password and HMAC
  }

  // Remove the password entry for a specified domain
  async remove(name) {
    if (this.kvs[name]) {
      delete this.kvs[name];
      return true;
    } else {
      return false;
      // throw new Error(`No entry found for ${name}`);
    }
  }

  // Encrypt the password using AES-GCM
  async encrypt(password) {
    const iv = getRandomBytes(AES_GCM_IV_LENGTH); // Generate random IV
    console.log("Type of this.masterKey: ", this.masterKey.constructor.name);

    const encryptedBuffer = await subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      this.masterKey,
      stringToBuffer(password)
    );
    return { iv: encodeBuffer(iv), data: encodeBuffer(encryptedBuffer) }; // Return IV and encrypted data
  }

  // Decrypt the password using AES-GCM
  async decrypt(encryptedData) {
    const iv = decodeBuffer(encryptedData.iv);
    const data = decodeBuffer(encryptedData.data);
    const decryptedBuffer = await subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      this.masterKey, 
      data
    );
    return bufferToString(decryptedBuffer); // Return decrypted password
  }
}

// Export the Keychain class for use in other modules
export default Keychain;