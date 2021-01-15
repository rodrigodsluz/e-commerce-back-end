/* import braintree from 'braintree';
import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox, // Production
  merchantId: process.env.BRAINTREE_MERCHANT_ID!,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY!,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY!,
});

export default {
  generateToken(res: any) {
    gateway.clientToken.generate({}, function (err: any, response: any) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  },

  processPayment(req: any, res: any) {
    const nonceFromTheClient = req.body.paymentMethodNonce;
    const amountFromTheClient = req.body.amount;
    // charge
    const newTransaction = gateway.transaction.sale(
      {
        amount: amountFromTheClient,
        paymentMethodNonce: nonceFromTheClient,
        options: {
          submitForSettlement: true,
        },
      },
      (error: any, result: unknown) => {
        if (error) {
          res.status(500).json(error);
        } else {
          res.json(result);
        }
      },
    );
  },
};
 */
