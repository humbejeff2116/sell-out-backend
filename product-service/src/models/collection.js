
const mongoose = require('mongoose');
const CollectionSchema =  mongoose.Schema({
    userId: { type: String, required: true },
    collections: [{}],
    createdAt: { type: Date, default: Date.now }
});


CollectionSchema.methods.setDetails = async function ({ userId, collection }) {
    this.userId = userId;
    this.collections = [{name: collection.name, createdTime: Date.now}]
}

CollectionSchema.statics.getCollection = async function ({ userId }) {
    const collection = await this.find({ userId });
    return collection;
}

CollectionSchema.statics.addCollection = async function ({ userId, collection }) {
    const { name } = collection;

    await this.updateOne({ _id: userId }, {$push: {collections: {name: name, createdTime: Date.now}}});
    return ({status: 201, error: false});
}

CollectionSchema.statics.getUserCollections = async function ({ userId}) {
   const collection = await this.findOne({userId});

    return collection ? collection.collections : collection;
}

const Collection = mongoose.model('collections', CollectionSchema);
module.exports = Collection;