import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Keychain from './pm_main.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Serve static files from the React app
app.use(express.static('dist'));
app.use(express.static('public'));

let keychain = null;

// Initialize or load keychain
app.post('/api/init', async (req, res) => {
  try {
    const { password } = req.body;
    
    // Try to load existing data from password_dump.json
    try {
      // Check if file exists and has content
      if (fs.existsSync('password_dump.json')) {
        const dumpContent = fs.readFileSync('password_dump.json', 'utf8');
        
        // Check if file is empty or has invalid content
        if (!dumpContent || dumpContent.trim() === '') {
          // Create new keychain if file is empty
          keychain = await Keychain.init(password);
          const { repr, checksum } = await keychain.dump();
          return res.json({ success: true });
        }

        try {
          // Pass the entire dump content as the representation
          keychain = await Keychain.load(password, dumpContent, null, null);
          return res.json({ success: true });
        } catch (parseError) {
          console.error('Login error:', parseError);
          return res.status(401).json({ error: 'Invalid master password' });
        }
      } else {
        // Create new keychain if file doesn't exist
        keychain = await Keychain.init(password);
        const { repr, checksum } = await keychain.dump();
        return res.json({ success: true });
      }
    } catch (err) {
      console.error('File operation error:', err);
      return res.status(500).json({ error: 'Error accessing password dump file' });
    }
  } catch (error) {
    console.error('Initialization error:', error);
    return res.status(401).json({ error: 'Invalid master password' });
  }
});

// Get password
app.get('/api/password/:domain', async (req, res) => {
  try {
    if (!keychain) throw new Error('Please initialize the password manager first');
    const password = await keychain.get(req.params.domain);
    res.json({ password });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Set password
app.post('/api/password', async (req, res) => {
  try {
    if (!keychain) throw new Error('Please initialize the password manager first');
    const { domain, password } = req.body;
    await keychain.set(domain, password);
    const { repr, checksum } = await keychain.dump(); // Save state after each change
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Remove password
app.delete('/api/password/:domain', async (req, res) => {
  try {
    if (!keychain) throw new Error('Please initialize the password manager first');
    const success = await keychain.remove(req.params.domain);
    if (success) {
      const { repr, checksum } = await keychain.dump(); // Save state after each change
    }
    res.json({ success });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all domains
app.get('/api/domains', async (req, res) => {
  try {
    if (!keychain) throw new Error('Please initialize the password manager first');
    const domains = Object.keys(keychain.kvs);
    res.json({ domains });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Save state
app.post('/api/save', async (req, res) => {
  try {
    if (!keychain) throw new Error('Please initialize the password manager first');
    const { repr, checksum } = await keychain.dump();
    res.json({ repr, checksum });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
