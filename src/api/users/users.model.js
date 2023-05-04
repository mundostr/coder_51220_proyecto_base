import mongoose from 'mongoose';

const collection = 'users';

const schema = new mongoose.Schema({
    _id: String,
    id: Number,
    firstName: String,
    lastName: String,
    userName: String,
    password: String
});

const userModel = mongoose.model(collection, schema);

export default userModel;