// Importing required modules
const express = require('express'); // Express.js framework
const path = require('path'); // Module for handling and transforming file paths
const { readFromFile, writeToFile, readAndAppend } = require('./fsUtils'); // Utility functions for file operations
const { v4: uuidv4 } = require('uuid'); // Module for generating unique IDs
const app = express(); // Create an instance of an Express app
const PORT = process.env.PORT || 3001; // Set the port for the server, using an environment variable or defaulting to 3001

const cog = require('./cog'); // Custom middleware for logging requests

// Use the custom cog middleware
app.use(cog);

// Middleware to parse incoming JSON and URL-encoded data
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data
app.use(express.json()); // Parses JSON data
app.use(express.static('public')); // Serve static files from the 'public' directory

// Route to handle GET requests for fetching notes
app.get('/api/notes', (req, res) => {
  readFromFile('./db/db.json', 'utf8') // Read data from the db.json file
    .then((data) => {
      res.json(JSON.parse(data)); // Parse the JSON data and send it as a response
    })
    .catch((err) => res.status(500).json({ error: 'Failed to read notes' })); // Handle errors if file reading fails
});

// HTML route to serve the notes page (notes.html) when '/notes' is accessed
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/notes.html')); // Serve the notes.html file
});

// POST route for adding a new note to the database
app.post('/api/notes', (req, res) => {
  const { title, text } = req.body; // Destructure the title and text from the request body

  // Check if both title and text are provided
  if (title && text) {
    const newNote = { title, text, id: uuidv4() }; // Create a new note with a unique ID

    readAndAppend(newNote, './db/db.json'); // Append the new note to the db.json file
    res.status(201).json(newNote); // Respond with the newly created note and a 201 status code
  } else {
    res.status(400).json({ error: 'Note title and text are required' }); // Send an error response if required fields are missing
  }
});

// DELETE route for deleting a note by its ID
app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id; // Get the ID of the note to be deleted from the request parameters

  readFromFile('./db/db.json') // Read the existing notes from the db.json file
    .then((data) => {
      const notes = JSON.parse(data); // Parse the data into JSON format
      const updatedNotes = notes.filter((note) => note.id !== noteId); // Filter out the note with the specified ID

      writeToFile('./db/db.json', updatedNotes); // Write the updated notes array back to the db.json file
      res.json({ success: true }); // Respond with a success message
    })
    .catch((err) => res.status(500).json({ error: 'Failed to delete note' })); // Handle errors if deletion fails
});

// Catch-all route to serve index.html for any undefined routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html')); // Serve the index.html file for all other routes
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`); // Log a message when the server starts successfully
});
