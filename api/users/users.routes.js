import { Router } from "express";
import Users from './users.js';
import { __dirname } from '../../utils.js';

const router = Router();
const manager = new Users(`${__dirname}/data/users.json`);

router.get('/users_index', async (req, res) => {
    const users = await manager.getUsers();
    res.render('index', {
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

        if (manager.checkStatus() === 1) {
            res.status(200).send({ status: 'OK', msg: manager.showStatusMsg() });
        } else {
            res.status(400).send({ status: 'ERR', error: manager.showStatusMsg() });
        }
    } catch (err) {
        res.status(500).send({ status: 'ERR', error: err });
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

export default router;
