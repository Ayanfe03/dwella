const bcrypt = require('bcrypt');
const config = require('../../config/config');
const jwt = require('jsonwebtoken');
const Apartment = require('../../models/Apartment');
const User = require('../../models/User');
const cloudinary = require('cloudinary').v2;
const { Op } = require('sequelize');


// @desc POST Creates Apartment Listing: Landlord
// @route POST /v1/apartments
// @access Private
const createApartmentHandler = async (req, res) => {
  try {
    const { title, description, location } = req.body;
    const rentAmount = Number(req.body.rentAmount);
    const roomNumber = Number(req.body.roomNumber);


    if (!title || !description || !rentAmount || !location || !roomNumber) {
      return res.status(400).json({
        message: 'All fields are required',
      });
    }

    if (typeof title !== 'string') {
      return res.status(400).json({
        message: 'Title must be a string',
      });
    }

    if (typeof description !== 'string') {
      return res.status(400).json({
        message: 'Description must be a string',
      });
    }

    if (typeof rentAmount !== 'number') {
      return res.status(400).json({
        message: 'Rent Amount must be a number',
      });
    }

    if (typeof location !== 'string') {
      return res.status(400).json({
        message: 'Location must be a string',
      });
    }

    if (typeof roomNumber !== 'number') {
      return res.status(400).json({
        message: 'Room Number must be a numer',
      });
    }

    const imageUrl = req.file ? req.file.path : null;

    const newApartment = await Apartment.create({
      title, 
      description, 
      rentAmount, 
      location, 
      roomNumber,
      landlordId: req.user.id,
      imagePath: imageUrl,
      status: 'pending',
      apartmentSold: false,
    });

    await newApartment.save();

    res.status(201).json({
      message: 'Apartment Listing created successfully',
      id: newApartment.id,
      title: newApartment.title,
      description: newApartment.description,
      rentAmount: newApartment.rentAmount,
      location: newApartment.location,
      roomNumber: newApartment.roomNumber,
      status: newApartment.status,
      apartmentSold: newApartment.apartmentSold,
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    })
  }
}

// @desc GET Retrieves Apartment Listing for a Landlord
// @route GET /v1/apartments/listings
// @access Private
const getLandlordListings = async (req, res) => {
  try {
    const landlordId = req.user.id;

    const listings = await Apartment.findAll({
      where: {
        landlordId: landlordId,
      },
      order: [['createdAt', 'DESC']]
    });

    if (!listings) {
      res.status(404).json({
        message: 'No listings found'
      })
    }

    return res.status(200).json({
      message: "Listings Retrieved Successfully",
      listings: listings,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    })
  }
}

// @desc PUT Update Apartment Listing for a Landlord
// @route PUT /v1/apartments/:id
// @access Private
const updateLandlordListing = async (req, res) => {
  try {
    const { id } = req.params;
    const landlordId = req.user.id;

    const apartment = await Apartment.findOne({
      where: {
        id,
        landlordId
      }  
    })

    if (!apartment) {
      return res.status(404).json({
        message: 'Apartment not found'
      })
    }

    const { title, description, location } = req.body;
    const rentAmount = Number(req.body.rentAmount);
    const roomNumber = Number(req.body.roomNumber);

    const data = { title, description, rentAmount, location, roomNumber }

    let imagePath = apartment.imagePath;

    if (req.file) {
      if (imagePath) {
        const publicId = imagePath.split('/').pop().split('.')[0]; 
        await cloudinary.uploader.destroy(`apartment_listing_images/${publicId}`);
      }

      // const result = await cloudinary.uploader.upload(req.file.path, {
      //   folder: 'apartment_listing_images',
      // });

      // data.imagePath = result.secure_url;

      imagePath = req.file.path
    }

    await apartment.update(data);

    return res.status(200).json({
      message: 'Apartment successfully updated',
      apartment
    })   
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    })
  }
}

// @desc DELETE Delete Apartment Listing for a Landlord
// @route DELETE /v1/apartments/:id
// @access Private
const deleteLandlordListing = async (req, res) => {
  try {
    const { id } = req.params;

    const apartment = await Apartment.findByPk(id);

    if (!apartment) {
      return res.status(404).json({ message: 'Apartment not found.' });
    }

    await apartment.destroy();
    res.status(200).json({ 
      message: 'Apartment deleted successfully.' 
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    })
  }
}

// @desc GET Retrieve All Approved Apartment Listings
// @route GET /v1/apartments
// @access Private
const getAllApartmentListing = async (req, res) => {
  try {
    const apartments = await Apartment.findAll({ 
      where: { 
        status: 'approved', 
        apartmentSold: false,
      },
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({ 
      message: 'Retrieved all Apartments successfully', 
      apartments 
    });

  } catch (error) {
    res.status(500).json({ 
      message: error.message 
    });
  }
};

// @desc GET Retrieve Apartment Listings based on search and filters
// @route GET /v1/apartments/search
// @access Private
const searchFilterListings = async (req, res) => {
  try {
    const { title, description, minRent, maxRent, minRooms, maxRooms, location, page = 1, limit = 10 } = req.query;

    const whereFilter = {
      status: 'approved', 
      apartmentSold: false, // Ensuring only approved apartments are shown to tenants
    };

    // Filter by title (case-insensitive)
    if (title) {
      whereFilter.title = { [Op.iLike]: `%${title}%` };
    }
    
    // Filter by description (case-insensitive)
    if (description) {
      whereFilter.description = { [Op.iLike]: `%${description}%` };
    }
    
    // Filter by rent amount range
    if (minRent && maxRent) {
      whereFilter.rentAmount = { [Op.between]: [minRent, maxRent] };
    } 
    
    // Filter by number of bedrooms
    if (minRooms && maxRooms) {
      whereFilter.roomNumber = { [Op.between]: [minRooms, maxRooms] };
    }
    
    // Filter by location (case-insensitive)
    if (location) {
      whereFilter.location = { [Op.iLike]: `%${location}%` };
    }

    const offset = (page - 1) * limit;

    const { count, rows: apartments } = await Apartment.findAndCountAll({
      where: whereFilter,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      message: 'Successfully retrieved search results',
      totalResults: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      apartments
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    })
  }
}

module.exports = {
  createApartmentHandler,
  getLandlordListings,
  updateLandlordListing,
  deleteLandlordListing,
  getAllApartmentListing,
  searchFilterListings
}