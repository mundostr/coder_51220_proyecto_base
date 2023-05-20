import crypto from 'crypto';
import { Router } from "express";
import userModel from './users/users.model.js';
import Products from './products/products.dbclass.js';

const manager = new Products();

const mainRoutes = (io) => {
    const router = Router();
    
    router.get('/', async (req, res) => {
        if (req.session.userValidated) {
            const products = await manager.getProducts();
            res.render('products', { products: products });
        } else {
            res.render('login', {
                sessionInfo: req.session
            });
        }
    });

    router.get('/logout', async (req, res) => {
        req.session.destroy();
        res.redirect('http://localhost:3000');
    });

    router.post('/login', async (req, res) => {
        const { login_email, login_password } = req.body;
        const user = await userModel.findOne({ userName: login_email, password: crypto.createHash('sha256').update(login_password).digest('hex')});
        if (user) { // Hay coincidencia, los datos son válidos
            req.session.userValidated = true;
            req.session.errorMessage = '';
        } else {
            req.session.userValidated = false;
            req.session.errorMessage = 'Usuario o clave no válidos';
        }

        res.redirect('http://localhost:3000');
    });
    
    return router;
}

export default mainRoutes;