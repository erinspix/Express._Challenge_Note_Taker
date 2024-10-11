// Declare variables for DOM elements but do not assign them yet
let noteTitle; 
let noteText; 
let saveNoteBtn; 
let newNoteBtn; 
let clearFormBtn; 
let noteList; 

// Check if the current page is the notes page
if (window.location.pathname == '/notes') {
  // Assign the DOM elements only if we are on the notes page
  noteTitle = document.querySelector('.note-title'); // Input field for the note title
  noteText = document.querySelector('.note-textarea'); // Textarea for the note text
  saveNoteBtn = document.querySelector('.save-note'); // Button to save a note
  newNoteBtn = document.querySelector('.new-note'); // Button to create a new note
  clearFormBtn = document.querySelector('.clear-btn'); // Button to clear the form fields
  noteList = document.querySelector('#list-group'); // List container for displaying saved notes
}

// Initialize an empty object to keep track of the active note
let activeNote = {};

// Function to get notes from the server
const getNotes = async () => {
  try {
    const response = await fetch('/api/notes'); // Fetch notes data from the server
    if (!response.ok) {
      throw new Error('Failed to fetch notes'); // Throw error if the request was not successful
    }
    return await response.json(); // Return the notes data in JSON format
  } catch (error) {
    console.error('Error fetching notes:', error); // Log error message if fetching fails
  }
};

// Function to save a note to the server
const saveNote = async (note) => {
  await fetch('/api/notes', {
    method: 'POST', // Use the POST method to save a new note
    headers: { 'Content-Type': 'application/json' }, // Set the content type to JSON
    body: JSON.stringify(note), // Convert the note object to a JSON string
  });

  // Clear the input fields after saving the note
  noteTitle.value = '';
  noteText.value = '';
  await displayNotes(); // Refresh the list of notes to display the newly added note
};

// Function to delete a note from the server
const deleteNote = async (id) => {
  await fetch(`/api/notes/${id}`, { method: 'DELETE' }); // Send a DELETE request with the note ID
  await displayNotes(); // Refresh the note list after deletion
};

// Function to render the active note in the input fields or clear the form
const renderActiveNote = () => {
  if (activeNote.id) { // Check if an active note is selected
    noteTitle.value = activeNote.title; // Display the note's title
    noteText.value = activeNote.text; // Display the note's text
    noteTitle.setAttribute('readonly', true); // Make the note fields read-only
    noteText.setAttribute('readonly', true); // Make the note fields read-only
  } else { // If no note is selected, clear the fields
    noteTitle.value = '';
    noteText.value = '';
    noteTitle.removeAttribute('readonly'); // Allow editing in the fields
    noteText.removeAttribute('readonly'); // Allow editing in the fields
  }
};

// Function to handle the "Save Note" button click
const handleSaveNote = () => {
  const newNote = { title: noteTitle.value, text: noteText.value }; // Create a new note object
  saveNoteBtn.style.display = 'none'; // Hide the save button after saving
  newNoteBtn.style.display = 'inline'; // Show the "New Note" button
  saveNote(newNote); // Call the function to save the note
};

// Function to handle selecting a note from the list
const handleSelectNote = (e) => {
  const noteData = e.target.closest('li').getAttribute('data-note'); // Get the selected note's data
  activeNote = JSON.parse(noteData); // Set the active note as the selected note
  renderActiveNote(); // Display the selected note in the input fields
};

// Function to handle deleting a note
const handleDeleteNote = (e) => {
  e.stopPropagation(); // Prevent the click event from affecting other elements
  const noteId = e.target.closest('li').getAttribute('data-id'); // Get the ID of the note to be deleted
  deleteNote(noteId); // Call the function to delete the note
};

// Function to display notes on the left-hand column
const displayNotes = async () => {
  const notes = await getNotes(); // Fetch notes from the server
  noteList.innerHTML = ''; // Clear the current list of notes
  notes.forEach((note) => { // Loop through each note and create list items
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
    li.setAttribute('data-note', JSON.stringify(note)); // Store note data as a JSON string in a custom attribute
    li.setAttribute('data-id', note.id); // Store the note ID for deletion

    const noteTitleSpan = document.createElement('span'); // Create a span element for the note title
    noteTitleSpan.textContent = note.title; // Set the text content of the span
    noteTitleSpan.addEventListener('click', handleSelectNote); // Add click event to handle note selection

    const deleteBtn = document.createElement('i'); // Create an icon element for the delete button
    deleteBtn.classList.add('fas', 'fa-trash-alt', 'float-right', 'text-danger', 'delete-note'); // Style the delete button
    deleteBtn.addEventListener('click', handleDeleteNote); // Add click event to handle note deletion

    li.append(noteTitleSpan, deleteBtn); // Append the note title and delete button to the list item
    noteList.appendChild(li); // Add the list item to the note list
  });
};

// Event listeners for buttons (only if we are on the notes page)
if (window.location.pathname == '/notes') {
  saveNoteBtn.addEventListener('click', handleSaveNote); // Save note button event
  newNoteBtn.addEventListener('click', () => {
    activeNote = {}; // Reset active note when creating a new note
    renderActiveNote(); // Clear the input fields for a new note
    newNoteBtn.style.display = 'none'; // Hide the "New Note" button
    saveNoteBtn.style.display = 'inline'; // Show the save button
  });
  clearFormBtn.addEventListener('click', () => {
    noteTitle.value = ''; // Clear the note title field
    noteText.value = ''; // Clear the note text field
  });
}

// Initial call to display notes when the page loads
displayNotes();
