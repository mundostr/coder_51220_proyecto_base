import fs from 'fs';
import crypto from 'crypto';

class Products {
    constructor(path) {
        this.path = path; // Ruta archivo registro productos
        this.latestId = 1;
        this.products = [];
        this.status = 0;
        this.statusMsg = "inicializado";
    }

    static requiredFields = ['description', 'price', 'stock'];

    static #verifyRequiredFields = (obj) => {
        return Products.requiredFields.every(field => Object.prototype.hasOwnProperty.call(obj, field) && obj[field] !== null);
    }

    static #objEmpty (obj) {
        return Object.keys(obj).length === 0;
    }

    #readProductsFromFile = async () => {
        const data = await fs.promises.readFile(this.path, 'utf-8');
        return data === '' ? [] : JSON.parse(data);
    }


    checkStatus = () => {
        return this.status;
    }

    showStatusMsg = () => {
        return this.statusMsg;
    }

    addProduct = async (product) => {
        try {
            if (!Products.#objEmpty(product) && Products.#verifyRequiredFields(product)) {
                this.products = await this.#readProductsFromFile();

                this.latestId = this.products[this.products.length - 1].id;
                this.products.push({ id: ++this.latestId, ...product });
                await fs.promises.writeFile(this.path, JSON.stringify(this.products));
                
                this.status = 1;
                this.statusMsg = "Producto registrado en archivo";
            } else {
                this.status = -1;
                this.statusMsg = `Faltan campos obligatorios (${Products.requiredFields.join(', ')})`;
            }
        } catch (err) {
            this.status = -1;
            this.statusMsg = `AddProduct: ${err}`;
        }
    }

    getProducts = async () => {
        try {
            const products = await this.#readProductsFromFile();
            this.status = 1;
            this.statusMsg = 'Productos recuperados';
            return products;
        } catch (err) {
            this.status = -1;
            this.statusMsg = `getProducts: ${err}`;
        }
    }

    getProductById = async (id) => {
        try {
            this.status = 1;
            const products = await this.#readProductsFromFile();
            const product = products.find(product => product.id === id);

            if (product) return product;

            this.status = -1;
            this.statusMsg = "Producto no encontrado";
            return {};
        } catch (err) {
            this.status = -1;
            this.statusMsg = `getProductById: ${err}`;
        }
    }

    updateProduct = async (id, field, data) => {
        try {
            if (id == undefined || field == undefined || data == undefined) {
                this.status = -1;
                this.statusMsg = "Se requiere body con id, field y data";
            } else {
                const products = await this.#readProductsFromFile();
                const index = products.findIndex(product => product.id === id);
    
                if (index === -1) {
                    this.status = -1;
                    this.statusMsg = "ID no encontrado";
                    return;
                }
    
                products[index][field] = data;
                await fs.promises.writeFile(this.path, JSON.stringify(products));
                this.status = 1;
                this.statusMsg = "Producto actualizado";
            }
        } catch (err) {
            this.status = -1;
            this.statusMsg = `updateProduct: ${err}`;
        }
    }

    deleteProduct = async (id) => {
        try {
            const products = await this.#readProductsFromFile();
            const productsFiltered = products.filter(product => product.id !== id);

            if (productsFiltered.length === products.length) {
                this.status = -1;
                this.statusMsg = "ID no encontrado";
                return;
            }

            await fs.promises.writeFile(this.path, JSON.stringify(productsFiltered));
            this.status = 1;
            this.statusMsg = "Producto borrado";
        } catch (err) {
            this.status = -1;
            this.statusMsg = `deleteProduct: ${err}`;
        }
    }
}

export default Products;