import jwt from "jsonwebtoken";
import { NextFunction, Request, Response, Router } from "express";

export function restricted(req: Request, res: Response, next: NextFunction) {
    
  console.log(req.headers);
  
}
