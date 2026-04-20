import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  PORT: Joi.number().integer().min(1).max(65535).required(),
  DB_HOST: Joi.string().trim().min(1).required(),
  DB_PORT: Joi.number().integer().min(1).max(65535).required(),
  DB_USER: Joi.string().trim().min(1).required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().trim().min(1).required(),
  DB_SYNC: Joi.string().valid('true', 'false').required(),
});
