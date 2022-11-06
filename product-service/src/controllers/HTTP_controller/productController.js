
const Product = require('../../models/productModel');
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
       this.getProductLikes = this.getProductLikes.bind(this);
       this.sendJSONError = this.sendJSONError.bind(this);
       this.getSimilarProducts = this.getSimilarProducts.bind(this);
    }
   
    async createProduct (req, res) {
        const productImages = req.files ? imageDataUri(req) : [];
        console.log("image", req.files);

        if (productImages.length > 0) {
            const uploadImages = await new Promise(async (resolve, reject) => {
                const uploadedImages = [];

                for (let i = 0; i < productImages.length; i++) {
                    try {
                        const uploadedImage = await cloudinary.uploader.upload(productImages[i].content);
                        uploadedImages[i] = {src: uploadedImage.url};
                    } catch (err) {
                        reject(err);
                    }
                }
                resolve(uploadedImages);
            });

            const product = new Product();
            product.setProductDetails(req.body, uploadImages);
            try {
                const savedProduct = await product.save();
                return res.status(201).json({ status: 201, message: 'product uploaded sucessfully', data: savedProduct });
            } catch (err) {
                console.error(err);
                this.sendJSONError(res, 500, true, "Error occured while uploading product details"); 
            }
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

            const productsResponse = filterProducts(products);
            const response = {
                satus: 200,
                error: false,
                data: productsResponse,
                message: "gotten products data successfully"
            }

            return res.status(200).json(response);
        } catch (err) {
            console.error(err);
            this.sendJSONError(res, 500, true, "Error occured while getting products");
        }
    }

     async getSimilarProducts(req, res) {
        let filterUserProducts = [];
        let filterSimilarProducts = [];

        try {
            const { 
                error, 
                userProducts, 
                similarProducts 
            } = await Product.getSimilarProducts(req.params);

            if (error) {
                console.log("error");
                this.sendJSONError(res, 400, true, "An error occured while getting similar products");
                return;
            }

            if (userProducts.length > 0) {
                filterUserProducts = filterProducts(userProducts);
            }

            if (similarProducts.length > 0) {
                filterSimilarProducts = filterProducts(similarProducts);
            }
            
            const response = {
                status: 200,
                error: false,
                message: "gotten similar products successfully",
                data: {
                    sellerProducts: filterUserProducts,
                    similarProducts: filterSimilarProducts
                }
            }
            
            res.status(200).json(response); 
        } catch (err) {
            console.error(err);
            this.sendJSONError(res, 500, true, "Error occured while getting similar products");
        }   
    }

    async getProductLikes(req, res) {
        const productId = req.params.productId;
        console.log("product id",productId)
        console.log("getting  product likes ---productService---")
        let response;

        try {
            const product = await Product.getProductById(productId);
            if (!product) {
                response = {
                    error: true,
                    status: 400,
                    message: "product not found", 
                }

                return res.status(200).json(response);
            }
            
            const productLikes = product.likes;
            response = {
                status: 200,
                message: "product likes gotten successfully",
                data: productLikes
            }
            return res.status(200).json(response);
        } catch (err) {
            console.error(err)
            this.sendJSONError(res, 500, true, "An error occured while getting product likes");    
        }
    }

    sendJSONError(res, status, error, message) {
        const response = {
            status,
            error, 
            message, 
        }
    
        res.json(response); 
        return res.status(status);
    }
}

function filterProducts(products) {
    const filteredProducts = products.map(product => {
        const {
            userId,
            userName,
            userEmail,
            userProfileImage,
            _id,
            productName,
            productCategory,
            productState,
            productUsage,
            productCurrency,
            productPrice,
            productImages,
            likes,
            comments,
            reviews,
            description,
            inStock,
            collectionName,
            discount,
            quantitySold
        } = product;

        return ({
            userId: userId,
            userName: userName,
            userEmail: userEmail,
            userProfileImage: userProfileImage,
            productId: _id,
            productName: productName,
            productCategory: productCategory,
            productState: productState,
            productUsage: productUsage,
            productCurrency: productCurrency,
            productPrice: productPrice,
            productImages: productImages,
            likes: likes,
            comments: comments,
            description: description,
            inStock: inStock,
            collectionName: collectionName,
            discount: discount,
            quantitySold: quantitySold,
        });
    });

    return filteredProducts;
}

module.exports = new ProductController();