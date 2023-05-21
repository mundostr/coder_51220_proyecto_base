import mongoose from 'mongoose';

const collection = 'users';

const schema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    userName: { type: String, required: true },
    password: { type: String, required: true },
    gender: { type: String, enum: ['F', 'M']},
    avatar: String
});

const userModel = mongoose.model(collection, schema);

export default userModel;