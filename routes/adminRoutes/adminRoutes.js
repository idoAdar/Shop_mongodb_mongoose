const express = require('express');
const adminController = require('../../controller/controller');
const isAuth = require('../../controller/auth/auth');

const route = express.Router();

route.get('/add-product', isAuth, adminController.getNewProduct);

route.post('/add-product', isAuth, adminController.postNewProduct);

route.get('/products', isAuth, adminController.getAdminProducts);

route.get('/edit-product/:id', isAuth, adminController.getEditProduct);

route.post('/edit-product/save', isAuth, adminController.postEditProduct);

route.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = route;