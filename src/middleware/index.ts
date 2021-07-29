import express, { Express } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";

/**
 * Handles applying custom and imported middleware
 * to the server passed as an argument 
 * 
 * @param server - Express server to use middleware on
 */
const applyMiddleware = (server: Express) => {
  server.use(helmet());
  server.use(express.json());
  server.use(cors());
  server.use(morgan("tiny"));
}

export default applyMiddleware;