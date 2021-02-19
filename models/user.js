const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    cart: {
        items: [{
            productId: { type: Schema.Types.ObjectId, required: true, ref: 'Product' }, // Relation to Product
            quantity: { type: Number, required: true }
        }]
    }
});

// NOTICE: By userSchema.methods.funcName we can stored a function on the instances! like the methods and the static method in mongodb driver
// Also important, here we muse use function, and not arrow function
userSchema.methods.addToCart = function(product) {
    const cartProductIndex = this.cart.items.findIndex(prod => {    // return -1 if findIndex does not find anything
        return prod.productId.toString() === product._id.toString();
    })
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({productId: product._id, quantity: newQuantity})
    }

    const updateCart = { items: updatedCartItems };
    this.cart = updateCart;
    return this.save();
}

userSchema.methods.removeFromCart = function(id) {
    const updateCartItems = this.cart.items.filter(p => p.productId.toString() !== id.toString());
    this.cart.items = updateCartItems;
    return this.save();
}

module.exports = mongoose.model('User', userSchema);