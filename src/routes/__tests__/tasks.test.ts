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

    it('Should return status 200 with all user\'s tasks', async () => {
      const res = await request.get(`/api/tasks/${dbUser.id}`);
      const user = await User.findOneOrFail({email: userExample.email});
      const expectedResponse = JSON.stringify(user.tasks);

      expect(res.status).toBe(200);
      expect(res.text).toBe(expectedResponse);
    });

    it('Should return status 200 with user\'s completed tasks under one tag', async () => {
      
    });

    it('Should return status 200 with all user\'s in-progress tasks', async () => {

    });

    it('Should return status 200 with all user\'s tasks under multiple tags, between two dates', async () => {
      
    });

    it('Should return status 400 due to searching for tasks with an invalid tag', async () => {

    })

    //it('')
    
    it('Should return status 404 due to User not being found', async () => {
      const res = await request.get(`/api/tasks/falseUserId/`);
      
      expect(res.status).toBe(404);
    });


  });

  describe('GET /api/tasks/:userId/:taskId', () => {

    it('Should return status 200 with task information in JSON body', async () => {
      const task = await Task.findOneOrFail({ taskName: taskExample.taskName });
      const res = await request.get(`/api/tasks/${dbUser.id}/${task.id}`);
      const expectedResponse = JSON.stringify({task});

      expect(res.status).toBe(200);
      expect(res.text).toBe(expectedResponse);
    });
    
    it('Should return status 404 due to Task not being found', async () => {
      const res = await request.get(`/api/tasks/${dbUser.id}/falseTaskId`);
      
      expect(res.status).toBe(404);
    });

    it('Should return status 404 due to User not being found', async () => {
      const task = await Task.findOneOrFail({ taskName: taskExample.taskName });
      const res = await request.get(`/api/tasks/falseUserId/${task.id}`);
      
      expect(res.status).toBe(404);
    });

  });

  describe('PUT /api/tasks/:taskId', () => {
    
    it('Should return status 200 with updated name, description, and time/date in JSON object', async () => {
      const task = await Task.findOneOrFail({
        taskName: taskExample.taskName
      });
      const updateTask = {
        taskName: 'newTaskName',
        taskDescription: 'new task description',
        taskDate: 1632242640 //	Tue Sep 21 2021 11:44:00
      }
      
      const res = await request.get(`/api/tasks/${dbUser.id}`)
        .send({updateTask});
      const expectedResponse = JSON.stringify({task: {
        ...task,
        ...updateTask
      }})

      expect(res.status).toBe(200);
      expect(res.text).toBe(expectedResponse)
    })
    
    it('Should return status 200 with a new set of tags and task is now recursive w/ a recurring date', async () => {

    })

    it('Should return status 200 adding task to TaskFinished entity to mark completion', async () => {

    })

    it('Should return status 200 with task completion being un-done', async () => {

    })

    it('Should return status 400 due to task not being found', async () => {
      const res = await request.get(`/api/tasks/falseId`);

      expect(res.status).toBe(400);
    })

    it('Should return status 400 due to empty request body', async () => {
      const res = await request.get(`/api/tasks/${dbUser.id}`)
        .send({});

      expect(res.status).toBe(400);
    })

  })

  describe('DELETE /api/tasks/:taskId', () => {
    
    it('Should return status 200 successfully deleting a non-recurrsive task', async () => {

    })

    it('Should return status 200 successfully deleting a recurrsive task', async () => {
      
    })

    it('Should return status 400 due to invalid task Id', async () => {
      
    })

    it('Should return status 400 due to task failing to delete?', async () => {

    })

  })
    it('Should return status 200 with all user\'s tasks', async () => {
      const res = await request.get(`/api/tasks/${dbUser.id}`);
      const user = await User.findOneOrFail({email: userExample.email});
      const expectedResponse = JSON.stringify(user.tasks);

      expect(res.status).toBe(200);
      expect(res.text).toBe(expectedResponse);
    });

    it('Should return status 200 with user\'s completed tasks under one tag', async () => {
      
    });

    it('Should return status 200 with all user\'s in-progress tasks', async () => {

    });

    it('Should return status 200 with all user\'s tasks under multiple tags, between two dates', async () => {
      
    });

    it('Should return status 400 due to searching for tasks with an invalid tag', async () => {

    })

    it('')
    
    it('Should return status 404 due to User not being found', async () => {
      const res = await request.get(`/api/tasks/falseUserId/`);
      
      expect(res.status).toBe(404);
    });

  });

      // wed -> friday 
      // wed sept 15 -> friday sept 17
      // { recursiveTasks: [{ ... }], nonRecursiveTasks: [{...}] }
      // const recursiveTasks = nonRecursiveTasks.filter((t) => t.isRecursive);
