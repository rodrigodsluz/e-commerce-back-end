import { Schema, model } from 'mongoose';

import crypto from 'crypto';

import { v4 as uuid_v4 } from 'uuid';
import { Request } from 'express';

/* export interface UserInterface extends Request {
  profile: any; // or any other type
} */

const UserSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    hashed_password: {
      type: String,
      required: true,
    },
    about: {
      type: String,
      trim: true,
    },
    salt: String,
    role: {
      type: Number,
      default: 0,
    },
    history: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true },
);

UserSchema.virtual('password')
  .set(function (this: any, password: string) {
    this._password = password;
    this.salt = uuid_v4();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function (this: any) {
    return this._password;
  });

UserSchema.methods = {
  authenticate(plainText: string) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },

  encryptPassword(password: string) {
    if (!password) return '';
    try {
      return crypto
        .createHmac('sha1', this.salt)
        .update(password)
        .digest('hex');
    } catch (err) {
      return '';
    }
  },
};

export default model('User', UserSchema);
