const express = require('express');
const { 
  createApartmentHandler, 
  getLandlordListings, 
  updateLandlordListing,
  deleteLandlordListing 
} = require('../../controllers/v1/apartmentController');
const validateToken = require('../../middleware/auth');
const authLandlord = require('../../middleware/authLandlord');
const upload = require('../../utils/multer');

const router = express.Router();

// Route for Creating a new property listing by landlord
router.post('', validateToken, authLandlord, upload.single('image'), createApartmentHandler);

// Route for Requesting all listings by a landlord
router.get('/listings', validateToken, authLandlord, getLandlordListings);

// Route for Updating a Landlord's listings by a landlord
router.put('/:id', validateToken, authLandlord, upload.single('image'), updateLandlordListing);

// Route for Deleting a Landlord's listing by a landlord
router.delete('/:id', validateToken, authLandlord, deleteLandlordListing);

module.exports = router;