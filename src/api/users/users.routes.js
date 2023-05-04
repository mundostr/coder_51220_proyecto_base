import { Router } from "express";
import Users from './users.class.js';
import { __dirname } from '../../utils.js';

// Exportamos todo el paquete de endpoints como función (userRoutes) que toma un argumento (io)
// de esta manera al importarlo en server, podremos "inyectar" io para emitir eventos desde aquí
const userRoutes = (io) => {
    const router = Router();
    const manager = new Users(`${__dirname}/data/users.json`);
    
    router.get('/users_index', async (req, res) => {
        const users = await manager.getUsers();
        res.render('users_index', {
            users: users
        });
    });
    
    router.get('/users', async (req, res) => {
        try {
            const users = await manager.getUsers();
            res.status(200).send({ status: 'OK', data: users });
        } catch (err) {
            res.status(500).send({ status: 'ERR', error: err });
        }
    });
    
    router.post('/users', async (req, res) => {
        try {
            await manager.addUser(req.body);
            // Al haber "inyectado" io, podemos emitir eventos sin problemas al socket
            io.emit('new_user', req.body);
    
            if (manager.checkStatus() === 1) {
                res.status(200).send({ status: 'OK', msg: manager.showStatusMsg() });
            } else {
                res.status(400).send({ status: 'ERR1', error: manager.showStatusMsg() });
            }
        } catch (err) {
            console.error(err);
            res.status(500).send({ status: 'ERR2', error: err });
        }
    });
    
    router.put('/users', async (req, res) => {
        try {
            const { id, field, data } = req.body;
            await manager.updateUser(id, field, data);
        
            if (manager.checkStatus() === 1) {
                res.status(200).send({ status: 'OK', msg: manager.showStatusMsg() });
            } else {
                res.status(400).send({ status: 'ERR', error: manager.showStatusMsg() });
            }
        } catch (err) {
            res.status(500).send({ status: 'ERR', error: err });
        }
    });
    
    router.delete('/users', async(req, res) => {
        try {
            await manager.deleteUser(req.body.id);
        
            if (manager.checkStatus() === 1) {
                res.status(200).send({ status: 'OK', msg: manager.showStatusMsg() });
            } else {
                res.status(400).send({ status: 'ERR', error: manager.showStatusMsg() });
            }
        } catch (err) {
            res.status(500).send({ status: 'ERR', error: err });
        }
    });

    return router;
}

export default userRoutes;
