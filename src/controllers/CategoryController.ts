import Category from '../models/Category';

import { errorHandler } from '../helpers/dbErrorHandler';

import Product from '../models/Product';

export default {
  create(req, res) {
    const category = new Category(req.body);
    category.save((err, data) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json({ data });
    });
  },

  categoryById(req, res, next, id) {
    Category.findById(id).exec((err, category) => {
      if (err || !category) {
        return res.status(400).json({
          error: 'Category does not exist',
        });
      }
      req.category = category;
      next();
    });
  },

  read(req, res) {
    return res.json(req.category);
  },

  update(req, res) {
    console.log('req.body', req.body);
    console.log('category update param', req.params.categoryId);

    const { category } = req;
    category.name = req.body.name;
    category.save((err, data) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json(data);
    });
  },

  remove(req, res) {
    const { category } = req;
    Product.find({ category }).exec((err, data) => {
      if (data.length >= 1) {
        return res.status(400).json({
          message: `Sorry. You cant delete ${category.name}. It has ${data.length} associated products.`,
        });
      }
      category.remove((err, data) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err),
          });
        }
        res.json({
          message: 'Category deleted',
        });
      });
    });
  },

  list(req, res) {
    Category.find().exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json(data);
    });
  },
};
