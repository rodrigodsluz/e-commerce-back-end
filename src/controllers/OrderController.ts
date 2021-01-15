import sgMail from '@sendgrid/mail';
import { NextFunction, Request } from 'express';
// import errorHandler from '../helpers/dbErrorHandler';
import Order from '../models/Order';

// sendgrid for email npm i @sendgrid/mail
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export default {
  orderById(req: any, res: any, next: NextFunction, id: any) {
    Order.findById(id)
      .populate('products.product', 'name price')
      .exec((err, order) => {
        if (err || !order) {
          return res.status(400).json({
            // error: errorHandler(err),
          });
        }
        req.order = order;
        next();
      });
  },

  create(req: any, res: any) {
    console.log('CREATE ORDER: ', req.body);
    req.body.order.user = req.profile;
    const order: any = new Order(req.body.order);
    order.save((error: any, data: any) => {
      if (error) {
        return res.status(400).json({
          // error: errorHandler(error),
        });
      }
      // send email alert to admin
      // order.address
      // order.products.length
      // order.amount
      const emailData = {
        to: 'rodrigodsluz@gmail.com',
        from: 'rodrigodsluz@gmail.com',
        subject: `A new order is received`,
        html: `
            <p>Customer name:</p>
            <p>Total products: ${order.products.length}</p>
            <p>Total cost: ${order.amount}</p>
            <p>Login to dashboard to the order in detail.</p>
        `,
      };
      sgMail
        .send(emailData)
        .then(() => {
          console.log('Email sent');
        })
        .catch(error => {
          console.error(error);
        });
      res.json(data);
    });
  },

  listOrders(req: Request, res: any) {
    Order.find()
      .populate('user', '_id name address')
      .sort('-created')
      .exec((err, orders) => {
        if (err) {
          return res.status(400).json({
            // error: errorHandler(error),
          });
        }
        res.json(orders);
      });
  },

  /* getStatusValues(res: any) {
    res.json(Order.schema.path('status').enumValues);
  },

  updateOrderStatus(req: any, res: any) {
    Order.update(
      { _id: req.body.orderId },
      { $set: { status: req.body.status } },
      (err: string, order: any) => {
        if (err) {
          return res.status(400).json({
            // error: errorHandler(err),
          });
        }
        res.json(order);
      },
    );
  }, */
};
