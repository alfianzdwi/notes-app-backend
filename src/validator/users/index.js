const InvariantError = require("../../exceptions/InVariantError");
const { UserPayloadSchema } = require("./schema")


const UsersValidator = {
    //Fungsi validateUserPayload untuk memvalidasi data payload (dari parameternya) berdasarkan UserPayloadSchema yang sudah kita buat di schema.js.
    validateUserPayload: (payload) => {
        const validationResult = UserPayloadSchema.validate(payload);

        if(validationResult.error){
            throw new InvariantError(validationResult.error.message);
        }
    },
};

module.exports = UsersValidator;