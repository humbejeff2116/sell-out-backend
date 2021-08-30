


const { getProducts, createProduct, authenticateUser } = require('../../utils/http.services');
const formidable = require('formidable');
const path = require('path');
const fs = require('fs')
var FormData = require('form-data');

function ProductsController() {}


ProductsController.prototype.createProduct = async function(req, res) {
    // retrieve socket instance from request object
    const socketInstance = req.app.get("socketInstance");
    const io = socketInstance.io;
    const socketId = socketInstance.socket.id;
    const form = formidable({ multiples: true, });
    const formData = new FormData();
    const formHeaders = formData.getHeaders();

    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error(err);
            res.status(400).json("An error occured while uploading product");  
            return;
        }
        const userData = {
            id: fields.id,
            userName: fields.fullName,
            userEmail: fields.userEmail
        }
        // append create product data from client to server form-data
        for (let keys in fields) {
            formData.append(keys, fields[keys])
        }
        for (let keys in files) {
            formData.append(keys, fs.createReadStream(files[keys].path), {
                filename: files[keys].name,
            });
        }
        authenticateUser(userData)
        .then(userData => {
            if(!userData.userExist) {
                return res.status(401).json(userData);
            }
            sendCreateProductData(formData, formHeaders, res);
        })
        .catch(err => {
            console.error(err.stack);
        })  
    });

    function sendCreateProductData(data, headers, res) {
        createProduct(data, headers)
        .then(response => {
            return response.data
        })
        .then(data => {
            //  emit product data change  event to all socket.io connected clients
            io.sockets.emit('productDataChange');
            res.json(data);
        })
        .catch(err => console.error(err.stack))
    }
}

ProductsController.prototype.getProducts = async function(req, res) {
    const socketInstance = req.app.get("socketInstance");
    const socketId = socketInstance.socket.id;
    console.log("socket insance id", socketId)
    getProducts(req)
    .then(response => {
       return response.data
    })
    .then(data => {
        res.json(data);
    })
    .catch(err => console.error(err.stack))
}
module.exports = ProductsController;