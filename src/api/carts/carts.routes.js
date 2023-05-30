import { Router } from "express";
import Carts from './carts.dbclass.js';
import { __dirname } from '../../utils.js';

const router = Router();
const manager = new Carts();

const cartsRoutes = (io) => {
    router.get('/carts', async (req, res) => {
        try {
            const carts = await manager.getCarts();
            res.status(200).send({ status: 'OK', data: carts });
        } catch (err) {
            res.status(500).send({ status: 'ERR', error: err });
        }
    });

    router.get('/carts/:id', async (req, res) => {
        try {
            const carts = await manager.getCartPopulated(req.params.id);
            res.status(200).send({ status: 'OK', data: carts });
        } catch (err) {
            res.status(500).send({ status: 'err', error: err.message });
        }
    })

    router.post('/carts', async (req, res) => {
        try {
            // Verificar que se reciba en el body un array con al menos un producto,
            // recién ahí llamar al método addCart
            const products_array = req.body;
            if (!Array.isArray(products_array.products)) {
                res.status(400).send({ status: 'ERR', message: 'El body debe contener un array products con al menos un producto' });
            } else {
                const process = await manager.addCart(products_array);
                res.status(200).send({ status: 'OK', data: process });
            }
        } catch (err) {
            res.status(500).send({ status: 'ERR', error: err.message });
        }
    });

    router.put('/carts/:id', async (req, res) => {
        try {
            // tiene que pasarse un id y un body con el objeto del nuevo producto, verificar eso
            const product = req.body;
            await manager.updateCart(req.params.id, product);

            if (manager.checkStatus() === 1) {
                res.status(200).send({ status: 'OK', msg: 'Producto agregado al carrito' });
            } else {
                res.status(400).send({ status: 'ERR', error: 'No se pudo agregar el producto al carrito.' });
            }
        } catch (err) {
            res.status(500).send({ status: 'ERR', error: err.message });
        }
    })

    router.put('/carts/:id/products/:pid/:qty', async (req, res) => {
        try {
            await manager.updateProductQty(req.params.id, req.params.pid, req.params.qty);

            if (manager.checkStatus() === 1) {
                res.status(200).send({ status: 'OK', msg: 'Cantidad de producto actualizada' });
            } else {
                res.status(400).send({ status: 'ERR', error: 'No se pudo actualizar cantidad de producto.' });
            }
        } catch (err) {
            res.status(500).send({ status: 'ERR', error: err.message });
        }
        
        
        try {
            const updateProductQty = await manager.updateProductQty(req.params.cid, req.params.pid, req.body)
            res.status(200).send(updateProductQty)


        } catch (err) {
            res.status(500).send({ status: 'ERR', error: err })
        }
    })

    router.delete('/carts/:id', async (req, res) => {
        try {
            await manager.emptyCart(req.params.id);

            if (manager.checkStatus() === 1) {
                res.status(200).send({ status: 'OK', msg: 'Carrito Vaciado' });
            } else {
                res.status(400).send({ status: 'ERR', error: 'No se pudo vaciar el carrito.' });
            }
        } catch (err) {
            res.status(500).send({ status: 'ERR', error: err.message });
        }
    });

    router.delete('/carts/:id/products/:pid', async (req, res) => {
        try {
            await manager.deleteCartProduct(req.params.id, req.params.pid);

            if (manager.checkStatus() === 1) {
                res.status(200).send({ status: 'OK', msg: 'Producto quitado del carrito' });
            } else {
                res.status(400).send({ status: 'ERR', error: 'No se pudo quitar el producto en el carrito.' });
            }
        } catch (err) {
            res.status(500).send({ status: 'ERR', error: err.message });
        }
    });

    return router;
}

export default cartsRoutes;