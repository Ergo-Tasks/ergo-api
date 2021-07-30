import { NextFunction, Router, Request, Response } from "express";
import { User } from "../typeorm/entities/User"
import bcrypt from "bcrypt"
import { getRepository } from "typeorm";

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



export default router;