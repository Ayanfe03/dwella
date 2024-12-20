const express = require('express');
const { 
  createFirstAdmin,
  createAdminHandler,
  loginAdminHandler,
  viewPendingListings, 
  approvePendingListing,
  rejectPendingListing,
  markListingAsSold,
} = require('../../controllers/v1/adminController');
const adminValidateToken = require('../../middleware/authAdmin');
const adminCheck = require('../../middleware/adminCheck');

const router = express.Router();

// Route to create first or super admin account
router.post('/first', createFirstAdmin);

// Route to create an admin account
router.post('', adminValidateToken, createAdminHandler);

// Route to login an admin
router.post('/login', loginAdminHandler);

// Route to view pending listings by admin
router.get('/pending-listings', adminValidateToken, viewPendingListings);

// Route to approve pending listings by admin
router.put('/approve-listings/:id', adminValidateToken, approvePendingListing);

// Route to reject pending listings by admin
router.put('/reject-listings/:id', adminValidateToken, rejectPendingListing);

// Route to mark an apartment as sold by the admin
router.put('/sold/:id', adminValidateToken, markListingAsSold);


module.exports = router;