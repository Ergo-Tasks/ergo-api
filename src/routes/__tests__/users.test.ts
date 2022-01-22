import supertest from 'supertest';
import { NextFunction, Request, Response } from "express";

import createConnection from "../../typeorm";
import server from "../../server";
import { User } from "../../typeorm/entities/User";
import { Connection } from 'typeorm';

jest.mock('../../middleware/auth', () => ({
  restricted: (req: Request, res: Response, nextFunction: NextFunction) => {
    nextFunction();
  }
}));

const request = supertest(server);
let connection: Connection;

describe('User authentication routes', () => {


  beforeAll(async () => {
    connection = await createConnection();  
  })

  afterAll(async () => {
    await connection.close();
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

    const userExample = {
      email: "jacob139@gmail.com",
      password: "zoowaponatoofopguwap"
    }
    
    it('Should return status 200 and token in JSON object', async () => {
      const res = await request.post('/api/users/login')
        .send(userExample);
      expect(res.status).toBe(200);
      expect(res.text).toMatch("token");
    })

    it('Should return status 400 because email sent in request body does not exist', async () => {
      const res = await request.post('/api/users/login')
        .send({...userExample, email: "wrongemail@gmail.com"});
      expect(res.status).toBe(400);
    })

    it('Should return status 400 due to undefined email in request body', async () => {
      const res = await request.post('/api/users/login')
        .send(userExample.password);
      expect(res.status).toBe(400);
    })

    it('Should return status 400 due to undefined password in request body', async () => {
      const res = await request.post('/api/users/login')
        .send(userExample.email);
      expect(res.status).toBe(400);
    })

    it('Should return status 401 due to incorrect password in request body', async () => {
      const res = await request.post('/api/users/login')
        .send({...userExample, password: "wrongPassword"});
      expect(res.status).toBe(401);
    })

  })

  describe('GET /api/users/:userId', () => {

    it('Should return status 200 with user information in JSON body', async () => {     
      const testUser = await User.findOneOrFail({
        email: userExample.email
      });
      const res = await request.get(`/api/users/${testUser.id}`);
      const expectedResponse = JSON.stringify({user: testUser});

      expect(res.status).toBe(200); 
      expect(res.text).toBe(expectedResponse);
    });

    it('Should return status 404 due to user not being found', async () => {
      const res = await request.get('/api/users/falseId');

      expect(res.status).toBe(404); 
    });
  });

  describe('PUT /api/users/:userId', () => {
    
    it('Should return status 200 with updated user information in JSON body', async () => {
      const testUser = await User.findOneOrFail({
        email: userExample.email
      });
      const updatedUser = {
        userName: 'bbGamer'
      }
      const res = await request.put(`/api/users/${testUser.id}`)
        .send(updatedUser);
      const expectedResponse = JSON.stringify({user: {
        ...testUser,
        ...updatedUser
      }})

      expect(res.status).toBe(200);
      expect(res.text).toBe(expectedResponse);
    });

    it('Should return status 200 with updated password in JSON body', async () => {
      const testUser = await User.findOneOrFail({
        email: userExample.email
      });
      const res = await request.put(`/api/users/${testUser.id}`)
        .send({password: 'updatedPassword'});
      
      expect(res.status).toBe(200);
      expect(res.body.user.password).not.toBe(testUser.password);
    })

    it('Should return status 400 due to user not being found', async () => {
      const res = await request.put('/api/users/falseId');

      expect(res.status).toBe(400);
    });

    it('Should return status 400 due to user attempting to update email to non-unique email', async () => {
      //saving an example user to use same email in test
      const secondUser = new User();
      secondUser.firstName = "Jacob",
      secondUser.lastName = "Anderson",
      secondUser.userName = "jacob139",
      secondUser.email = 'second@gmail.com';
      secondUser.password = "zoowaponatoofopguwap"     
      await secondUser.save();

      const testUser = await User.findOneOrFail({
        email: userExample.email
      });
      const res = await request.put(`/api/users/${testUser.id}`)
        .send({email: secondUser.email});

      expect(res.status).toBe(400);
    });
  });
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