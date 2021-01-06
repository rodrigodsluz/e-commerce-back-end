import { Router } from 'express';

import authController, { requireSignin } from './controllers/AuthController';
import userController from './controllers/UserController';
import categoryController from './controllers/CategoryController';
import productController from './controllers/ProductController';
import braintreeController from './controllers/BraintreeController';
import orderController from './controllers/OrderController';

import userSignupValidator from './validator';

const router = Router();

// ----------------------Auth routers----------------------
router.post('/signup', userSignupValidator, authController.signup);
router.post('/signin', authController.signin);
router.get('/signout', authController.signout);

// ----------------------User routers----------------------
router.param('userId', userController.userById);

router.get(
  '/secret/:userId',
  requireSignin,
  authController.isAuth,
  authController.isAdmin,
  (req, res) => {
    res.json({
      user: req.profile,
    });
  },
);

router.get(
  '/user/:userId',
  requireSignin,
  authController.isAuth,
  userController.read,
);

router.put(
  '/user/:userId',
  requireSignin,
  authController.isAuth,
  userController.update,
);

router.get(
  '/orders/by/user/:userId',
  requireSignin,
  authController.isAuth,
  userController.purchaseHistory,
);

// ----------------------Category routers----------------------
router.post(
  '/category/create/:userId',
  requireSignin,
  authController.isAuth,
  authController.isAdmin,
  categoryController.create,
);

router.param('categoryId', categoryController.categoryById);

router.get('/category/:categoryId', categoryController.read);

router.put(
  '/category/:categoryId/:userId',
  requireSignin,
  authController.isAuth,
  authController.isAdmin,
  categoryController.update,
);

router.delete(
  '/category/:categoryId/:userId',
  requireSignin,
  authController.isAuth,
  authController.isAdmin,
  categoryController.remove,
);

router.get('/categories', categoryController.list);

// ----------------------Product routers----------------------
router.post(
  '/product/create/:userId',
  requireSignin,
  authController.isAuth,
  authController.isAdmin,
  productController.create,
);

router.param('productId', productController.productById);

router.get('/product/:productId', productController.read);

router.delete(
  '/product/:productId/:userId',
  requireSignin,
  authController.isAuth,
  authController.isAdmin,
  productController.remove,
);

router.put(
  '/product/:productId/:userId',
  requireSignin,
  authController.isAuth,
  authController.isAdmin,
  productController.update,
);

router.get('/products', productController.list);

router.get('/products/search', productController.listSearch);

router.get('/products/related/:productId', productController.listRelated);

router.get('/products/categories', productController.listCategories);

router.post('/products/by/search', productController.listBySearch);

router.get('/product/photo/:productId', productController.photo);

// ----------------------Braintree payment----------------------
router.get(
  '/braintree/getToken/:userId',
  requireSignin,
  authController.isAuth,
  braintreeController.generateToken,
);
router.post(
  '/braintree/payment/:userId',
  requireSignin,
  authController.isAuth,
  braintreeController.processPayment,
);

// ----------------------Orders----------------------

router.post(
  '/order/create/:userId',
  requireSignin,
  authController.isAuth,
  userController.addOrderToUserHistory,
  productController.decreaseQuantity,
  orderController.create,
);

router.get(
  '/order/list/:userId',
  requireSignin,
  authController.isAuth,
  authController.isAdmin,
  orderController.listOrders,
);

router.get(
  '/order/status-values/:userId',
  requireSignin,
  authController.isAuth,
  authController.isAdmin,
  orderController.getStatusValues,
);
router.put(
  '/order/:orderId/status/:userId',
  requireSignin,
  authController.isAuth,
  authController.isAdmin,
  orderController.updateOrderStatus,
);

router.param('orderId', orderController.orderById);

export default router;
