
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
const CounterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});

const ProductSchema =  mongoose.Schema({
    userName: { type: String, required: true },
    userId: { type: String, required: true},
    userProfileImage: { type: String }, 
    userEmail: { type: String, required: true, },
    productName: { type: String, required: true },
    productCategory: { type: String, required: true },
    productUsage: { type: String, required: true },
    productCurrency: { type: String, required: true },
    productPrice: { type: String, required: true },
    description: { type: String },
    inStock: { type: Boolean, default: true },
    collectionName: { type: String, default: "default" },
    discount: { type: String },
    quantitySold: { type: Number },
    productImages: [{}],
    likes: [{}],
    comments: [{}],
    reviews: [{}],
    createdAt: { type: Date, default: Date.now }
});

ProductSchema.index({
    '$**':'text'
})

ProductSchema.pre('save', function (next) {
    const self = this;

    Counter.findByIdAndUpdate(
        { _id: "productId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true },

        function(err, count) {
            if (err) return next(err);
            self.id = count.seq;
            next();
        }
    )
})

ProductSchema.statics.getReviews = async function (productId) {
    const product = await this.find({_id: productId});
    return product.reviews;
}

ProductSchema.methods.patchReviews = async function () {
    const reviews = this.reviews;

    if (!reviews || reviews.length < 1) {
        return ({
            productName: this.productName,
            productImages: this.productImages,
            reviews: []
        })
    }

    return ({
        productName: this.productName,
        productImages: this.productImages,
        reviews: reviews
    })
}

ProductSchema.methods.updateReviews = async function (socketId, getUser = f => f) {
    const reviews = this.reviews;

    if (!reviews || reviews.length < 1) {
        return null;
    }

    let len = reviews.length;
    const patchedReviews = [];

    for (let i = 0; i < len; i++) {
        const review = reviews[i];
        const { userName, userProfileImage } = await getUser({socketId, userId: review.buyerId}) || {};

        const updatedReview = { 
            ...review,
            buyerName: userName,
            buyerProfileImage: userProfileImage, 
            sellerName: this.userName,
            sellerProfileImage: this.userProfileImage,
            productName: this.productName,
            productImages: this.productImages,
        }
        patchedReviews[i] = updatedReview;
    }
    return patchedReviews;
}

ProductSchema.methods.setProductDetails = function ({ 
    user,
    productValues
}, 
images = []
) {
    const { fullName, userEmail, _id, profileImage } = JSON.parse(user);
    const { 
        productName, 
        productCategory, 
        productUsage, 
        productCurrency, 
        productPrice
    } = JSON.parse(productValues);

    this.userName = fullName;
    this.userEmail = userEmail;
    this.userId = _id;
    this.userProfileImage = profileImage;
    this.productName = productName;
    this.productCategory = productCategory;
    this.productImages = images;
    this.productUsage = productUsage;
    this.productCurrency = productCurrency;
    this.productPrice = productPrice;
}

ProductSchema.methods.setProductDetailsHTTP = function ({ 
    fullName,
    userEmail,
    id,
    profileImage,
    productName,
    productCategory,
    productImages,
    productUsage,
    productCurrency,
    productPrice
}) {
    this.userName = fullName;
    this.userEmail = userEmail;
    this.userId = id;
    this.userProfileImage = profileImage;
    this.productName = productName;
    this.productCategory = productCategory;
    this.productImages = productImages;
    this.productUsage = productUsage;
    this.productCurrency = productCurrency;
    this.productPrice = productPrice;
}

ProductSchema.statics.getProducts = async function() {
    const products = await this.find({});
    return products;
}

ProductSchema.statics.addReview = async function({
    productId,  
    sellerId, 
    userId,  
    reviewMessage 
}) {
    const review = {
        productId,  
        sellerId, 
        buyerId: userId,  
        reviewMessage,
        reply: null,
    }

    try {
        const updateProductReviews = await this.updateOne(
            {_id: productId}, {$push: {reviews: review}}
        )

        return ({
            status: 200,
            error: false,
            data: updateProductReviews
        });
    } catch (err) {
        throw new Error(err);
    }
}

ProductSchema.statics.replyReview = async function ({ 
    productId, 
    buyerId,
    sellerId, 
    reply, 
    replyTime 
}) {
    const reviewReply = {
        reply, 
        replyTime
    }
    try {
        // const replyReview = await this.updateOne(
        //     {$and: [
        //         {_id: productId},
        //         {'reviews.buyerId': buyerId},
        //         {'reviews.sellerId': sellerId}
        //     ]}, 
        //     {$set: {'reviews.$.reply': reviewReply}}
        // );
        const replyReview = await this.updateOne(
            { _id: productId, 'reviews.buyerId': buyerId, 'reviews.sellerId': sellerId }, 
            { $set: {'reviews.$.reply': reviewReply} }
        )

        return ({
            status: 201,
            error: false,
            data: replyReview
        });
    } catch (err) {
        throw new Error(err);
    }
}

ProductSchema.statics.getSimilarProducts = async function ({
    userId, 
    userEmail, 
    productCategory
}) {
    try {
        const [userProducts, similarProducts] = await Promise.all([
            this.find({userId: userId}, {
                likes: 0, 
                comments: 0,
                stars: 0,
                unstars: 0,
                interests: 0
            }), 
            this.find({productCategory: productCategory}, {
                likes: 0, 
                comments: 0,
                stars: 0,
                unstars: 0,
                interests: 0
            }) 
        ]);

        return ({
            status: 200,
            error: false,
            userProducts,
            similarProducts,
        });
    } catch(err) {
        throw new Error(err);
    }
}

ProductSchema.statics.getUserProducts = async function (userName) {
    const products = await this.find({userName});
    return products;
}

ProductSchema.statics.getUserProductsById = async function (userId) {
    const products = await this.find({userId});
    return products;
}

ProductSchema.statics.getProductById = async function (productId) {
    const product = await this.findOne({_id: productId});
    return product;
}

ProductSchema.statics.addLike = async function ({ product, likeCount, user }) {
    const sellerProduct = await this.findOne({_id: product.productId});
    const { id, userEmail, fullName} = user;

    if (userLikedProduct(user.userEmail, sellerProduct.likes)) {
        return ({
            status: 201, 
            updated: false, 
            data: null
        })
    }

    const likeData = {
        like: parseInt(likeCount),
        userName: fullName,
        userEmail: userEmail,
        userId: id,
        time: Date.now()
    }

    const addProductLike = await this.updateOne({ _id: product.productId }, { $push: { likes: likeData } });

    return ({ 
        status: 201, 
        updated: true, 
        data: addProductLike 
    }) 
}

ProductSchema.statics.removeLike = async function ({ product, likeCount, user }) {
    const sellerProduct = await this.findOne({ _id: product.productId })

    if (!userLikedProduct(user.userEmail, sellerProduct.likes)) {
        return ({status: 201, updated: false, data: null});
    }

    const removeProductLike = await this.updateOne({ _id: product.productId }, { $pull: { likes: { userId: user.id } } });
    return ({ status: 201, updated: true, data: removeProductLike });
}

ProductSchema.statics.searchProducts = async function (query) {
   const products = await this.find({$text: { $search: query }})

   return products
}

ProductSchema.statics.getCollectionsProducts = async function ({ userId, collections }) {
    const collectionProducts = [];

    if (!collections || collections.length < 1) { 
        return [];
    }

    for (let i = 0; i < collections.length; i++) {
        const products = await this.find({ $and: [{ userId: userId }, { collectionName: collections[i].name }] });
        collectionProducts[i] = { name: collections[i].name, products: products, totalProducts: products.length }
    }
     
    return collectionProducts;  
}

function userLikedProduct(userEmail = "", likes = []) {
    let i;
    const likesLen = likes.length;

    for (i = 0; i < likesLen; i++) {
        if (likes[i].userEmail === userEmail ) {
            return  true;
        }
    }
    return false;
}

const Counter = mongoose.model('counter', CounterSchema);
const Product = mongoose.model('Products', ProductSchema);
module.exports = Product;