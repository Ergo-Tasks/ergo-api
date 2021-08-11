import supertest from 'supertest'

import createConnection from "../../typeorm";
import server from "../../server";
import { User } from "../../typeorm/entities/User";

const request = supertest(server);

describe('Token authentication middleware', () => {
  
})