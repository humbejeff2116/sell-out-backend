



const Product = require('../../models/productModel');
const Service = require('../../models/serviceModel');
const Comment = require('../../models/commentModel');
const { authenticateUser } = require('../../utils/http.services');
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



ProductController.prototype.createProduct = async function(req, res) {
    // TODO... save product or service to elastice search data base


    const userId = req.body.id;
    const userName = req.body.fullName;
    const userEmail = req.body.userEmail;
    const userProfileImage = req.body.profileImage;
    const productName = req.body.productName;
    const productCategory = req.body.productCategory;
    const productCountry = req.body.productCountry;
    const productState = req.body.productState;
    const productUsage = req.body.productUsage;
    const productCurrency = req.body.productCurrenc
    const productPrice = req.body.productPrice;
    const productContactNumber = req.body.productContactNumber;
    const productImages = req.fles ? imageDataUri(req) : [];
    const userData = {
        userId,
        userName,
        userEmail
    }

    if (productImages.length > 0) {
        const multipleUpload =  new Promise(async (resolve, reject) => {
            const uploadedImages = [];

            for (let i = 0; i < productImages.length; i++) {
                await cloudinary.uploader.upload(productImages[i].content)
                .then(image => uploadedImages[i] = {src: image.url})
                .catch(err =>  reject(err));
            }
            resolve(uploadedImages);      
        });
        
        multipleUpload.then(images => {
            const data = {
                userId,
                userName,
                userEmail,
                userProfileImage ,
                productName,
                productCategory,
                productImages: images,
                productCountry,
                productState,
                productUsage,
                productCurrency,
                productPrice,
                productContactNumber
            }
            const product = new Product()
            product.setProductDetails(data);
            product.save()
            .then(data => {
                res.status(201).json({ status: 201, message: 'product uploaded sucessfully'});
            })
            .catch(err => {
                console.error(err.stack);           
                res.json({ status: 500, message: 'An error occured while uploading product to database' });
                res.status(500);
            });
        
        })
        .catch( e => console.error(e.stack))
    }        
}

ProductController.prototype.getProducts = async function(req, res) {
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
        return res.status(200).json(response); 
    }
}

module.exports = ProductController;