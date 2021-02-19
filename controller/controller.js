const { render } = require('ejs');
const { request, response } = require('express');
const Product = require('../models/product');
const User = require('../models/user');
const bcryptjs = require('bcryptjs');

// Shop Controller:
exports.getStart = (req, res, next) => {
    Product.find()          // With mongoose, .find() return all the data from the database (from the 'products')
    .then(products => {     // Remember! mongoose, unlike mongodb driver, return a promise array, so we can dispanse on .toArray() which we did in mongodb driver
        res.render('productList', { path: '/', title: 'SHOP', prod: products, isAuthenticated: req.session.isLoggedIn });
    })  // TIP: We can use .select('item price') after Product.find() to reach only specific elements, and not all the data
    .catch(err => console.log(err));
}

exports.getProduct = (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)    // .findById(_id) return the element in our database that fit to the _id - return a promise
    .then(product => {
        res.render('productDetails', { path: 'ITEM', prod: product, isAuthenticated: req.session.isLoggedIn });
    })
    .catch(err => console.log(err));
}

// New Product Controller:
exports.getNewProduct = (req, res, next) => {
    res.render('newProduct', { path: '/admin/add-product', title: 'NEW-PRODUCT', isAuthenticated: req.session.isLoggedIn })
}

exports.postNewProduct = (req, res, next) => {
    const item = req.body.item;
    const img = req.body.img;
    const price = req.body.price;
    const description = req.body.description;
    const userId = req.user._id;
    const product = new Product({item: item, img: img, price: price, description: description, userId: userId});
    product.save()  // NOTICE: insertOne({...}) .save() is a method provided by mongoose, and its save (after stringlfy to JSON) our data on our database
    .then(result => {
        res.redirect('/');
    })
    .catch(err => console.log(err));
}

// Cart Controller:
exports.getCart = (req, res, next) => {
    req.user.populate('cart.items.productId').execPopulate()    // .populate(id) return all the ele in others collections that has the same id according to the path - execPopulate just return populate as a promise
    .then(user => {
        const products = user.cart.items;
        res.render('cart', { path: '/cart', prod: products, isAuthenticated: req.session.isLoggedIn });
    })
    .catch(err => console.log(err));
}

exports.postCart = (req, res, next) => {
    const id = req.body.id;
    Product.findById(id)
    .then(product => {
        return req.user.addToCart(product);
    })
    .then(() => {
        res.redirect('/cart');
    })
    .catch(err => console.log(err));
}

exports.postDeleteFromCart = (req, res, next) => {
    const id = req.body.id;
    req.user.removeFromCart(id)
    .then(result => {
        res.redirect('/cart');
    })
    .catch(err => console.log(err));
}

// Admin Products Controller:
exports.getAdminProducts = (req, res, next) => {
    Product.find()
    .then(products => {
        res.render('adminProductsList', { path: '/admin/products', title: 'SHOP', prod: products, isAuthenticated: req.session.isLoggedIn });
    })
    .catch(err => console.log(err))
}

exports.getEditProduct = (req, res, next) => {
    const id = req.params.id;
    Product.findById(id)
    .then(product => {
        res.render('edit-product', { path: 'edit', title: 'Edit', prod: product, isAuthenticated: req.session.isLoggedIn })
    })
    .catch(err => console.log(err))
}

exports.postEditProduct = (req, res, next) => {
    const id = req.body.id;
    const updateItem = req.body.item;
    const updateImg = req.body.img;
    const updatePrice = req.body.price;
    const updateDescription = req.body.description;
    Product.findById(id)    // When we want to update element in the database,  we should find the ele first by .findById on the Product
    .then(product => {      // and after that to .save(). NOTICE: when we called .findById(), we get a product with all the functinalty that mongoose provide us - like .save()
        product.item = updateItem;
        product.price = updatePrice;
        product.img = updateImg;
        product.description = updateDescription;
        return product.save()
    })
    .then(result => {
    res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
}

exports.postDeleteProduct = (req, res, next) => {
    const id = req.body.id;
    Product.findByIdAndDelete(id)
    .then(product => {
        console.log('Deleting...', product);
        res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
}

// Authentication Controller:
// NOTICE: The problem is that isAuthenticated is a varibale that need to be shared acrros all the middelware.
// Thing is, that after the user enterd to one of the middelwares, the request is DONE! and we dont have the update isAuthenticatd
// Other words, isAuthenticated is not shared acrros all routes.
// SOLUTION: Cookies and Sessions! 
// NOTICE: Cookies stored on the client side, which mean on the browser. Therefor, with cookies we can share data acrros routes!
// Also, Sessions stored on the server or on the mongodb database - That the goal!

exports.getLogin = ((req, res, next) => {
    let msg = req.flash('log_err');
    if (msg.length > 0) {
        msg = msg[0];
    } else {
        msg = null;
    }

    res.render('login', { path: '/login', isAuthenticated: req.session.isLoggedIn, errorMsg: msg });
})

exports.postLogin = ((req, res, next) => {
    const userEmail = req.body.email;
    const userPassword = req.body.password;
    User.findOne({email: userEmail})
    .then(foundUser => {
        if (!foundUser) {
            req.flash('sign_err', 'User not found, please make sure to subscribe.');
            return res.redirect('/signup');
        } else {
            bcryptjs.compare(userPassword, foundUser.password)  // Compare the value by bcryptjs - return a promise!
            .then(isMatch => {
                if (isMatch) {
                    req.session.user = foundUser;
                    req.session.isLoggedIn = true; //NOTICE: req.session.anyName stored the user data on the server side
                    req.session.save(() => res.redirect('/'));
                } else {
                    req.flash('log_err', 'Invalid email or password'); // Setting flash on the req - The flash will be acsses on the req until the server will use it
                    return res.redirect('/login'); 
                }
            })
        }
    })
})

exports.postLogout = ((req, res, next) => {
        req.session.destroy(() => { // delete the session (not the cookie) for the SAME user
            res.redirect('/');
        })    
})

exports.getSignUp = ((req, res, next) => {
    let msg = req.flash('sign_err');
    if (msg.length > 0) {
        msg = msg[0];
    } else {
        msg = null;
    }
    res.render('signup', { path: '/signup', isAuthenticated: req.session.isLoggedIn, errorMsg: msg })
})

exports.postSignUp = ((req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirm_password;
    User.findOne({email: email})
    .then(user => {
        if (user) {
            return res.redirect('/login');
        } else {
            return bcryptjs.hash(password, 12)  // NOTICE: Using bcryptjs return a promise!
            .then(hashPassword => {
                const newUser = new User({
                    email: email,
                    password: hashPassword,
                    cart: { items: [] }
                });
                return newUser.save();
            })
            .then(newUser => {
                res.redirect('/login');
            })
        }
    })
    .catch(err => console.log(err));    
})