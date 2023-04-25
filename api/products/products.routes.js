import { Router } from "express";
import Products from './products.js';
import { __dirname } from '../../utils.js';

const router = Router();
const manager = new Products(`${__dirname}/data/products.json`);

router.get('/products_index', async (req, res) => {
    const products = await manager.getProducts();
    res.render('index_products', {
        products: products
    });
});

router.get('/products', async (req, res) => {
    try {
        const products = await manager.getProducts();
        res.status(200).send({ status: 'OK', data: products });
    } catch (err) {
        res.status(500).send({ status: 'ERR', error: err });
    }
});

router.post('/products', async (req, res) => {
    try {
        await manager.addProduct(req.body);

        if (manager.checkStatus() === 1) {
            res.status(200).send({ status: 'OK', msg: manager.showStatusMsg() });
        } else {
            res.status(400).send({ status: 'ERR', error: manager.showStatusMsg() });
        }
    } catch (err) {
        res.status(500).send({ status: 'ERR', error: err });
    }
});

router.put('/products', async (req, res) => {
    try {
        const { id, field, data } = req.body;
        await manager.updateProduct(id, field, data);
    
        if (manager.checkStatus() === 1) {
            res.status(200).send({ status: 'OK', msg: manager.showStatusMsg() });
        } else {
            res.status(400).send({ status: 'ERR', error: manager.showStatusMsg() });
        }
    } catch (err) {
        res.status(500).send({ status: 'ERR', error: err });
    }
});

router.delete('/products', async(req, res) => {
    try {
        await manager.deleteProduct(req.body.id);
    
        if (manager.checkStatus() === 1) {
            res.status(200).send({ status: 'OK', msg: manager.showStatusMsg() });
        } else {
            res.status(400).send({ status: 'ERR', error: manager.showStatusMsg() });
        }
    } catch (err) {
        res.status(500).send({ status: 'ERR', error: err });
    }
});

export default router;
