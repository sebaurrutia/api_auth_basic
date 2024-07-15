import db from '../dist/db/models/index.js';
import bcrypt from 'bcrypt';

const createUser = async (req) => {
    const {
        name,
        email,
        password,
        password_second,
        cellphone
    } = req.body;
    if (password !== password_second) {
        return {
            code: 400,
            message: 'Passwords do not match'
        };
    }
    const user = await db.User.findOne({
        where: {
            email: email
        }
    });
    if (user) {
        return {
            code: 400,
            message: 'User already exists'
        };
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.User.create({
        name,
        email,
        password: encryptedPassword,
        cellphone,
        status: true
    });
    return {
        code: 200,
        message: 'User created successfully with ID: ' + newUser.id,
    }
};

const getUserById = async (id) => {
    return {
        code: 200,
        message: await db.User.findOne({
            where: {
                id: id,
                status: true,
            }
        })
    };
}

const updateUser = async (req) => {
    const user = db.User.findOne({
        where: {
            id: req.params.id,
            status: true,
        }
    });
    const payload = {};
    payload.name = req.body.name ?? user.name;
    payload.password = req.body.password ? await bcrypt.hash(req.body.password, 10) : user.password;
    payload.cellphone = req.body.cellphone ?? user.cellphone;
    await db.User.update(payload, {
        where: {
            id: req.params.id
        }

    });
    return {
        code: 200,
        message: 'User updated successfully'
    };
}

const deleteUser = async (id) => {
    /* await db.User.destroy({
        where: {
            id: id
        }
    }); */
    const user = db.User.findOne({
        where: {
            id: id,
            status: true,
        }
    });
    await  db.User.update({
        status: false
    }, {
        where: {
            id: id
        }
    });
    return {
        code: 200,
        message: 'User deleted successfully'
    };
}

const getAllUsers = async () => {
    const users = await db.User.findAll({
        where: {
            status: true,
        },
        attributes: { exclude: ['password'] }
    });
    return {
        code: 200,
        message: users,
    };
};

const findUsers = async (filters) => {
    const { name, deleted, loginAntes, loginDespues } = filters;
    const whereClause = {};

    if (deleted !== undefined) { //hacer la consulta deleted=true , lo que significara que el usuario esta eliminado y buscara el "false"
        whereClause.status = deleted === 'true' ? false : true;
    }
    if (name) {
        whereClause.name = {
            [db.Sequelize.Op.like]: `%${name}%`
        };
    }
    if (loginAntes) {
        whereClause.createdAt = {
            [db.Sequelize.Op.lte]: new Date(loginAntes)
        };
    }
    if (loginDespues) {
        whereClause.createdAt = {
            [db.Sequelize.Op.gte]: new Date(loginDespues)
        };
    }

    const users = await db.User.findAll({
        where: whereClause,
        attributes: { exclude: ['password'] }
    });
    return {
        code: 200,
        message: users,
    };
};

const bulkCreate = async (req) => {
    const { users } = req.body;
    
    if (!Array.isArray(users)) {
        return {
            code: 400,
            message: 'Users should be provided as an array'
        };
    }

    let successCount = 0;
    let failureCount = 0;

    for (const user of users) {
        const { name, email, password, password_second, cellphone } = user;

        if (password !== password_second) {
            failureCount++;
            continue;
        }

        const existingUser = await db.User.findOne({ where: { email } });
        if (existingUser) {
            failureCount++;
            continue;
        }

        try {
            const encryptedPassword = await bcrypt.hash(password, 10);
            await db.User.create({
                name,
                email,
                password: encryptedPassword,
                cellphone,
                status: true
            });
            successCount++;
        } catch (error) {
            console.error('Error creating user:', error);
            failureCount++;
        }
    }

    return {
        code: 200,
        message: `Users created successfully: ${successCount}, Users not created: ${failureCount}`
    };

    /*ejemplo de prueba con postman 
en 
http://localhost:3001/api/v1/users/bulkCreate

{
    "users": [
        {
            "name": "Juan",
            "email": "Juan@example.com",
            "password": "4567",
            "password_second": "4567",
            "cellphone": "123456789"
        },
        {
            "name": "Pedro",
            "email": "Pedro@example.com",
            "password": "1234",
            "password_second": "1234",
            "cellphone": "987654321"
        }
    ]
}
*/
};



export default {
    createUser,
    getUserById,
    updateUser,
    deleteUser,
    getAllUsers,
    findUsers,
    bulkCreate,
}