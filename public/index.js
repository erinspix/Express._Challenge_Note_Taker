// Define DOM elements
const noteTitle = document.querySelector('.note-title');
const noteText = document.querySelector('.note-textarea');
const saveNoteBtn = document.querySelector('.save-note');
const newNoteBtn = document.querySelector('.new-note');
const clearFormBtn = document.querySelector('.clear-btn');
const noteList = document.querySelector('#list-group');

let activeNote = {};

// Function to get notes from the server
const getNotes = async () => {
  const response = await fetch('/api/notes', { method: 'GET' });
  return response.json();
};

// Function to save a note to the server
const saveNote = async (note) => {
  await fetch('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  });
  await displayNotes(); // Refresh note list
};

// Function to delete a note from the server
const deleteNote = async (id) => {
  await fetch(`/api/notes/${id}`, { method: 'DELETE' });
  await displayNotes(); // Refresh note list
};

// Function to render the active note or clear the form
const renderActiveNote = () => {
  if (activeNote.id) {
    noteTitle.value = activeNote.title;
    noteText.value = activeNote.text;
  } else {
    noteTitle.value = '';
    noteText.value = '';
  }
};

// Function to handle the "Save Note" button click
const handleSaveNote = () => {
  const newNote = { title: noteTitle.value, text: noteText.value };
  saveNoteBtn.style.display = 'none'; // Hide save button after click
  newNoteBtn.style.display = 'inline'; // Show "New Note" button
  saveNote(newNote);
};

// Function to handle selecting a note from the list
const handleSelectNote = (e) => {
  const noteId = e.target.getAttribute('data-id');
  activeNote = JSON.parse(noteId); // Set active note
  renderActiveNote();
};

// Function to display notes on the left-hand column
const displayNotes = async () => {
  const notes = await getNotes();
  noteList.innerHTML = ''; // Clear current list
  notes.forEach((note) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item');
    li.textContent = note.title;
    li.setAttribute('data-id', JSON.stringify(note));
    li.addEventListener('click', handleSelectNote);
    noteList.appendChild(li);
  });
};

// Event listeners for buttons
saveNoteBtn.addEventListener('click', handleSaveNote);
newNoteBtn.addEventListener('click', () => {
  activeNote = {};
  renderActiveNote();
  newNoteBtn.style.display = 'none'; // Hide "New Note" button
  saveNoteBtn.style.display = 'inline'; // Show save button
});
clearFormBtn.addEventListener('click', () => {
  noteTitle.value = '';
  noteText.value = '';
});

// Initial call to display notes
displayNotes();
