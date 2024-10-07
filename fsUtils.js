const fs = require('fs');
const util = require('util');

// Promisify fs.readFile for easier use with async/await
const readFromFile = util.promisify(fs.readFile);

/**
 *  Function to write data to a JSON file
 *  @param {string} destination The file path where data should be written.
 *  @param {object} content The content to write to the file.
 *  @returns {void} Nothing
 */
const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`Data written to ${destination}`)
  );

/**
 *  Function to read data from a file and append content to it
 *  @param {object} content The content to append to the file.
 *  @param {string} file The file path where data should be appended.
 *  @returns {void} Nothing
 */
const readAndAppend = (content, file) => {
  readFromFile(file)
    .then((data) => {
      const parsedData = JSON.parse(data);
      parsedData.push(content);
      writeToFile(file, parsedData);
    })
    .catch((err) => console.error(err));
};

module.exports = { readFromFile, writeToFile, readAndAppend };
