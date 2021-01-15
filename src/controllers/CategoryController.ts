import { Request, Response, NextFunction } from 'express';
import Category from '../models/Category';

// import errorHandler from '../helpers/dbErrorHandler';

import Product from '../models/Product';

export default {
  create(req: Request, res: Response) {
    const category = new Category(req.body);
    category.save((err, data) => {
      if (err) {
        return res.status(400).json({
          //error: errorHandler(err),
        });
      }
      res.json({ data });
    });
  },

  categoryById(req: any, res: Response, next: NextFunction, id: any) {
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

  read(req: any, res: Response) {
    return res.json(req.category);
  },

  update(req: any, res: Response) {
    console.log('req.body', req.body);
    console.log('category update param', req.params.categoryId);

    const { category } = req;
    category.name = req.body.name;
    category.save((err: any, data: any) => {
      if (err) {
        return res.status(400).json({
          //error: errorHandler(err),
        });
      }
      res.json(data);
    });
  },

  remove(req: any, res: Response) {
    const { category } = req;
    Product.find({ category }).exec((err, data) => {
      if (data.length >= 1) {
        return res.status(400).json({
          message: `Sorry. You cant delete ${category.name}. It has ${data.length} associated products.`,
        });
      }
      category.remove((err: any) => {
        if (err) {
          return res.status(400).json({
            //error: errorHandler(err),
          });
        }
        res.json({
          message: 'Category deleted',
        });
      });
    });
  },

  list(req: any, res: Response) {
    Category.find().exec((err, data) => {
      if (err) {
        return res.status(400).json({
          //error: errorHandler(err),
        });
      }
      res.json(data);
    });
  },
};
