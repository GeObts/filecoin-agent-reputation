import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initSynapse } from './services/synapse.js';
import { initReputation } from './services/reputation.js';
import { apiRouter } from './api/routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Initialize services
async function initializeServices() {
  try {
    console.log('[Server] Initializing services...');
    
    const privateKey = process.env.PRIVATE_KEY;
    const githubToken = process.env.GITHUB_TOKEN;

    if (!privateKey) {
      throw new Error('PRIVATE_KEY environment variable required');
    }

    // Initialize Synapse for Filecoin storage
    initSynapse(privateKey);
    console.log('[Server] Synapse initialized');

    // Initialize Reputation service
    initReputation(githubToken);
    console.log('[Server] Reputation service initialized');

    console.log('[Server] All services initialized successfully');
  } catch (error) {
    console.error('[Server] Service initialization failed:', error);
    throw error;
  }
}

// API routes
app.use('/api', apiRouter);

// Start server
async function start() {
  try {
    await initializeServices();

    app.listen(PORT, () => {
      console.log(`[Server] Running on port ${PORT}`);
      console.log(`[Server] Health check: http://localhost:${PORT}/health`);
      console.log(`[Server] API: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error);
    process.exit(1);
  }
}

start();
