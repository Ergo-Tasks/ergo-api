import { NextFunction, Router, Request, Response } from "express";
import { User } from "../typeorm/entities/User"
import bcrypt from "bcrypt"
import { getRepository } from "typeorm";
import jwt from "jsonwebtoken";

const router = Router();

/**
 * MAKE IT WORK
 * THEN MAKE IT BETTER
 * -KIERAN
 */

//creating post endpoint to create user
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
    //hashSync method takes in string, and number for salt. Returns hashed password string.
    user.password = bcrypt.hashSync(body.password, 12);

    //await for data to save in database
    await user.save(); 
    //Send 201 status meaning request was created.
    res.status(201).send();

  } catch(err) {
    res.status(400).json({message: "Bad request"});
  }

});

//creating post endpoint to return auth token
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
      throw new Error;
    }
    
  } catch (err) {
    res.status(401).json({message: "Bad request"});
  }
});

export default router;