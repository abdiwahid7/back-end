const db = require('../models/indexStart')
const bcrypt = require('bcrypt')
const createError = require('http-errors')
const {signAccessToken, signRefreshToken} = require('../helpers/JWT')
const {authSchema} = require('../helpers/validationSchema');
const User = db.users;


module.exports = {


    register: async (req, res, next) => {
        try{
            const {email, password} = await authSchema.validateAsync(req.body)
            const exists = await User.findOne({where: {email}})
            if(exists){
                throw createError.Conflict(`${email} has already been registred`)
            }

            const newUser = new User({email, password})
            const savedUser = await newUser.save()

            const accesToken = await signAccessToken(savedUser.user_id)
            res.status(200).send({accesToken})

        }
        catch(error){
            throw(error)
        }
    },


    getAllUser: async (req, res, next) =>{
        try{
            const user = await User.findAll({})
            res.status(200).send(user)
        }
        catch(error){
            next(error)
        }
    },

    getUserById: async (req, res, next) =>{
        try{
            const id = req.params.user_id
            const user = await  User.findOne({where: {user_id: id}})
            res.status(200).send(user)
        }
        catch(error){
            next(error)
        }
    },

    updateUser: async (req, res, next) => {
        try {
            const id = req.params.user_id;
    
            // Destructure the inputs from the request body
            const { email, password, role } = req.body;
    
            // Prepare an object to hold the updated information
            const updatedInfo = {};
    
            // Validate and add email if provided
            if (email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    throw createError.BadRequest('Invalid email format');
                }
                updatedInfo.email = email;
            }
    
            // Validate and hash password if provided
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                updatedInfo.password = hashedPassword;
            }
    
            // Validate and add role if provided
            if (role) {
                const validRoles = ['admin', 'user']; // Adjust based on your application roles
                if (!validRoles.includes(role)) {
                    throw createError.BadRequest('Invalid role specified');
                }
                updatedInfo.role = role;
            }
    
            // Ensure at least one field is being updated
            if (Object.keys(updatedInfo).length === 0) {
                throw createError.BadRequest('No valid fields provided for update');
            }
    
            // Update the user in the database
            const [affectedRows] = await User.update(updatedInfo, { where: { user_id: id } });
    
            if (!affectedRows) {
                throw createError.NotFound(`User with id ${id} is not registered`);
            }
    
            // Send a success response
            res.status(200).send({ message: `User with id ${id} has been updated successfully` });
        } catch (error) {
            next(error);
        }
    },
    
    


    deleteUser: async(req, res, next) => {
        try{
            const id = req.params.user_id
            const user = await  User.destroy({where: {user_id: id}})
            res.status(200).send(`user with id ${id} has been deleted`)
        }
        catch(error){
            next(error)
        }
    },


    login: async (req, res, next) => {
        try {
          console.log("Login request received:", req.body);
          const result = await authSchema.validateAsync(req.body);
          const user = await User.findOne({ where: { email: result.email } });
          if (!user) throw createError.NotFound("User Not Registered");
      
          const isMatch = await user.isValidPassword(result.password);
          if (!isMatch) throw createError.Unauthorized("Invalid username/password");
      
          const accessToken = await signAccessToken(user.user_id);
          const refreshToken = await signRefreshToken(user.user_id);
          console.log("Tokens generated:", { accessToken, refreshToken });
      
          res.send({ accessToken, refreshToken });
        } catch (error) {
          console.error("Login error:", error);
          if (error.isJoi === true) return next(createError.BadRequest("Invalid username/password"));
          next(error);
        }
      }
      


}