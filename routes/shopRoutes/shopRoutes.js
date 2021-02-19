const express = require('express');
const shopController = require('../../controller/controller');
const isAuth = require('../../controller/auth/auth');

const route = express.Router();

route.post('/signup', shopController.postSignUp);

route.get('/signup', shopController.getSignUp);

route.post('/logout', shopController.postLogout);

route.get('/login', shopController.getLogin);

route.post('/login', shopController.postLogin);

route.get('/cart', isAuth, shopController.getCart);

route.post('/cart/deleteItem', isAuth, shopController.postDeleteFromCart);

route.post('/cart', isAuth, shopController.postCart);

route.get('/:productId', shopController.getProduct);

route.get('/', shopController.getStart);

module.exports = route;