import { Request, Response, NextFunction } from 'express';

import jwt from 'jsonwebtoken'; // To generate signed token
import expressJwt from 'express-jwt'; // For authorization check

import User from '../models/User';

// import errorHandler from '../helpers/dbErrorHandler';

export default {
  signup(req: Request, res: Response) {
    // console.log('req.body', req.body);
    const user = new User(req.body);
    user.save((err, user) => {
      if (err) {
        return res.status(400).json({
          // err: errorHandler(err),
        });
      }
      user.salt = undefined;
      user.hashed_password = undefined;
      res.json({
        user,
      });
    });
  },

  signin(req: Request, res: Response) {
    // Find the user based on email
    const { email, password } = req.body;
    User.findOne({ email }, (err, user) => {
      if (err || !user) {
        return res.status(400).json({
          error: 'User with that email does not exist. Please signup!',
        });
      }
      // If user is found make sure the email and password match
      // Create authenticate method in user models
      if (!user.authenticate(password)) {
        return res.status(401).json({
          error: 'Email and password dont math',
        });
      }

      // Generate a signed token with user id and secret
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

      // Persist the token as 't' in cookie with expire date
      res.cookie('t', token, { expire: new Date() + 9999 });

      // Return response with user and token to frontend client
      const { _id, name, email, role } = user;
      return res.json({ token, user: { _id, email, name, role } });
    });
  },

  signout(req: Request, res: Response) {
    res.clearCookie('t');
    res.json({ message: 'Signout success' });
  },

  isAuth(req: any, res: Response, next: NextFunction) {
    const user = req.profile && req.auth && req.profile._id == req.auth._id;
    if (!user) {
      return res.status(403).json({
        error: 'Access denied',
      });
    }
    next();
  },

  isAdmin(req: any, res: Response, next: NextFunction) {
    if (req.profile.role === 0) {
      return res.status(403).json({
        error: 'Admin resourse! Access denied',
      });
    }
    next();
  },
};

export const requireSignin = expressJwt({
  secret: process.env.JWT_SECRET!,
  algorithms: ['HS256'], // added later
  userProperty: 'auth',
});
