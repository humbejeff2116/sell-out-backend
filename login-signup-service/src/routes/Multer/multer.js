

const multer = require('multer');
const DataURI = require('datauri/parser');
const datauri = new DataURI();
const storage = multer.memoryStorage();
const multerUploads = multer({ storage }).single('profileImage');
let path = require('path');


/**
 * 
 * @param {Object} req 
 * @returns an array of url strings
 */

const imageDataUri = req => {
    let urlString = path.extname(req.file.originalname).toString();
    return datauri.format(urlString, req.file.buffer);
}

module.exports = { multerUploads, imageDataUri};