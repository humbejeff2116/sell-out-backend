

const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;

const CounterSchema = new mongoose.Schema({

    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }

});

const ProductSchema =  mongoose.Schema({

    userName: { type: String, required: true },
    userId:{ type: String, required: true},
    userProfileImage: { type: String }, 
    userEmail: { type: String, required: true, },
    productName: { type: String, required: true },
    productCategory: { type: String, required: true },
    productUsage: { type: String },
    productCurrency: { type: String, required: true },
    productPrice: { type: String, required: true },
    numberSold: { type: Number },
    productImages: [{}],
    likes: [{}],
    comments: [{}],
    createdAt: { type: Date, default: Date.now }

});

ProductSchema.index({

    '$**':'text'

})

ProductSchema.pre('save', function(next) {

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

ProductSchema.methods.setProductDetails = function(data = {}) {

    const {product, user} = data;
    this.userName = user.fullName;
    this.userEmail = user.userEmail;
    this.userId = user._id;
    this.userProfileImage = user.profileImage;
    this.productName = product.productName;
    this.productCategory = product.productCategory;
    this.productImages = product.productImages;
    this.productUsage = product.productUsage;
    this.productCurrency = product.productCurrency;
    this.productPrice = product.productPrice;

}

ProductSchema.methods.setProductDetailsHTTP = function(data = {}) {

    this.userName = data.fullName;
    this.userEmail = data.userEmail;
    this.userId = data.id;
    this.userProfileImage = data.profileImage;
    this.productName = data.productName;
    this.productCategory = data.productCategory;
    this.productImages = data.productImages;
    this.productUsage = data.productUsage;
    this.productCurrency = data.productCurrency;
    this.productPrice = data.productPrice;

}

ProductSchema.statics.getProducts = async function( ) {

    let products = await this.find({});

    return products;

}

ProductSchema.statics.getUserProducts = async function(userName) {

    let products = await this.find({userName});

    return products;

}

ProductSchema.statics.getProductById = async function(productId) {

    let product = await this.findOne({ _id: productId });

    return product;

}

ProductSchema.statics.addLike = async function({product, likeCount, user}) {

    const sellerProduct = await this.findOne({_id: product.productId});

    if (userLikedProduct(user.userEmail, sellerProduct.likes)) {

        return ({status: 201, updated: false, data: null})

    }

    const likeData = {
        like: parseInt(likeCount),
        userName: user.fullName,
        userEmail: user.userEmail,
        userId: user.id,
        time: Date.now()
    }

    const addProductLike = await this.updateOne({ _id: product.productId }, { $push: { likes: likeData } })

    return ({ status: 201, updated: true, data: addProductLike })
    
}

ProductSchema.statics.removeLike = async function({product, likeCount, user}) {

    const sellerProduct = await this.findOne({ _id: product.productId })

    if (!userLikedProduct(user.userEmail, sellerProduct.likes)) {

        return ({status: 201, updated: false, data: null});

    }

    const removeProductLike = await this.updateOne({ _id: product.productId }, { $pull: { likes: { userId: user.id } } });

    return ({ status: 201, updated: true, data: removeProductLike });

}

ProductSchema.statics.searchProducts = async function(query) {

   const products = await this.find({ $text: { $search: query } })

   return products

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