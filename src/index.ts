import "reflect-metadata";
import dotenv from "dotenv";

import createConnection from "./typeorm";
import server from "./server";

(async () => {
  const port = process.env.PORT || 5000;
  const hostname = process.env.HOSTNAME || 'localhost';

  dotenv.config();
  await createConnection();

  server.listen(port, () => {
    console.log(`Server is running on ${hostname}:${port}`);
  });
})();