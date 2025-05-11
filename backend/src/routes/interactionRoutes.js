// src/routes/interactionRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const InteractionController = require('../controllers/interactionController');

// Protected routes
router.post('/favorite/:listingId', authMiddleware, InteractionController.addFavorite);
router.get('/favorites', authMiddleware, InteractionController.getFavorites);
router.delete('/favorite/:listingId', authMiddleware, InteractionController.removeFavorite);

module.exports = router;
