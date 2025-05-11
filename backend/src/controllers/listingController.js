// src/controllers/listingController.js
const Listing = require("../models/Listing");
const cloudinary = require("../config/cloudinary");
const Activity = require("../models/Activity");

class ListingController {

  async getMyListings(req, res) {
    try {
      // req.user._id should contain the authenticated user's ID
      const myListings = await Listing.find({ owner: req.user._id }).sort({ createdAt: -1 });

      res.json(myListings);
    } catch (error) {
      console.error('Error fetching user listings:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }
  
  async deleteListing(req, res) {
    try {
      const { id } = req.params;
      
      // Find listing
      const listing = await Listing.findById(id);
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
  
      // Check ownership or admin role if needed
      // Example:
      // if (req.user.role !== 'admin' && listing.owner.toString() !== req.user._id.toString()) {
      //   return res.status(403).json({ message: 'Not authorized to delete this listing' });
      // }
  
      // Extract public IDs from image URLs
      const publicIds = listing.images.map((url) => {
        const segments = url.split('/');
        // segments example:
        // ["https:", "", "res.cloudinary.com", "<cloud_name>", "image", "upload", "v123456789", "listings", "wvsomwwf3ctvkimrbhe3.png"]
  
        const filename = segments.pop(); // "wvsomwwf3ctvkimrbhe3.png"
        const folder = segments.pop();   // "listings"
        const [publicIdNoExt] = filename.split('.'); // "wvsomwwf3ctvkimrbhe3"
        const publicId = `${folder}/${publicIdNoExt}`;
        return publicId;
      });
  
      // Delete images from Cloudinary
      if (publicIds.length > 0) {
        const result = await cloudinary.api.delete_resources(publicIds);
        console.log('Cloudinary deletion result:', result);
      }
  
      // Delete listing from DB
      await Listing.findByIdAndDelete(id);
  
      res.json({ message: 'Listing and images deleted successfully' });
    } catch (error) {
      console.error('Error deleting listing:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }

  async getListings(req, res) {
    try {
      const {
        type,
        location,
        minPrice,
        maxPrice,
        page = 1,
        limit = 10,
      } = req.query;

      // Build filter object
      
      const filter = { status: 'approved' };
      if (type) filter.type = type;
      if (location) filter.location = location;
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }

      // Execute query with pagination
      const listings = await Listing.find(filter)
        .populate("owner", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

      // Get total count for pagination
      const total = await Listing.countDocuments(filter);

      res.json({
        listings,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        total,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // In listingController.js, update getListing method:
  async getListing(req, res) {
    try {
      const listing = await Listing.findById(req.params.id)
        .populate('owner', 'username createdAt avatar');
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
      res.json(listing);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async createListing(req, res) {
    try {
      const {
        title,
        description,
        type,
        breed,
        age,
        gender,
        price,
        location,
        vaccinated,
        neutered,
      } = req.body;

      // Convert strings "true"/"false" to booleans, if needed
      const vaccinatedBool = vaccinated === "true";
      const neuteredBool = neutered === "true";

      // Upload images to Cloudinary if any
      let imageUrls = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const result = await new Promise((resolve, reject) => {
            const upload_stream = cloudinary.uploader.upload_stream(
              { folder: "listings" },
              (error, result) => {
                if (error) {
                  return reject(error);
                }
                resolve(result);
              }
            );
            upload_stream.end(file.buffer);
          });

          imageUrls.push(result.secure_url);
        }
      }

      // Create the listing
      const listing = new Listing({
        title,
        description,
        type,
        breed,
        age: age ? Number(age) : undefined,
        gender,
        price: Number(price),
        location,
        vaccinated: vaccinatedBool,
        neutered: neuteredBool,
        images: imageUrls,
        owner: req.user._id,
      });

      await listing.save();

      await Activity.create({
        type: "listing_created",
        details: `Listing ${listing._id} created by User ${req.user._id}`,
      });

      res.status(201).json({
        message: "Listing created successfully",
        listing,
      });
    } catch (error) {
      console.error("Listing creation error:", error.message);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
}

module.exports = new ListingController();