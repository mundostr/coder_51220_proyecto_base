import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const collection = 'products';

const schema = new mongoose.Schema({
    id: Number,
    title: { type: String, required: true, index: true }, // índice de búsqueda habilitado para este campo
    description: String,
    price: { type: Number, required: true },
    discountPercentage: Number,
    rating: { type: Number, required: true },
    stock: { type: Number, required: true },
    brand: String,
    category: String,
    thumbnail: String,
    images: [String]
});
// Para utilizar paginado automático, basta con insertar el módulo mongoose-paginate-v2 como plugin
schema.plugin(mongoosePaginate);

const productModel = mongoose.model(collection, schema);

export default productModel;