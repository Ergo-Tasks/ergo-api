import supertest from 'supertest';
import { NextFunction, Request, Response } from "express";

import server from "../../server";
import createConnection from '../../typeorm';
import { Connection } from 'typeorm';

import { Tag } from '../../typeorm/entities/Tag';
import { User, userRelations } from '../../typeorm/entities/User';
import { Task, taskRelations } from '../../typeorm/entities/Task';

jest.mock('../../middleware/auth', () => ({
  restricted: (req: Request, res: Response, nextFunction: NextFunction) => {
    nextFunction();
  }
}));

const request = supertest(server);
let connection: Connection;

describe('Tag routes', () => {

  beforeAll(async () => {
    connection = await createConnection();  
    await request.post('/api/users/')
      .send(userExample);
    dbUser = await User.findOneOrFail({ email: userExample.email });
    await request.post(`/api/tasks/${dbUser.id}`)
      .send(taskExample);
    dbTask = await Task.findOneOrFail({ taskName: taskExample.taskName }); 
  })

  afterAll(async () => {
    await connection.close();
  })

  const tagExample = {
    tagName: 'workout',
    tagColor: '#fff'
  }

  const taskExample = {
    taskName: 'Math416 HW',
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
      const res = await request.post(`/api/tags/${dbUser.id}?taskId=${dbTask.id}`)
      .send(tagExample);

      //in order to find this task, the relations were needed and I don't quite understand why?
      //const task = await Task.findOneOrFail({ taskName: taskExample.taskName});
      const task = await Task.findOneOrFail({ where: {id: dbTask.id}, relations: [taskRelations[0], taskRelations[1]]});
      const expectedResponse = JSON.stringify(task.tags);

      expect(res.status).toBe(201);
      expect(task.tags).toContainEqual(tagExample);
    });
    
    it('Should return status 400 because of missing tagName field', async () => {
      const res = await request.post(`/api/tags/${dbUser.id}`)
        .send({tagColor: 'good tag color'});
      const expectedResponse = JSON.stringify({ message: 'Bad Request' });

      expect(res.status).toBe(400);
      expect(res.text).toBe(expectedResponse);
    });

    it('Should return status 400 because of missing tagColor field', async () => {
      const res = await request.post(`/api/tags/${dbUser.id}`)
        .send({tagName: 'good tag name'});
      const expectedResponse = JSON.stringify({ message: 'Bad Request' });

      expect(res.status).toBe(400);
      expect(res.text).toBe(expectedResponse);
    });

    it('Should return status 404 (with taskId) because of invaild taskId', async () => {
      const res = await request.post(`/api/tags/${dbUser.id}?taskId=invalidTaskId`)
        .send(tagExample);
      const expectedResponse = JSON.stringify({ message: 'Task Not Found' });  

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
