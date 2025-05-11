// src/routes/listingRoutes.js
const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/multerMiddleware');


router.post('/', authMiddleware, upload.array('images'), listingController.createListing);

// Get all listings with optional filters
router.get('/', listingController.getListings);

// Get a specific Users Listings
router.get('/my-listings', authMiddleware, listingController.getMyListings);

// Get single listing by ID
router.get('/:id', listingController.getListing);

// Delete a listing
router.delete('/:id', authMiddleware, listingController.deleteListing);

module.exports = router;