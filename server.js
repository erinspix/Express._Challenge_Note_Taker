const express = require('express');
const path = require('path');
const { readFromFile, writeToFile, readAndAppend } = require('./fsUtils');
const { v4: uuidv4 } = require('uuid');
const app = express();
const PORT = process.env.PORT || 3001;

const cog = require('./cog');

// Use the custom cog middleware
app.use(cog);
app.get('/api/notes', (req, res) => {
  readFromFile('./db/db.json')
    .then((data) => res.json(JSON.parse(data)))
    .catch((err) => res.status(500).json({ error: 'Failed to read notes' }));
});


// Middleware to parse JSON and serve static files
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// HTML route to serve notes.html
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/notes.html'));
});

// Catch-all route to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// GET route for retrieving all notes
app.get('/api/notes', (req, res) => {
  readFromFile('./db/db.json')
    .then((data) => res.json(JSON.parse(data)))
    .catch((err) => res.status(500).json({ error: 'Failed to read notes' }));
});

// POST route for adding a new note
app.post('/api/notes', (req, res) => {
  const { title, text } = req.body;

  if (title && text) {
    const newNote = { title, text, id: uuidv4() };

    readAndAppend(newNote, './db/db.json');
    res.status(201).json(newNote);
  } else {
    res.status(400).json({ error: 'Note title and text are required' });
  }
});

// DELETE route for deleting a note by ID (Bonus)
app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;

  readFromFile('./db/db.json')
    .then((data) => {
      const notes = JSON.parse(data);
      const updatedNotes = notes.filter((note) => note.id !== noteId);

      writeToFile('./db/db.json', updatedNotes);
      res.json({ success: true });
    })
    .catch((err) => res.status(500).json({ error: 'Failed to delete note' }));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
