import { createConnection, getConnectionOptions } from "typeorm";

/**
 * Handles setting up typeorm 
 * 
 * @returns Typeorm database connection
 */
const setupTypeorm = async () => {
  let options = await getConnectionOptions(process.env.NODE_ENV || 'development')
  
  const connection = await createConnection(options);

  return connection;
} 

export default setupTypeorm;