import { getConnectionOptions, createConnection } from "typeorm";

import { Tag } from "../typeorm/entities/Tag";
import { User } from "../typeorm/entities/User";

export const createTestUser = async (email: string = 'defaultEmail@gmail.com') => {
  const testUser = new User();
  testUser.userName = 'Marty372';
  testUser.firstName = 'Marty';
  testUser.lastName = 'Byrde';
  testUser.email = email;
  testUser.password = 'passwordlol';
  return await testUser.save();
}

export const createTestTag = async (tagName: string = 'defaultTagName') => {
  const testTag = new Tag();
  testTag.tagName = tagName;
  testTag.tagColor = 'Blue'
  return await testTag.save();
}

export const createTypeormConn = async () => {
  const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);
  return createConnection({ ...connectionOptions, name: 'default' });
}
