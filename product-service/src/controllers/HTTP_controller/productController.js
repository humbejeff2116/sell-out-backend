
const Product = require('../../models/productModel');
const Service = require('../../models/serviceModel');
const Comment = require('../../models/commentModel');
const { authenticateUser } = require('../../utils/http.services');
const elasticSearch = require('elasticsearch');
const saveProductToElasticSearch = require('../../utils/elasticSearch');
const { imageDataUri } = require('../../routes/Multer/multer');
const config = require('../../Config/config');
const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
    cloud_name:config.cloudinary.cloudName, 
    api_key: config.cloudinary.apiKey, 
    api_secret:config.cloudinary.secret 
});

class ProductController {

    constructor() {

       this.createProduct = this.createProduct.bind(this); 

       this.getProducts = this.getProducts.bind(this);

       this.searchProducts = this.searchProducts.bind(this);

       this.getProductComments = this.getProductComments.bind(this);

       this.getProductLikes = this.getProductLikes.bind(this);

       this.sendJSONError = this.sendJSONError.bind(this);

    }
   
    async createProduct (req, res) {

        // const userId = req.body.id;
        // const userName = req.body.fullName;
        // const userEmail = req.body.userEmail;
        // const userProfileImage = req.body.profileImage;
        // const productName = req.body.productName;
        // const productCategory = req.body.productCategory;
        // const productCountry = req.body.productCountry;
        // const productState = req.body.productState;
        // const productUsage = req.body.productUsage;
        // const productCurrency = req.body.productCurrenc
        // const productPrice = req.body.productPrice;
        // const productContactNumber = req.body.productContactNumber;
        const productImages = req.files ? imageDataUri(req) : [];

        const userData = {
            userId,
            userName,
            userEmail
        };

        if (productImages.length > 0) {

            const multipleUpload = new Promise(async (resolve, reject) => {

                const uploadedImages = [];

                for (let i = 0; i < productImages.length; i++) {

                    try {

                        const uploadedImage = await cloudinary.uploader.upload(productImages[i].content);

                        uploadedImages[i] = { src: uploadedImage.url };

                    } catch (err) {

                        reject(err);

                    }

                }

                resolve(uploadedImages);

            });

            multipleUpload.then( async images => {

                req.body.productImages = images;

                const product = new Product();

                product.setProductDetails(req.body);

                try {

                    const savedProduct = await product.save();

                    res.status(201).json({ status: 201, message: 'product uploaded sucessfully', data: savedProduct });

                } catch (err) {

                    console.error(err);

                    res.json({ status: 500, error: true, message: 'An error occured while uploading product to database' });

                    res.status(500);

                }

            }).catch(e => console.error(e.stack));

        }

    }

    async getProducts(req, res) {
        
        try {

            const products = await Product.getProducts(); 

            if (!products || products.length < 1) {

                const response = {
                    satus: 200,
                    error: false,
                    data: null,
                    message: "no products found"
                };

                return res.status(200).json(response);

            }

            const productsResponse = products.map(product => {

                return ({
                    userId: product.userId,
                    userName: product.userName,
                    userEmail: product.userEmail,
                    userProfileImage: product.userProfileImage,
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
                satus: 200,
                error: false,
                data: productsResponse,
                message: "gotten products data successfully"
            };

            return res.status(200).json(response);
   
        } catch (err) {

            console.error(err);

        }

    }

    async searchProducts(req, res) {

        let response;

        try {

            const query = req.query.q;

            // TODO... send query to account service and update user search model propety

            console.log("search query is", query);

            const searchProducts = await Product.searchProducts(query);

            console.log("search products", searchProducts)

            if (searchProducts.length < 1) {

                response = {
                    status: 400,
                    error: false,
                    message: 'No product matches your search',
                    data: []
                }

                res.json(response);

                return res.status(400);

            }

            response = {
                status: 200,
                error: false,
                message: "gotten products data successfully",
                data: searchProducts
            }

            return res.status(200).json(response);

        } catch (err) {

            console.error(err);

            res.json({ status: 500, error: true, message: 'an error occured while getting products' });

            return res.status(500);

        }

    }

    async getProductComments(req, res) {

        const productId = req.params.productId;

        console.log("product id",productId)

        console.log("getting  product comments ---productService---")

        let response;

        try {

            const productComments = await Comment.getProductComments(productId)

            if (!productComments || productComments.length < 1) {

                response = {
                    status: 200,
                    message: "no product comments found",
                    data: []
                }

                return res.status(200).json(response)

            }

            response = {
                status: 200,
                message: "product comments found",
                data: productComments
            }

            return res.status(200).json(response)

        } catch (err) {

            console.error(err)
            
        }

    }

    async getProductLikes(req, res) {

        const productId = req.params.productId;

        console.log("product id",productId)

        console.log("getting  product likes ---productService---")

        let response;

        try {

            const product = await Product.getProductById(productId)

            if (!product) {

                response = {
                    error: true,
                    status: 400,
                    message: "product not found", 
                }

                res.json(response)

                return res.status(200)

            }
            
            const productLikes = product.likes;

            response = {
                status: 200,
                message: "product likes gotten successfully",
                data: productLikes
            }

            return res.status(200).json(response)

        } catch (err) {

            console.error(err)

            this.sendJSONError(res, 500, true, "An error occured while getting product likes")
            
        }

    }

    sendJSONError(res, status, error, message) {

        const response = {
            status,
            error, 
            message, 
        }
    
        res.json(response) 
    
        return res.status(status)
    }

}

module.exports = new ProductController();