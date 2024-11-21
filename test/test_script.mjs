import fs from 'fs';
import Keychain from './../pm_main.js';
import readline from 'readline';

async function askQuestion(rl, question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

// Set a password
async function addPassword(keychain, rl) {
    const domain = await askQuestion(rl, 'Enter domain name: ');
    const userPassword = await askQuestion(rl, 'Enter password: ');

    // Set the password for the given domain
    await keychain.set(domain, userPassword);
    console.log(`Password for ${domain} added successfully.`);
}

// Retrieve password
async function retrievePassword(keychain, rl) {
    const domain = await askQuestion(rl, 'Enter domain name to retrieve password: ');

    // Retrieve the password for the given domain
    const retrievedPassword = await keychain.get(domain);
    if (retrievedPassword) {
        console.log(`Password for ${domain}: ${retrievedPassword}`);
    } else {
        console.log(`No password found for ${domain}.`);
    }
}

// Remove password
async function removePassword(keychain, rl) {
    const domain = await askQuestion(rl, 'Enter domain name to remove password: ');

    // Remove the password for the given domain
    const success = await keychain.remove(domain);
    if (success) {
        console.log(`Password for ${domain} removed successfully.`);
    } else {
        console.log(`No password found for ${domain}.`);
    }
}

async function showPasswordsList(keychain, rl) {
    try {
        const allPasswords = await keychain.dump();
        console.log("Dumped Passwords data: ", allPasswords);
        const passwords = allPasswords.kvs;

        if (!passwords || Object.keys(passwords).length === 0) {
            console.log("No passwords stored in the database.");
            return;
        }

        console.log("All Passwords: ");
        for (const [domain, entry] of Object.entries(passwords)) {
            console.log(`Domain: ${domain}, Password [hidden]`)
        }
    } catch (error) {
        console.error("Error retrieving passowrds list:", error)
    }
}

async function showMenu(keychain, rl) {
    while (true) {
        console.log("\n----- Password Manager -----");
        const action = await askQuestion(
            rl,
            '\nOptions: \n' +
            '1. Add password\n' +
            '2. Remove password\n' +
            '3. Retrieve password\n' +
            '4. Show passwords list\n' + 
            'q. Exit\n\n' + 
            'Your choice: '
        );

        try {
            if (action === '1') {
                await addPassword(keychain, rl);
            } else if (action === '2') {
                await removePassword(keychain, rl);
            } else if (action == '3') {
                await retrievePassword(keychain, rl);
            } else if (action == '4') {
                await showPasswordsList(keychain, rl);
            } else if (action == 'q') {
                console.log("Exiting Password Manager...");
                rl.close();
                process.exit(0);
            } else {
                console.log('Invalid choice. Choose any of the listed options above.');
            }
        } catch (error) {
            console.error("Error during operation:", error);

        }
    }
}   

async function run() {
    setTimeout(() => {}, 5000 * 100);

    console.log("Keychain imported successfully.");

    process.on('unhandledRejection', (reason) => {
        console.error('Unhandled Rejection: ', reason);
    });
    process.on('uncaughtException', (error) => {
        console.error('Uncaught Exception: ', error);
    });
    
    console.log('Starting the Keychain test script...');
    
    try {
        const password = 'your_master_password'; // Set your master password
        console.log('Initializing Keychain...');
        const keychain = await Keychain.init(password);

        // Create readline interface for user input
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        await showMenu(keychain, rl);

    } catch (error) {
        console.error('Error:', error);
    }
}

run();
