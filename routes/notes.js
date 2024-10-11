// Import required modules
const notes = require('express').Router(); // Create a new router instance for handling note-related routes
const fs = require('fs'); // Node.js file system module for file operations
const path = require('path'); // Path module for handling and transforming file paths
const { uuid } = require('uuidv4'); // UUID module for generating unique IDs for each note

// Helper function to read data from a file and return a promise
const readFromFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err); // Reject the promise if there's an error
      } else {
        resolve(data); // Resolve the promise with the file data if successful
      }
    });
  });
};

// Helper function to write data to a file and return a promise
const writeToFile = (destination, content) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(destination, JSON.stringify(content, null, 4), (err) => {
      if (err) {
        reject(err); // Reject the promise if there's an error
      } else {
        resolve(`Data written to ${destination}`); // Resolve the promise if the write is successful
      }
    });
  });
};

// Function to render a list of notes in the UI (used in client-side code)
const renderNoteList = async (notes) => {
  let jsonNotes = await notes.json(); // Convert the fetched notes to JSON format
  console.log('Notes fetched from the database:', jsonNotes); // Debugging line to see fetched notes

  if (window.location.pathname === '/notes') {
    noteList.forEach((el) => (el.innerHTML = '')); // Clear the existing list if on the /notes page
  }

  let noteListItems = [];

  // Create HTML elements for each note and add them to the note list
  const createLi = (text, delBtn = true) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item'); // Add Bootstrap list item class for styling

    const spanEl = document.createElement('span');
    spanEl.classList.add('list-item-title'); // Add a class for styling the note title
    spanEl.innerText = text; // Set the text of the note
    spanEl.addEventListener('click', handleNoteView); // Add a click event to view the note details

    liEl.append(spanEl); // Append the note title to the list item

    // If the delete button is enabled, create and append it to the list item
    if (delBtn) {
      const delBtnEl = document.createElement('i');
      delBtnEl.classList.add(
        'fas',
        'fa-trash-alt',
        'float-right',
        'text-danger',
        'delete-note'
      ); // Add styling and icon classes for the delete button
      delBtnEl.addEventListener('click', handleNoteDelete); // Add a click event to delete the note

      liEl.append(delBtnEl); // Append the delete button to the list item
    }

    return liEl; // Return the constructed list item
  };

  // If there are no notes, display a message indicating that
  if (jsonNotes.length === 0) {
    noteListItems.push(createLi('No saved Notes', false));
  }

  // Create list items for each note and add them to the note list
  jsonNotes.forEach((note) => {
    const li = createLi(note.title);
    li.dataset.note = JSON.stringify(note); // Store the note data as a JSON string in a custom attribute

    noteListItems.push(li);
  });

  // Append the constructed note list to the page if the user is on the /notes page
  if (window.location.pathname === '/notes') {
    noteListItems.forEach((note) => noteList[0].append(note));
  }
};

// Function to read and return notes from the JSON file
const readAndReturnNotes = async () => {
  const data = await readFromFile(path.join(__dirname, '../db/db.json'));
  return JSON.parse(data); // Parse and return the JSON data
};

// GET route for retrieving all notes
notes.get('/', async (req, res) => {
  try {
    const notes = await readAndReturnNotes(); // Get the list of notes
    res.status(200).json(notes); // Respond with the notes in JSON format
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve notes.' }); // Error handling
  }
});

// POST route for adding a new note
notes.post('/', async (req, res) => {
  try {
    const currentNotes = await readAndReturnNotes(); // Get the current notes from the JSON file
    const newNote = {
      id: uuid(), // Generate a unique ID for the new note
      title: req.body.title, // Set the note title from the request body
      text: req.body.text // Set the note text from the request body
    };

    currentNotes.push(newNote); // Add the new note to the list of current notes
    await writeToFile(path.join(__dirname, '../../db/db.json'), currentNotes); // Write the updated notes back to the JSON file

    res.status(200).json(newNote); // Respond with the new note in JSON format
  } catch (err) {
    console.error(err); // Log the error to the console
    res.status(500).json({ error: 'Failed to add the note.' }); // Error handling
  }
});

// DELETE route for deleting a note by its ID
notes.delete('/:id', async (req, res) => {
  const noteId = req.params.id; // Get the note ID from the request parameters

  try {
    const currentNotes = await readAndReturnNotes(); // Get the list of current notes
    const filteredNotes = currentNotes.filter(note => note.id !== noteId); // Remove the note with the specified ID

    // If no notes were removed, send a 404 response indicating the note was not found
    if (currentNotes.length === filteredNotes.length) {
      return res.status(404).json({ message: `Note with ID: ${noteId} not found.` });
    }

    await writeToFile(path.join(__dirname, '../db/db.json'), filteredNotes); // Write the updated notes back to the JSON file
    res.status(200).json({ message: `Note with ID: ${noteId} has been deleted.` }); // Send a success response
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete the note.' }); // Error handling
  }
});

// Export the router to use in other parts of the application
module.exports = notes;
