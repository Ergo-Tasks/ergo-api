import jwt, { verify } from "jsonwebtoken";
import { NextFunction, Request, Response, Router } from "express";
import { User } from "../typeorm/entities/User";


//No generic type for jwt.verify, so we are using interface
interface jwtPayload {
  email: string,
  id: string
}

/**
 * Reads token from request header and jwt verifies it, handles cases for when the token
 * doesn't exist, parses incorrectly, is invalid one, and is valid.
 * 
 * @param req - Express request sent by client
 * @param res - Express response to send back to client
 * @param next - Function to move to next middleware
 */
export function restricted(req: Request, res: Response, next: NextFunction) {

  //Deconstructing req.params (which is object of URL paramters defined by us)
  const { userId } = req.params;
  //Retrieving token from headers to passin to jwt.verify
  const token = req.headers.authorization;
  const secret = process.env.JWT_SECRET || "default";
    
  if (token) {
    //verifying token with passed in secret and callback function to handle err cases and decoded token.
    jwt.verify(token, secret, function (err, decoded) {
      const decodedJwt = decoded as jwtPayload;
      if (err) {
        res.status(400).json({message: "Cannot parse passed in authorization token"});
      } else if (decodedJwt.id !== userId) {
        res.status(401).json({message: "You are not authorized to view this information"});
      } else {
        //call next because token was verified, moving to next middleware
        next();
      }
    }); 
  } else {
    res.status(400).json({message: "Bad request, please provide token in authorization headers"});
  }
}