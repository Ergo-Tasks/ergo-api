import { Router } from "express";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

import { User } from "../typeorm/entities/User"
import { restricted } from "../middleware/auth"

const router = Router();

/**
 * MAKE IT WORK
 * THEN MAKE IT BETTER
 * -KIERAN
 */

/**
 * Signup route that creates new User from our typeOrm entities, stores information and encrypts
 * password then saves into db. 
 */
router.post('/', async (req, res) => {
  
  //try-catch to ensure data is being stored/saved properly
  try { 

    //to access and store column variables into a new instance of User
    const body: User = req.body;
    const user = new User();
  
    user.firstName = body.firstName;
    user.lastName = body.lastName;
    user.userName = body.userName;
    user.email = body.email;
    user.tasks = [];
    //hashSync method takes in string, and number for salt. Returns hashed password string.
    user.password = bcrypt.hashSync(body.password, 12);

    //await for data to save in database
    await user.save(); 
    //Send 201 status meaning request was created.
    res.status(201).send();

  } catch(err) {
    res.status(400).json({message: "Bad Request"});
  }

});

/**
 * Login route that finds user by email given in request body, then using bcrypt- checks encrypted
 * password with password in request body. If correct, signs jwt token to user.
 */
router.post('/login', async (req, res) => {

  //try-catch for error handling and for await functionality
  try {

    //accessing request contents
    const body: User = req.body;
    //finds entity that matches user email sent through the request
    const user = await User.findOneOrFail({
      email: body.email
    })
    
    //returns true if request password matches hashed password in database
    if (bcrypt.compareSync(body.password, user.password)) {
      //creating payload for jwt - storing unique unsensitive user data in token for verification later
      const payload = {
        "email": user.email,
        "id": user.id
      }
      //accessing secret from local env and creating jwt token
      const secret = process.env.JWT_SECRET || "default";      
      const token = jwt.sign(payload, secret);
      res.status(200).json({token});

    } else {
        res.status(401).json({message: "Unauthorized"});
    }
    
  } catch (err) {
    res.status(400).json({message: "Bad Request"});
  }
});

/**
 * Goes through restricted middleware to authenticate token. Gets user info by userId params,
 * then returns user info as JSON body.
 */
router.get('/:userId', restricted, async (req, res) => {
  
  const { userId } = req.params;
  const user = await User.findOne({
    id: userId
  });

  if (user) {
    res.status(200).json({user});
  } else {
    res.status(404).json({message: "Bad Request"});
  }

});

/**
 * Update route that finds user by the parameter id. Uses request body to update user fields,
 * then saves to the database.
 */
router.put('/:userId', restricted, async (req, res) => {

  try {

    const { userId } = req.params;
    const body: User = req.body;
    const user = await User.findOneOrFail(userId);
    //hasSync cannot be called without body.password existing, must create conditional.
    const password = body.password ? bcrypt.hashSync(body.password, 12): user.password;

    //Takes in object, and replaces/adds properties from second object passed in.
    Object.assign(user, {
      ...body,
      password
    })

    //.assign only updates the 'user' object, we still have to save to db.
    await user.save();
    res.status(200).json({user});
  } catch (err) {
    res.status(400).json({message: "Bad Request"});
  }
  
});

export default router;