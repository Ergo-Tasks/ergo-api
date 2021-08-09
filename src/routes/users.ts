import { Router } from "express";
import { User } from "../typeorm/entities/User"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import { restricted } from "../middleware/auth"

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

router.get('/:userId', restricted, async (req, res) => {
  
  try {

    const { userId } = req.params;
    const user = await User.findOneOrFail({
      id: userId
    });

    //respond with more than user? http headers too for devs?
    res.status(200).json({user});

  } catch (err) {
    res.status(404).json({message: "Not found"});
  }

});

router.put('/:userId', restricted, async (req, res) => {
  
  try {

    const { userId } = req.params;
    const user = await User.findOneOrFail({
      id: userId
    });
    const body: User = req.body;

    if (body.firstName !== undefined) {
      user.firstName = body.firstName;
    }

    if (body.lastName !== undefined) {
      user.lastName = body.lastName;
    }

    if (body.userName !== undefined) {
      user.userName = body.userName;
    }

    if (body.email !== undefined) {
      user.email = body.email;
    }

    if (body.password !== undefined) {
      user.password = bcrypt.hashSync(body.password, 12);
    }

    await user.save();
    res.status(200).send();

  } catch (err) {
    res.status(400).json({message: "Bad request"});
  }

});

export default router;