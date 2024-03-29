import formidable from 'formidable';
import _ from 'lodash';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';
// import errorHandler from '../helpers/dbErrorHandler';

export default {
  create(req: Request, res: Response) {
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(400).json({
          error: 'Image could not be uploaded',
        });
      }
      // check for all fields
      const { name, description, price, category, quantity, shipping } = fields;

      if (
        !name ||
        !description ||
        !price ||
        !category ||
        !quantity ||
        !shipping
      ) {
        return res.status(400).json({
          error: 'All fields are required',
        });
      }

      const product = new Product(fields);

      // 1kb = 1000
      // 1mb = 1000000

      /* if (files.photo) {
        // console.log("FILES PHOTO: ", files.photo);
        if (files.photo.size > 1000000) {
          return res.status(400).json({
            error: 'Image should be less than 1mb in size',
          });
        }

        product.photo.data = fs.readFileSync(files.photo.path);
        product.photo.contentType = files.photo.type;
      } */

      product.save((err, result) => {
        if (err) {
          console.log('PRODUCT CREATE ERROR ', err);
          return res.status(400).json({
            // error: errorHandler(err),
          });
        }
        res.json(result);
      });
    });
  },

  productById(req: any, res: Response, next: NextFunction, id: any) {
    Product.findById(id)
      .populate('category')
      .exec((err, product) => {
        if (err || !product) {
          return res.status(400).json({
            error: 'Product not found',
          });
        }
        req.product = product;
        next();
      });
  },

  read(req: any, res: Response) {
    req.product.photo = undefined;
    return res.json(req.product);
  },

  remove(req: any, res: Response) {
    const { product } = req;
    product.remove((err: any, deletedProduct: any) => {
      if (err) {
        return res.status(400).json({
          // error: errorHandler(err),
        });
      }
      console.log(deletedProduct);
      res.json({
        message: 'Product deleted successfully',
      });
    });
  },

  update(req: any, res: Response) {
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(400).json({
          error: 'Image could not be uploaded',
        });
      }

      let { product } = req;
      product = _.extend(product, fields);

      // 1kb = 1000
      // 1mb = 1000000

      if (files.photo) {
        // console.log("FILES PHOTO: ", files.photo);
        if (files.photo.size > 1000000) {
          return res.status(400).json({
            error: 'Image should be less than 1mb in size',
          });
        }
        product.photo.data = fs.readFileSync(files.photo.path);
        product.photo.contentType = files.photo.type;
      }

      product.save((err: any, result: any) => {
        if (err) {
          return res.status(400).json({
            // error: errorHandler(err),
          });
        }
        res.json(result);
      });
    });
  },

  /**
   * sell / arrival
   * by sell = /products?sortBy=sold&order=desc&limit=4
   * by arrival = /products?sortBy=createdAt&order=desc&limit=4
   * if no params are sent, then all products are returned
   */

  list(req: any, res: Response) {
    const order = req.query.order ? req.query.order : 'asc';
    const sortBy = req.query.sortBy ? req.query.sortBy : '_id';
    const limit = req.query.limit ? parseInt(req.query.limit) : 6;

    Product.find()
      .select('-photo')
      .populate('category')
      .sort([[sortBy, order]])
      .limit(limit)
      .exec((err, products) => {
        if (err) {
          return res.status(400).json({
            error: 'Products not found',
          });
        }
        res.json(products);
      });
  },

  /**
   * it will find the products based on the req product category
   * other products that has the same category, will be returned
   */

  listRelated(req: any, res: Response) {
    const limit = req.query.limit ? parseInt(req.query.limit) : 6;

    Product.find({ _id: { $ne: req.product }, category: req.product.category })
      .limit(limit)
      .populate('category', '_id name')
      .exec((err, products) => {
        if (err) {
          return res.status(400).json({
            error: 'Products not found',
          });
        }
        res.json(products);
      });
  },

  listCategories(res: Response) {
    Product.distinct('category', {}, (err, categories) => {
      if (err) {
        return res.status(400).json({
          error: 'Categories not found',
        });
      }
      res.json(categories);
    });
  },

  /**
   * list products by search
   * we will implement product search in react frontend
   * we will show categories in checkbox and price range in radio buttons
   * as the user clicks on those checkbox and radio buttons
   * we will make api request and show the products to users based on what he wants
   */

  listBySearch(req: any, res: Response) {
    const order = req.body.order ? req.body.order : 'desc';
    const sortBy = req.body.sortBy ? req.body.sortBy : '_id';
    const limit = req.body.limit ? parseInt(req.body.limit) : 100;
    const skip = parseInt(req.body.skip);
    const findArgs = {};

    // console.log(order, sortBy, limit, skip, req.body.filters);
    // console.log("findArgs", findArgs);

    for (const key in req.body.filters) {
      if (req.body.filters[key].length > 0) {
        if (key === 'price') {
          // gte -  greater than price [0-10]
          // lte - less than
          const findArgs: any = {};

          findArgs[key] = {
            $gte: req.body.filters[key][0],
            $lte: req.body.filters[key][1],
          };
        } else {
          const findArgs: any = {};

          findArgs[key] = req.body.filters[key]!;
        }
      }
    }

    Product.find(findArgs)
      .select('-photo')
      .populate('category')
      .sort([[sortBy, order]])
      .skip(skip)
      .limit(limit)
      .exec((err, data) => {
        if (err) {
          return res.status(400).json({
            error: 'Products not found',
          });
        }
        res.json({
          size: data.length,
          data,
        });
      });
  },

  photo(req: any, res: Response, next: NextFunction) {
    if (req.product.photo.data) {
      res.set('Content-Type', req.product.photo.contentType);
      return res.send(req.product.photo.data);
    }
    next();
  },

  listSearch(req: Request, res: Response) {
    // create query object to hold search value and category value
    const query: any = {};
    // assign search value to query.name
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
      // assigne category value to query.category
      if (req.query.category && req.query.category != 'All') {
        query.category = req.query.category;
      }
      // find the product based on query object with 2 properties
      // search and category
      Product.find(query, (err, products) => {
        if (err) {
          return res.status(400).json({
            // error: errorHandler(err),
          });
        }
        res.json(products);
      }).select('-photo');
    }
  },

  decreaseQuantity(req: Request, res: Response, next: NextFunction) {
    const bulkOps = req.body.order.products.map(
      (item: { _id: any; count: number }) => {
        return {
          updateOne: {
            filter: { _id: item._id },
            update: { $inc: { quantity: -item.count, sold: +item.count } },
          },
        };
      },
    );

    Product.bulkWrite(bulkOps, {}, (error, products) => {
      if (error) {
        return res.status(400).json({
          error: 'Could not update product',
        });
      }
      console.log(products);
      next();
    });
  },
};
