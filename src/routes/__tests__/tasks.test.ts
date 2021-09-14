import supertest from 'supertest';
import { NextFunction, Request, Response } from "express";

import createConnection from '../../typeorm';
import { Task } from '../../typeorm/entities/Task';
import { DaysOfTheWeek,  IDate} from '../../typeorm/entities/Task';

import server from "../../server";
import { User, userRelations } from '../../typeorm/entities/User';

jest.mock('../../middleware/auth', () => ({
  restricted: (req: Request, res: Response, nextFunction: NextFunction) => {
    nextFunction();
  }
}));

const request = supertest(server);

describe('Task routes', () => {

  const taskExample = {
    taskName: 'Workout',
    taskDescription: 'Chest, back, shoulders, legs, arms',
    isRecursive: false,
    taskDate: 1628912941 // 8-13-21 20-49-01
  }

  const recTaskExample = {
    taskName: 'Workout',
    taskDescription: 'Chest, back, shoulders, legs, arms',
    isRecursive: true,
    recTaskDate: [{day: DaysOfTheWeek.MONDAY, time: 1315}, {day: DaysOfTheWeek.THURSDAY, time: 900}] 
  }

  const userExample = {
    firstName: "Marty",
    lastName: "Byrde",
    userName: "MByrde2",
    email: "Marty.Byrde@hotmail.com",
    password: "darline_Wildin!"
  }

  let dbUser:User;

  beforeAll(async () => {
    await createConnection();
    await request.post('/api/users/')
      .send(userExample);
    dbUser = await User.findOneOrFail({email: userExample.email});
  });

  describe('POST /api/tasks/:userId', () => {

    it('Should return status 201', async () => {
      const res = await request.post(`/api/tasks/${dbUser.id}`)
        .send(taskExample);

      expect(res.status).toBe(201);
    });

    it('Should return status 201 and appends Task into User array of Task', async () => {
      const res = await request.post(`/api/tasks/${dbUser.id}`)
        .send(recTaskExample);
      const user = await User.findOneOrFail({where: {email: dbUser.email}, relations: userRelations });
      const task = await Task.findOneOrFail({taskName: taskExample.taskName});

      expect(user.tasks).toContainEqual(task);
      expect(res.status).toBe(201);
    });

    it('Should return status 400 because Task isRecursive and missing recTaskDate field', async () => {
      const res = await request.post(`/api/tasks/${dbUser.id}`)
        .send({...taskExample, isRecursive: true});
      const expectedResponse = JSON.stringify({message: 'Bad Request: Missing date field(s)'})


      expect(res.status).toBe(400);
      expect(res.text).toBe(expectedResponse);
    });

    it('Should return status 400 because Task is not recursive and missing taskDate field', async () => {
      const res = await request.post(`/api/tasks/${dbUser.id}`)
        .send({...recTaskExample, isRecursive: false});
      const expectedResponse = JSON.stringify({message: 'Bad Request: Missing date field(s)'})

      expect(res.status).toBe(400);
      expect(res.text).toBe(expectedResponse);
    });

  });

  describe('GET /api/tasks/:userId', () => {

    it('Should return status 200 with task information in JSON body', async () => {
      const res = await request.get(`/api/tasks/${dbUser.id}`);
      const user = await User.findOneOrFail({email: userExample.email});
      const expectedResponse = JSON.stringify(user.tasks);

      expect(res.status).toBe(200);
      expect(res.text).toBe(expectedResponse);
    });

  });

});