const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('../utils/jwt')


const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if(!user) return res.status(404).json({ message: "data not found"})
        res.status(200).json(user);
    }catch(error){
        console.log(error);
        res.status(500).json({message:"Server Error"});
    }
}

const register = async (req, res) => {
    try {
        const { email, password, role} = req.body;
        const validRoles = ['admin', 'staff', 'user'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                error: true,
                message: 'Invalid role. Allowed roles: admin, staff, guest',
            });
        }


        const hashPassword = await bcrypt.hash(password, 8);
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: true, message: 'Email already exists' });
        }

        const newUser = await User.create({
            email,
            password: hashPassword,
            role
        });

        return res.status(201).json({
            error: false,
            message: 'User created',
            datas: {
                id: newUser.id,
                email: newUser.email,
                role : newUser.role
                
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: 'Server Error' });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: true, message: 'Please fill all the fields' });
        }

        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            return res.status(403).json({ error: true, message: 'Email is incorrect' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(403).json({ error: true, message: 'Invalid password' });
        }

        const tokenjwt = {
            id:user.id,
            email: user.email,
            role: user.role,          
    }

    const token = jwt.creteToken(tokenjwt)
    return res.status(201).json({
        error: false,
        message: 'User created',
        datas: {
            id: user.id,
            email: user.email,
            role : user.role,
            token
        }
    });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: 'Internal Server Error' });
    }
}

const logout = (req, res) => {
    try {
        res.clearCookie('auth-token'); 
        res.status(200).json({ success: true, message: 'Logout successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: 'Internal Server Error' });
    }
}

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: true, message: 'User not found' });
        }
        await User.destroy({ where: { id: userId } });

        return res.status(200).json({ error: false, message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: 'Internal Server Error' });
    }
}

module.exports = {
    getUserById,
    register,
    login,
    logout,
    deleteUser
}