const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');
const bcrypt = require ('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

// @route GET api/auth
// @desc  Test route 
// @access Public

router.get('/', auth , async (req , res) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch {
        console.error(err.message);
        res.status(500).send('server error');
    }
} );


// @route POST api/auth
// @desc  authenticate & get token
// @access Public

router.post('/',[
    check('email','email should be correct').isEmail(),
    check('password','password required').exists()
],
async (req , res) =>  {

    const errors =validationResult(req);

    if (!errors.isEmpty()){
        return res.status(400).json({errors : errors.array});
    }

    const {email , password} = req.body;

    try {

    // see if user doesnt exist 

    let user = await User.findOne({email});
    if(!user){
       return res.status(400).json({errors: [{msg: 'invalid credentials'}]});
    }


    // compare password entered with password existant

    const isMatch = await bcrypt.compare(password, user.password);

    // check if they are tha same 

    if (!isMatch){

        return res.status(400).json({errors: [{msg: 'invalid credentials'}]});

    }


    //Return jsonwebtoken

    const payload ={
        user: {
            id: user.id
        }
    }

    jwt.sign(
        payload,
         config.get('jwtSecret'),
         {expiresIn: 360000},
         (err, token) => {
             if(err) throw err;
             res.json({ token });
            
    });

    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
    
    

   

});

module.exports = router ;