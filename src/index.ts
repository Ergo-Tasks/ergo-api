import dotenv from "dotenv";
import server from "./server";

dotenv.config();

const port = process.env.PORT || 5000;
const hostname = process.env.HOSTNAME || 'localhost';

server.listen(port, () => {
  console.log(`Server is running on ${hostname}:${port}`);
});