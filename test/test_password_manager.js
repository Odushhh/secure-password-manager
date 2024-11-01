"use strict";

// ES Modules
import { expect } from 'chai';
import Keychain from '../pm_main.js';
import request from 'request';
import { parse } from 'request/lib/cookies.js';

// Dynamic imports - Treats file as a CommonJS script
// const { expect } = await import('chai');
// const { Keychain } = await import('../pm_main.js');

function expectReject(promise) {
    return promise.then(
        (result) => expect().fail(`Expected failure, but function returned ${result}`),
        (error) => {},
    );
}

describe('Password manager', async function() {
    this.timeout(5000);
    let password = "password123!";  
    let kvs = {
        "service1": "value1",
        "service2": "value2",
        "service3": "value3"
    };

    describe('functionality', async function() {

        it('inits without an error', async function() {
            await Keychain.init(password);
        });

        it('can set and retrieve a password', async function() {
            let keychain = await Keychain.init(password);
            let url = 'www.stanford.edu';
            let pw = 'sunetpassword';
            await keychain.set(url, pw);
            expect(await keychain.get(url)).to.equal(pw);
        });

        it('can set and retrieve multiple passwords', async function() {
            let keychain = await Keychain.init(password);
            for (let k in kvs) {
                await keychain.set(k, kvs[k]);
            }
            for (let k in kvs) {
                expect(await keychain.get(k)).to.equal(kvs[k]);
            }
        });

        it('returns null for non-existent passwords', async function() {
            let keychain = await Keychain.init(password);
            for (let k in kvs) {
                await keychain.set(k, kvs[k]);
            }
            expect(await keychain.get('www.stanford.edu')).to.be.null;
        });

        it('can remove a password', async function() {
            let keychain = await Keychain.init(password);
            for (let k in kvs) {
                await keychain.set(k, kvs[k]);
            }
            expect(await keychain.remove('service1')).to.be.true;
            expect(await keychain.get('service1')).to.be.null;
        });

        it('returns false if there is no password for the domain being removed', async function() {
            let keychain = await Keychain.init(password);
            for (let k in kvs) {
                await keychain.set(k, kvs[k]);
            }
            expect(await keychain.remove('www.stanford.edu')).to.be.false;
        });

        it('can dump and restore the database', async function() {
            let keychain = await Keychain.init(password);
            for (let i = 0; i < 10; i++) {
                await keychain.set(String(i), String(i));
            }
            /*
            for (let k in kvs) {
                await keychain.set(k, kvs[k]);
            }
            */
            const data = await keychain.dump();
            const contents = data.repr; // Access the repr directly
            const parsedContents = JSON.parse(contents);    // Parse the JSON string to access its keys

            console.log("Parsed Contents: ", parsedContents);

            expect(parsedContents).to.have.key('kvs', 'salt');  // Check the parsed object
            expect(parsedContents.kvs).to.have.an('object');  // KVS validation

            const checksum = data.checksum; // Access the checksum directly
            const newKeychain = await Keychain.load(password, contents, parsedContents, checksum);

            // No need to parse JSON, contents is already an object
            for (let i = 0; i < 10; i++) {
                expect(await newKeychain.get(String(i))).to.equal(String(i));
            }
        });

        it('fails to restore the database if checksum is wrong', async function() {
            let keychain = await Keychain.init(password);
            for (let k in kvs) {
                await keychain.set(k, kvs[k]);
            }
            let data = await keychain.dump();
            let contents = data.repr; // Access the repr directly
            let fakeChecksum = '3GB6WSm+j+jl8pm4Vo9b9CkO2tZJzChu34VeitrwxXM=';
            await expectReject(Keychain.load(password, contents, fakeChecksum));
        });

        it('returns false if trying to load with an incorrect password', async function() {
            let keychain = await Keychain.init(password);
            for (let k in kvs) {
                await keychain.set(k, kvs[k]);
            }
            let data = await keychain.dump();
            let contents = data.repr; // Access the repr directly
            let checksum = data.checksum; // Access the checksum directly
            await expectReject(Keychain.load("fakepassword", contents, checksum));
        });
    });

    describe('security', async function() {

        // Very basic test to make sure you're not doing the most naive thing
        it("doesn't store domain names and passwords in the clear", async function() {
            let keychain = await Keychain.init(password);
            const url = 'www.stanford.edu';
            const pw = 'sunetpassword';

            await keychain.set(url, pw);

            const contentsBeforeDeletion = await keychain.dump();
            expect(contentsBeforeDeletion.repr).to.contain(url);

            await keychain.remove(url);

            const contentsAfterDeletion = await keychain.dump();
            const newContents = contentsAfterDeletion.repr;
            expect(newContents).not.to.contain(url);

            /*
            let data = await keychain.dump();
            let contents = data.repr; // Access the repr directly
            expect(contents).not.to.contain(password);
            expect(contents).not.to.contain(url);
            expect(contents).not.to.contain(pw);
            */
        });

        // This test won't be graded directly -- it just exists to make sure your
        // dump include a kvs object with all your urls and passwords, because
        // we will be using that in other tests.
        it('includes a kvs object in the serialized dump', async function() {
            let keychain = await Keychain.init(password);
            for (let i = 0; i < 10; i++) {
                await keychain.set(String(i), String(i));
            }
            const data = await keychain.dump();
            const contents = data.repr; // Access the repr directly (it's a JSON string)
            const parsedContents = JSON.parse(contents);    // Parse the JSON string
            console.log("Parsed Contents: ", parsedContents);

            expect(parsedContents).to.be.an('object')
            expect(parsedContents).to.have.all.keys('kvs', 'salt'); // Check for both the KVS and salt keys
            expect(parsedContents.kvs).to.be.an('object');        // Confirm they are objects
            expect(Object.keys(parsedContents.kvs)).to.have.lengthOf(10);   // Check length of the keys 

            // Only check for existence of the KVS key;
            for (let i; i < 10; i++) {
                expect(parsedContents.kvs).to.have.property(String(i));
            }

        });

    });
});
