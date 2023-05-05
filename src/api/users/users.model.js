import mongoose from 'mongoose';

const collection = 'users';

const schema = new mongoose.Schema({
    id: Number,
    firstName: { type: String, required: true },
    lastName: String,
    userName: String,
    password: String
});

const userModel = mongoose.model(collection, schema);

export default userModel;