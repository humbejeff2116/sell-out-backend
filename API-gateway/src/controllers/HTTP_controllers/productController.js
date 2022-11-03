
const formidable = require('formidable');
const fs = require('fs')
var FormData = require('form-data');
const { 
    getProducts,
    getUserProducts, 
    createProduct, 
    searchProducts, 
    authenticateUser, 
    getProductReviews,
    getProductLikes,
    getSimilarProducts
} = require('../../utils/http.services');

function ProductsController() {}

ProductsController.prototype.createProduct = async function(req, res) {
    // retrieve socket instance from request object
    const socketInstance = req.app.get("socketInstance") ? req.app.get("socketInstance") : null;
    // const socketId = socketInstance ? socketInstance.socket.id : null;
    const io = socketInstance ? socketInstance.io : null;
    const form = formidable({ multiples: true });
    const formData = new FormData();
    const formHeaders = formData.getHeaders();

    form.parse(req, async (err, fields, files) => {
        try {
            if (err) {
                console.error(err);
                res.status(400).json("An error occured while uploading product details");
                return;
            }

            const authenticatedUserData = await authenticateUser(JSON.parse(fields.user));
            const fieldsEntries = Object.entries((fields));
            const filesEntries = Object.entries((files));

            if (!authenticatedUserData.userExist) {
                return res.status(401).json(authenticatedUserData);
            }

            // append create product data from client to server form-data
            for (let [key, value] of fieldsEntries) {
                formData.append(key, value);
            }

            for (let [key, value] of filesEntries) {
                formData.append(key, fs.createReadStream(value.path), {
                    filename: value.name,
                });
            } 
            // send product details to product service
            sendCreateProductData(formData, formHeaders, res);    
        } catch (error) {
            console.error(error); 
            sendJSONError(res, 500, true, "error occured while uploading product details");
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
          console.error(err);
          sendJSONError(res, 500, true, "error occured while uploading product details"); 
        }
    }
}

// get products
ProductsController.prototype.getProducts = async function(req, res) {
    const userId = req.params.userId;
    const socketInstance = req.app.get("socketInstance") ? req.app.get("socketInstance") : null ;
    const socketId = socketInstance ? socketInstance.socket.id : null;
    let products = {};

    console.log("express app socket id ----productsControllerHTTP--->", socketId);
    try {
        if (userId) {
            products = await getUserProducts(req.params);
            return res.status(200).json(products);
        }

        products = await getProducts(req.params);
        res.status(200).json(products); 
    } catch (err) {
        console.error(err);
        sendJSONError(res, 500, true, "error occured while getting products");
    }   
}

ProductsController.prototype.getSimilarProducts = async function(req, res) {
    const socketInstance = req.app.get("socketInstance") ? req.app.get("socketInstance") : null ;
    // const socketId = socketInstance ? socketInstance.socket.id : null;

    try {
        const products = await getSimilarProducts(req.params);

        res.status(200).json(products); 
    } catch (err) {
        console.error(err);
        sendJSONError(res, 500, true, "error occured while getting similar products");
    }   
}

ProductsController.prototype.getUserProducts = async function(req, res) {
    try {
        const products = await getUserProducts(req.params);

        res.status(200).json(products); 
    } catch (err) {
        console.error(err);
        sendJSONError(res, 500, true, "error occured while getting user products");
    }   
}

ProductsController.prototype.searchProducts = async function(req, res) {
    try {
        const searchedProductsResponse = await searchProducts(req.query.q);

        res.json(searchedProductsResponse); 
    } catch (err) {
        console.error(err);
        sendJSONError(res, 500, true, "error occured while getting search");
    }
}

ProductsController.prototype.getProductReviews = async function(req, res) {
    try {      
        const productCommentsResponse = await getProductReviews(req.params.productId);

        res.status(200).json(productCommentsResponse); 
    } catch (err) {
        console.error(err);
        sendJSONError(res, 500, true, "error occured while reviewing product");
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
        sendJSONError(res, 500, true, "error occured while getting user stars");
    }
}


function sendJSONError(res, status, error, message) {
    const response = {
        status,
        error, 
        message, 
    }

    res.json(response); 
    return res.status(500);
}
module.exports = ProductsController;