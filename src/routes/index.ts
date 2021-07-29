import { Express } from "express";

import userRoute from "./users";

const applyRoutes = (server: Express) => () => {
  // server.use("/api/users", userRoute);
  server.get("/", (req, res) => res.send("Ergo api running here"));
}

export default applyRoutes;