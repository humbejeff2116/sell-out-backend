


const { getProducts, createProduct, authenticateUser } = require('../../utils/http.services');
const formidable = require('formidable');
const path = require('path');
const fs = require('fs')
var FormData = require('form-data');



function ProductsController() {
    
}



ProductsController.prototype.createProduct = async function(req, res) {

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
        .catch( err => {
            console.error(err.stack);
        })  
    });

    function sendCreateProductData(data, headers, res) {
        createProduct(data, headers)
        .then(response => {
            return response.data
        })
        .then(data => {
            // TODO... emit product data change socket event here
            console.log("create product response is", data)
            res.json(data);
        })
        .catch(err => console.error(err.stack))
    }
}

ProductsController.prototype.getProducts = async function(req, res) {
    getProducts(req)
    .then(response => {
       return response.data
    })
    .then(data => {
        console.log("http products response is", data)
        res.json(data);
    })
    .catch(err => console.error(err.stack))
}


module.exports = ProductsController;