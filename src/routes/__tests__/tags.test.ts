import supertest from 'supertest';
import { NextFunction, Request, Response } from "express";

import server from "../../server";
import createConnection from '../../typeorm';
import { Tag } from '../../typeorm/entities/Tag';
import { User } from '../../typeorm/entities/User';
import { Task } from '../../typeorm/entities/Task';

jest.mock('../../middleware/auth', () => ({
  restricted: (req: Request, res: Response, nextFunction: NextFunction) => {
    nextFunction();
  }
}));

const request = supertest(server);
let connection: any;

describe('Tag routes', () => {

  beforeAll(async () => {
    connection = await createConnection();  
    await request.post('/api/users/')
      .send(userExample);
    dbUser = await User.findOneOrFail({email: userExample.email}); 
  })

  afterAll(async () => {
    await connection.close();
    connection = null;
  })

  const tagExample = {
    tagName: 'workout',
    tagColor: '#fff'
  }

  const taskExample = {
    taskName: 'Econ Work 2',
    taskDescription: 'Complete problems 13-54 in textbook Ch. 12',
    isRecursive: false,
    taskDate: 1628912941, // 8-13-21 20-49-01
  }

  const userExample = {
    firstName: "Marty",
    lastName: "Byrde",
    userName: "MByrde2",
    email: "Marty.Byrde@hotmail.com",
    password: "darline_Wildin!"
  }

  let dbUser:User;
  let dbTask:Task;

  describe('POST /api/tags/:userId', () => {

    it('Should return status 201 (without taskId)', async () => {
      const res = await request.post(`/api/tags/${dbUser.id}`)
        .send(tagExample);
      
      expect(res.status).toBe(201);
    });
    
    it('Should return status 201 (with taskId) and link task with tag using taskId', async () => {
      const res = await request.post(`/api/tags/${dbUser.id}/${dbTask.id}`)
      .send(tagExample);
      const expectedResponse = JSON.stringify(dbTask.tags);
      
      expect(res.status).toBe(201);
      expect(res.text).toBe(expectedResponse);
    });
    
    it('Should return status 400 because of missing tagName field', async () => {
      const res = await request.post(`/api/tags/${dbUser.id}`)
        .send({...tagExample, tagName: ''});
      const expectedResponse = JSON.stringify({ message: 'Bad Request: Missing Required Field' });


      expect(res.status).toBe(400);
      expect(res.text).toBe(expectedResponse);
    });

    it('Should return status 400 because of missing tagColor field', async () => {
      const res = await request.post(`/api/tags/${dbUser.id}`)
        .send({...tagExample, tagColor: ''});
      const expectedResponse = JSON.stringify({ message: 'Bad Request: Missing Required Field' });

      expect(res.status).toBe(400);
      expect(res.text).toBe(expectedResponse);
    });

    it('Should return status 404 (with taskId) because of invaild taskId', async () => {
      const res = await request.post(`/api/tags/${dbUser.id}/invalidTaskId`)
        .send(tagExample);
      const expectedResponse = JSON.stringify({ message: 'Not Found' });  

      expect(res.status).toBe(404);
      expect(res.text).toBe(expectedResponse);
    });

    it('Should return status 404 (without taskId) because of invalid userId', async () => {
      const res = await request.post('/api/tags/invalidUserId')
        .send(tagExample);
      const expectedResponse = JSON.stringify({ message: 'Not Found' });  

      expect(res.status).toBe(404);
      expect(res.text).toBe(expectedResponse);
    });

  });

});
