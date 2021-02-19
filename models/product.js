const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// NOTICE: Basiclly, mongodb is schemaless, but when we use mongoose,
// we actully should configure our database - similar to sequelize (SQL)

const productSchema = new Schema({
    item: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    img: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',     // Relation to User
    }
});

// NOTICE: With mongoose, we dont set collection. When we export our model, mongoose take the first argument we pass in,
// lowercase & ploral => our 'Product' to 'products', and that is going to be our new collection.
module.exports = mongoose.model('Product', productSchema);