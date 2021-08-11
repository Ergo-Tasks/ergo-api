import supertest from 'supertest'

import createConnection from "../../typeorm";
import server from "../../server";
import { User } from "../../typeorm/entities/User";

const request = supertest(server);

describe('User authentication routes', () => {

  beforeAll(async () => {
    await createConnection();
  })

  const userExample = {
    firstName: "Jacob",
    lastName: "Anderson",
    userName: "jacob139",
    email: "jacob139@gmail.com",
    password: "zoowaponatoofopguwap"
  }

  describe('POST /api/users/', () => {

    it('Should return status 201', async () => {
      const res = await request.post('/api/users/')
        .send(userExample)
      expect(res.status).toBe(201);
    });

    it('Should return status 201 and user password should be encrypted in response', async () => {
      const email = "refe@refeUniversity.com";
      const res = await request.post('/api/users/')
      .send({...userExample, email})
      const user = await User.findOneOrFail({
        email
      })
      expect(user.password).not.toBe(userExample.password);
      expect(res.status).toBe(201);
    })
    
    it('Should return status 400 due to email already existing in database', async () => {
      const res = await request.post('/api/users/')
        .send(userExample)
      expect(res.status).toBe(400);
    })

    it('Should return status 400 due to missing field', async () => {
      const res = await request.post('/api/users/')
        .send({
          userName: "jacob139",
          email: "jacob139@gmail.com",
          password: "zoowaponatoofopguwap"
        })
      expect(res.status).toBe(400);
    })

  })

  describe('POST /api/users/login', () => {

    const user = {
      email: "jacob139@gmail.com",
      password: "zoowaponatoofopguwap"
    }
    
    it('Should return status 200 and token in JSON object', async () => {
      const res = await request.post('/api/users/login')
        .send(user);
      expect(res.status).toBe(200);
      expect(res.text).toMatch("token");
    })

    it('Should return status 400 because email sent in request body does not exist', async () => {
      const res = await request.post('/api/users/login')
        .send({...user, email: "wrongemail@gmail.com"});
      expect(res.status).toBe(400);
    })

    it('Should return status 400 due to undefined email in request body', async () => {
      const res = await request.post('/api/users/login')
        .send(user.password);
      expect(res.status).toBe(400);
    })

    it('Should return status 400 due to undefined password in request body', async () => {
      const res = await request.post('/api/users/login')
        .send(user.email);
      expect(res.status).toBe(400);
    })

    it('Should return status 401 due to incorrect password in request body', async () => {
      const res = await request.post('/api/users/login')
        .send({...user, password: "wrongPassword"});
      expect(res.status).toBe(401);
    })

  })

})


/**
 * describe block w/ user routes
 * inside this would be nested describe blocks for each route separately
 * beforeAll at beginning of the outer describe block to start server
 * 
 * 'it' function takes in 2 parameters, first is string describing test. Second is callback function that
 * handles the test.
 * when 'done' is passed in you are handling async actions and must call it to finish test.
 * 
 * expect is a function, where a value is literally expected to be something. This will be used with every test.
 */