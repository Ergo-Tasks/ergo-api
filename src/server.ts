import express from "express";

import applyMiddleware from "./middleware";
import applyRoutes from "./routes";

const server = express();

applyMiddleware(server);
applyRoutes(server);

export default server