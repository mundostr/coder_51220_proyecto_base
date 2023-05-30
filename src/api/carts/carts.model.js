import mongoose from 'mongoose';
// Es necesario importar el modelo de producto para el populate
import productModel from '../products/products.model.js';

mongoose.pluralize(null); // Importante! para no tener problemas con Mongoose

const collection = 'carts';

// El esquema de este carrito de ejemplo es básico, tan solo un campo de tipo fecha para
// almacenar el día y hora de creación del carrito, la última actualizción y un array con la lista de productos
// (pid = id de producto y qty = cantidad).
// Sobre este array se realiza el populate para tener el detalle completo de productos en la consulta
const schema = new mongoose.Schema({
    created_at: Date,
    updated_at: Date,
    products: [
        {
            pid: { type: mongoose.Schema.Types.ObjectId },
            qty: Number
        }
    ]
});

// Aprovechamos el middleware pre para completar automáticamente el campo de fecha created_at
// cuando se inserta un nuevo registro, y el updated_at cuando se actualiza
schema.pre('save', function (next) {
    this.created_at = new Date();
    next();
});
schema.pre('update', function (next) {
    this.update({}, { $set: { updated_at: new Date() } });
    next();
});

// También se puede activar el populate automático utilizando el middleware pre
// Atención, recordar importar el productModel arriba!
/* schema.pre('find', function() {
    this.populate({ path: 'products.pid', model: productModel });
}); */

const cartModel = mongoose.model(collection, schema);

export default cartModel;