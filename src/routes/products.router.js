const express = require('express');
const productsController = require('../controllers/products.controller');
const productsRouter = express.Router();

productsRouter.post('/', productsController.createProduct);
productsRouter.get('/', productsController.getAllProducts);
productsRouter.get('/:productId', productsController.getProductById);
productsRouter.put('/:productId', productsController.updateProductById);
productsRouter.delete('/:productId', productsController.deleteProductById);


module.exports = productsRouter;