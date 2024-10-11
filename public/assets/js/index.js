let noteTitle 
let noteText 
let saveNoteBtn 
let newNoteBtn 
let clearFormBtn 
let noteList 

// Define DOM elements
if(window.location.pathname == '/notes') {
   noteTitle = document.querySelector('.note-title');
   noteText = document.querySelector('.note-textarea');
   saveNoteBtn = document.querySelector('.save-note');
   newNoteBtn = document.querySelector('.new-note');
   clearFormBtn = document.querySelector('.clear-btn');
   noteList = document.querySelector('#list-group');
}

let activeNote = {};

// Function to get notes from the server
const getNotes = async () => {
  try {
    const response = await fetch('/api/notes'); 
    if (!response.ok) {
      throw new Error('Failed to fetch notes');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching notes:', error);
  }
};

// Function to save a note to the server
const saveNote = async (note) => {
  await fetch('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  });

  noteTitle.value = '';
  noteText.value = '';
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
    noteTitle.setAttribute('readonly', true);
    noteText.setAttribute('readonly', true);
  } else {
    noteTitle.value = '';
    noteText.value = '';
    noteTitle.removeAttribute('readonly');
    noteText.removeAttribute('readonly');
  }
};

// Function to handle the "Save Note" button click
const handleSaveNote = () => {
  const newNote = { title: noteTitle.value, text: noteText.value };
  saveNoteBtn.style.display = 'none';
  newNoteBtn.style.display = 'inline';
  saveNote(newNote);
};

// Function to handle selecting a note from the list
const handleSelectNote = (e) => {
  const noteData = e.target.closest('li').getAttribute('data-note');
  activeNote = JSON.parse(noteData); // Set active note
  renderActiveNote();
};

// Function to handle deleting a note
const handleDeleteNote = (e) => {
  e.stopPropagation(); // Prevent the click from triggering the note selection
  const noteId = e.target.closest('li').getAttribute('data-id');
  deleteNote(noteId);
};

// Function to display notes on the left-hand column
const displayNotes = async () => {
  const notes = await getNotes();
//  console.log("Notes: ", notes);
  noteList.innerHTML = ''; // Clear current list
  notes.forEach((note) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
    li.setAttribute('data-note', JSON.stringify(note));
    li.setAttribute('data-id', note.id);

    const noteTitleSpan = document.createElement('span');
    noteTitleSpan.textContent = note.title;
    noteTitleSpan.addEventListener('click', handleSelectNote);

    const deleteBtn = document.createElement('i');
    deleteBtn.classList.add('fas', 'fa-trash-alt', 'float-right', 'text-danger', 'delete-note');
   // deleteBtn.style.cursor = 'pointer';
    deleteBtn.addEventListener('click', handleDeleteNote);

    li.append(noteTitleSpan, deleteBtn);
    noteList.appendChild(li);
  });
};

// Event listeners for buttons
if(window.location.pathname == '/notes') {
  saveNoteBtn.addEventListener('click', handleSaveNote);
  newNoteBtn.addEventListener('click', () => {
    activeNote = {};
    renderActiveNote();
    newNoteBtn.style.display = 'none';
    saveNoteBtn.style.display = 'inline';
  });
  clearFormBtn.addEventListener('click', () => {
    noteTitle.value = '';
    noteText.value = '';
  });
}

// Initial call to display notes
displayNotes();
