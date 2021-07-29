import { Express } from "express";

import userRoute from "./users";

/**
 * Handles applying all routes to the given server
 * 
 * @param server - Server to add route handlers to
 */
const applyRoutes = (server: Express) => {
  server.use("/api/users", userRoute);
  server.get("/", (req, res) => {res.send("Ergo api running here")});
}

export default applyRoutes;