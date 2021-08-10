import "reflect-metadata";
import dotenv from "dotenv";

import createConnection from "./typeorm";
import { createServer } from "./server";

(async () => {
  dotenv.config();

  await createConnection();

  createServer();
})();