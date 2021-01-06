import { Request, Response, NextFunction } from 'express';

export default {
  userSignupValidator(req: Request, res: Response, next: NextFunction) {
    req.check('name', 'Name is required').notEmpty();
    req
      .check('email', 'Email must be between 3 to 32 characters')
      .matches(/.+\@.+\..+/)
      .withMessage('Email must contain @')
      .isLength({
        min: 4,
        max: 32,
      });
    req.check('password', 'Password is required').notEmpty();
    req
      .check('password')
      .isLength({ min: 6 })
      .withMessage('Password must contain at least 6 characters')
      .matches(/\d/)
      .withMessage('Password must contain a number');
    const errors = req.validationErrors();
    if (errors) {
      const firstError = errors.map((error: { msg: any }) => error.msg)[0];
      return res.status(400).json({ error: firstError });
    }
    next();
  },
};
