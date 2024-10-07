const notes = require('express').Router();
const fs = require('fs');
const path = require('path');
const { uuid } = require('uuidv4');

// Helper functions to read and write to the JSON file
const readFromFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const writeToFile = (destination, content) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(destination, JSON.stringify(content, null, 4), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(`Data written to ${destination}`);
      }
    });
  });
};
const renderNoteList = async (notes) => {
  let jsonNotes = await notes.json();
  console.log('Notes fetched from the database:', jsonNotes); // Debugging line to see fetched notes

  if (window.location.pathname === '/notes') {
    noteList.forEach((el) => (el.innerHTML = '')); // Clear the existing list
  }

  let noteListItems = [];

  // Create HTML elements for each note and add them to the note list
  const createLi = (text, delBtn = true) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item');

    const spanEl = document.createElement('span');
    spanEl.classList.add('list-item-title');
    spanEl.innerText = text;
    spanEl.addEventListener('click', handleNoteView);

    liEl.append(spanEl);

    if (delBtn) {
      const delBtnEl = document.createElement('i');
      delBtnEl.classList.add(
        'fas',
        'fa-trash-alt',
        'float-right',
        'text-danger',
        'delete-note'
      );
      delBtnEl.addEventListener('click', handleNoteDelete);

      liEl.append(delBtnEl);
    }

    return liEl;
  };

  if (jsonNotes.length === 0) {
    noteListItems.push(createLi('No saved Notes', false));
  }

  jsonNotes.forEach((note) => {
    const li = createLi(note.title);
    li.dataset.note = JSON.stringify(note);

    noteListItems.push(li);
  });

  if (window.location.pathname === '/notes') {
    noteListItems.forEach((note) => noteList[0].append(note));
  }
};

const readAndReturnNotes = async () => {
  const data = await readFromFile(path.join(__dirname, '../db/db.json'));
  return JSON.parse(data);
};

// GET route for retrieving notes
notes.get('/', async (req, res) => {
  try {
    const notes = await readAndReturnNotes();
    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve notes.' });
  }
});

// POST route for adding a new note
notes.post('/', async (req, res) => {
  try {
    const currentNotes = await readAndReturnNotes(); // Retrieve current notes from the JSON file
    const newNote = {
      id: uuid(), // Generate a unique ID for the new note
      title: req.body.title,
      text: req.body.text
    };

    currentNotes.push(newNote); // Add the new note to the current notes
    await writeToFile(path.join(__dirname, '../../db/db.json'), currentNotes); // Write the updated notes to the JSON file

    res.status(200).json(newNote); // Send the new note as a JSON response with status 200 (OK)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add the note.' }); // Send an error response with status 500 (Internal Server Error)
  }
});
// DELETE route for deleting a note by its ID
notes.delete('/:id', async (req, res) => {
  const noteId = req.params.id;

  try {
    const currentNotes = await readAndReturnNotes();
    const filteredNotes = currentNotes.filter(note => note.id !== noteId);

    if (currentNotes.length === filteredNotes.length) {
      return res.status(404).json({ message: `Note with ID: ${noteId} not found.` });
    }

    await writeToFile(path.join(__dirname, '../db/db.json'), filteredNotes);
    res.status(200).json({ message: `Note with ID: ${noteId} has been deleted.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete the note.' });
  }
});

module.exports = notes;
