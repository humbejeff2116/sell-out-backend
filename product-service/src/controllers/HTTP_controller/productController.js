


const { getProducts } = require('../../utils/http.services');
const Product = require('../../models/productModel');
const Service = require('../../models/serviceModel');
const Comment = require('../../models/commentModel');
const elasticSearch = require('elasticsearch');
const saveProductToElasticSearch = require('../../utils/elasticSearch');
const { contentSecurityPolicy } = require('helmet');
const { imageDataUri } = require('../../routes/Multer/multer');
const config = require('../../Config/config');
const cloudinary = require('cloudinary').v2;
cloudinary.config({ 
    cloud_name:config.cloudinary.cloudName, 
    api_key: config.cloudinary.apiKey, 
    api_secret:config.cloudinary.secret 
});


function ProductController() {
    
}




ProductController.prototype.getProducts = async function(req, res) {
    console.log('getting products http')
    const products = await Product.getProducts();
    const comments = await Comment.getAllComments();
    if(products && comments) {
        for (let i = 0; i < products.length; i++) {
            for (let j = 0; j < comments.length; j++) {
                if(products[i]._id.toString() === comments[j].productOrServiceId.toString()) {
                    products[i].comments.push(comments[j])
                }
            }
        }
        const productsResponse = products.map( product => {
                return ({
                    userId: product.userId,
                    userName: product.userName,
                    userEmail: product.userEmail,
                    userProfilePicture: product.userProfilePicture,
                    productId: product._id,
                    productName: product.productName,
                    productCategory: product.productCategory,
                    productCountry: product.productCountry,
                    productState: product.productState,
                    productUsage: product.productUsage,
                    productCurrency: product.productCurrency,
                    productPrice: product.productPrice,
                    productContactNumber: product.productContactNumber,
                    productImages: product.productImages,
                    stars: product.stars,
                    unstars: product.unstars,
                    comments: product.comments,
                    interests: product.interests
            });
        });
        const response = {
            satus:200,
            data: productsResponse,
            message:"gotten products data successfully"
        }
        console.log("sending products to login node")
        return res.status(200).json(response); 
    }
}

module.exports = ProductController;