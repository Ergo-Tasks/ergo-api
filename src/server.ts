import express from "express";

import applyMiddleware from "./middleware";
import applyRoutes from "./routes";

export const createServer = (portOverride?: number) => {
  const server = express();
  const port = portOverride || process.env.PORT || 5000;
  const hostname = process.env.HOSTNAME || 'localhost';

  applyMiddleware(server);
  applyRoutes(server);

  server.listen(port, () => {
    console.log(`Server is running on ${hostname}:${port}`);
  });

  return server;
};