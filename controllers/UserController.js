import { Router } from 'express';
import UserService from '../services/UserService.js';
import NumberMiddleware from '../middlewares/number.middleware.js';
import UserMiddleware from '../middlewares/user.middleware.js';
import AuthMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/create', async (req, res) => {
    const response = await UserService.createUser(req);
    res.status(response.code).json(response.message);
});

router.get('/getAllUsers',  async (req, res) => {
    const response = await UserService.getAllUsers();
    res.status(response.code).json(response.message);
});

router.get('/findUsers', async (req, res) => {
    const response = await UserService.findUsers(req.query);
    res.status(response.code).json(response.message);
});

router.post('/bulkCreate', async (req, res) => {
    try {
        const response = await UserService.bulkCreate(req);
        res.status(response.code).json(response.message);
    } catch (error) {
        console.error('Error handling bulkCreateUsers:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


router.get(
    '/:id',
    [
        NumberMiddleware.isNumber,
        UserMiddleware.isValidUserById,
        AuthMiddleware.validateToken,
        UserMiddleware.hasPermissions
    ],
    async (req, res) => {
        const response = await UserService.getUserById(req.params.id);
        res.status(response.code).json(response.message);
});

router.put('/:id', [
        NumberMiddleware.isNumber,
        UserMiddleware.isValidUserById,
        AuthMiddleware.validateToken,
        UserMiddleware.hasPermissions,
    ],
    async(req, res) => {
        const response = await UserService.updateUser(req);
        res.status(response.code).json(response.message);
});

router.delete('/:id',
    [
        NumberMiddleware.isNumber,
        UserMiddleware.isValidUserById,
        AuthMiddleware.validateToken,
        UserMiddleware.hasPermissions,
    ],
    async (req, res) => {
       const response = await UserService.deleteUser(req.params.id);
       res.status(response.code).json(response.message);
});


export default router;