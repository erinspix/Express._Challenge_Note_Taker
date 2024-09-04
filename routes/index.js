const router = require('express').Router(); // Create a new router object using Express Router

// Import Modular Routes for handling note-related API routes
const noteRoutes = require('./notes');

// Use the noteRoutes module for handling routes that start with '/notes'
// This means any request to '/notes' will be handled by the routes defined in 'notes.js'
router.use('/notes', noteRoutes);

// Export the router object to be used in other parts of the application
module.exports = router;
