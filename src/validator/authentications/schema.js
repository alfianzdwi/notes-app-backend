const Joi = require('joi');
 
const PostAuthenticationPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});
 
const PutAuthenticationPayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
});
 
const DeleteAuthenticationPayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
});
 
module.exports = {
  PostAuthenticationPayloadSchema,
  PutAuthenticationPayloadSchema,
  DeleteAuthenticationPayloadSchema,
};

/**Berbeda dengan pembuatan schema lain, pada schema authentications kita akan membuat lebih dari satu schema. 
 * Karena memang kebutuhan payload tiap routes bisa berbeda. Kita akan membuat schema untuk PostAuthenticationPayloadSchema, PutAuthenticationPayloadSchema, dan DeleteAuthenticationPayloadSchema.  */