const productModel = require('../models/products.model');

// create
async function createProduct(req, res, next) {
  try {
    const createdProduct = await productModel.create(req.body);
    res.status(201).json(createdProduct);
  } catch (error) {
    next(error);
  }
};

// read all
async function getAllProducts(req, res, next) {
  try {
    const allProducts = await productModel.find({});
    res.status(200).json(allProducts);
  } catch (error) {
    next(error);
  }
};

// read 
async function getProductById(req, res, next) {
  try {
    const productId = await productModel.findById(req.params.productId);
    if (productId) {
      res.status(200).json(productId);
    } else {
      res.status(404).send();
    }
  } catch (error) {
    next(error);
  }
};

// update
async function updateProductById(req, res, next) {
  try {
    let updatedProduct = await productModel.findByIdAndUpdate(req.params.productId, req.body, {new: true});
    if (updatedProduct) {
      res.status(200).json(updatedProduct);
    } else {
      res.status(404).send();
    }
  } catch (error) {
    next(error);
  }
};

// delete
async function deleteProductById(req, res, next) {
  try {
    let deletedProduct = await productModel.findByIdAndDelete(req.params.productId);
    if (deletedProduct) {
      res.status(200).json(deletedProduct);
    } else {
      res.status(404).send();
    }
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById
};