
const { 
    getProducts, 
    createProduct, 
    searchProducts, 
    authenticateUser, 
    getProductComments ,
    getProductLikes
} = require('../../utils/http.services');
const formidable = require('formidable');
const path = require('path');
const fs = require('fs')
var FormData = require('form-data');

function ProductsController() {}


ProductsController.prototype.createProduct = async function(req, res) {

    // retrieve socket instance from request object
    const socketInstance = req.app.get("socketInstance") ? req.app.get("socketInstance") : null ;

    const socketId = socketInstance ? socketInstance.socket.id : null;

    const io = socketInstance ? socketInstance.io : null ;

    const form = formidable({ multiples: true, });

    const formData = new FormData();

    const formHeaders = formData.getHeaders();

    form.parse(req, async (err, fields, files) => {

        try {

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
           
            const authenticatedUserData = await authenticateUser(userData);

            if(!authenticatedUserData.userExist) {

                return res.status(401).json(authenticatedUserData);

            }

            // send product details to product server
            sendCreateProductData(formData, formHeaders, res);
           
            
        } catch (err) {

            console.error(err.stack); 

        } 

    });

    async function sendCreateProductData(data, headers, res) {

        try {

            const createdProduct = await createProduct(data, headers)
            
            if (io) {

                io.sockets.emit('productDataChange');

                return res.json(createdProduct);

            }

            return res.json(createdProduct);

        } catch (err) {

            console.error(err.stack) 

        }

    }
}

ProductsController.prototype.getProducts = async function(req, res) {

    try {

        const socketInstance = req.app.get("socketInstance") ? req.app.get("socketInstance") : null ;

        const socketId = socketInstance ? socketInstance.socket.id : null;

        console.log("express app socket id ----productsControllerHTTP--->", socketId)

        const products = await getProducts();

        res.status(200).json(products); 

    } catch (err) {

        console.error(err.stack)

    }
    
}

ProductsController.prototype.searchProducts = async function(req, res) {

    try {
        
        const searchedProductsResponse = await searchProducts(req.query.q);

        res.json(searchedProductsResponse); 

    } catch (err) {

        console.error(err.stack)

    }

}

ProductsController.prototype.getProductComments = async function(req, res) {

    try {
        
        const productCommentsResponse = await getProductComments(req.params.productId);

        res.status(200).json(productCommentsResponse); 

    } catch (err) {

        console.error(err.stack)

    }

}

ProductsController.prototype.getProductLikes = async function(req, res) {

    try {
        
        const productLikesResponse = await getProductLikes(req.params.productId);

        if (productLikesResponse.error) {

            return  sendJSONError(res, 500, true, "error occured while getting product likes")

        }

        res.status(200).json(productLikesResponse); 

    } catch (err) {

        console.error(err)
        
        sendJSONError(res, 500, true, "error occured while getting user stars")

    }

}


function sendJSONError(res, status, error, message) {

    const response = {
        status,
        error, 
        message, 
    }

    res.json(response) 

    return res.status(500)
}
module.exports = ProductsController;