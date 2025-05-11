// src/controllers/interactionController.js
const ListingInteraction = require('../models/ListingInteraction');
const Listing = require('../models/Listing');
const Activity = require('../models/Activity');

class InteractionController {
  
  async removeFavorite(req, res) {
    try {
      const { listingId } = req.params;

      // Optional: Check if listing exists
      const listing = await Listing.findById(listingId);
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }

      // Find the existing interaction for this user and listing
      const interaction = await ListingInteraction.findOne({ user: req.user._id, listing: listingId });

      // If there's no interaction or it's not marked as favorite, return an error
      if (!interaction || !interaction.favorite) {
        return res.status(404).json({ message: 'This listing is not in your favorites' });
      }

      // Either set favorite to false or delete the interaction document
      // Option 1: Just set favorite to false and save
      // interaction.favorite = false;
      // await interaction.save();

      // Option 2: If you only use ListingInteraction to track favorites, you can delete it
      await ListingInteraction.findByIdAndDelete(interaction._id);

      res.json({ message: 'Listing removed from favorites' });
    } catch (error) {
      console.error('Error removing favorite:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }

  async addFavorite(req, res) {
    try {
      const { listingId } = req.params;

      // Check if listing exists
      const listing = await Listing.findById(listingId);
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }

      let interaction = await ListingInteraction.findOne({ user: req.user._id, listing: listingId });
      if (!interaction) {
        interaction = new ListingInteraction({
          user: req.user._id,
          listing: listingId,
          favorite: true
        });
      } else {
        interaction.favorite = true;
      }

      await interaction.save();

      await Activity.create({
        type: 'favorite_added',
        details: `User ${req.user._id} added Listing ${listing._id} to favorites`
      });


      res.json({
        message: 'Listing added to favorites',
        interaction
      });
    } catch (error) {
      console.error('Error adding favorite:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }

  async getFavorites(req, res) {
    try {
      const interactions = await ListingInteraction.find({
        user: req.user._id,
        favorite: true
      }).populate('listing');

       // Log activity
       await Activity.create({
        type: 'favorites_retrieved',
        details: `User ${req.user._id} retrieved their favorite listings`
      });


      res.json({ favorites: interactions });
    } catch (error) {
      console.error('Error fetching favorites:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }
}



module.exports = new InteractionController();
