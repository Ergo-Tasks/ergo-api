import { Express } from "express";

import userRoute from "./users";
import taskRoute from "./tasks";
import tagRoute from './tags';

/** 
 * Handles applying all routes to given server
 * 
 * @param server - Server to add route handlers to
 */

const applyRoutes = (server: Express) => {
  server.use("/api/users", userRoute);
  server.use("/api/tasks", taskRoute);
  server.use('/api/tags', tagRoute)
  server.get("/", (req, res) => {res.send("Ergo api running here")});
}

export default applyRoutes;