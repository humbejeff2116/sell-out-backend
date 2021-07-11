

const multer = require('multer');
const DataURI = require('datauri/parser');
const datauri = new DataURI();
const storage = multer.memoryStorage();
const multerUploads = multer({ storage }).any()
let path = require('path');

// You can also use multer.array('data', numberofFiles)
/**
 * 
 * @param {Object} req 
 * @returns an array of url strings
 */

const imageDataUri = req => {
    let files =[...req.files];
    // get the url strings and save in an array
    let imagesData = [];
    for (let i = 0; i < files.length; i++) {
        imagesData[i] = { urlString: path.extname(files[i].originalname).toString(), buffer: files[i].buffer };
    }
   return imagesData.map(image => datauri.format(image.urlString, image.buffer)); 
}
 
module.exports = { multerUploads, imageDataUri};