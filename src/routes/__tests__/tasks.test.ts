import supertest from 'supertest';
import { NextFunction, Request, Response } from "express";

import server from "../../server";
import { Task, taskRelations, DaysOfTheWeek, IDate } from '../../typeorm/entities/Task';
import { Tag } from '../../typeorm/entities/Tag'
import { User, userRelations } from '../../typeorm/entities/User';
import { createTestTag, createTestUser, createTypeormConn } from '../../utils';

jest.mock('../../middleware/auth', () => ({
  restricted: (req: Request, res: Response, nextFunction: NextFunction) => {
    nextFunction();
  }
}));

const request = supertest(server);

describe('Task routes', () => {
  
  beforeAll(async () => { 
    await createTypeormConn();
    dbUser = await createTestUser('Marty.Byrde@hotmail.com');
    dbTag1 = await createTestTag('Work related');
    dbTag2 = await createTestTag('Political');
  });

  const taskExample = {
    taskName: 'Econ Work',
    taskDescription: 'Complete problems 1-34 in textbook Ch. 12',
    isRecursive: false,
    taskDate: 1628912941 // 8-13-21 20-49-01
  }
  
  const recTaskExample = {
    taskName: 'Econ Quiz',
    taskDescription: 'Do econ quizzes!',
    isRecursive: true,
    recTaskDate: [{day: DaysOfTheWeek.MONDAY, time: 1315}, {day: DaysOfTheWeek.THURSDAY, time: 900}]
  }
  
  let dbUser:User;
  let dbTag1:Tag;
  let dbTag2:Tag;
  
  describe('POST /api/tasks/:userId', () => {

    it('Should return status 201', async () => {
      const res = await request.post(`/api/tasks/${dbUser.id}`)
        .send(taskExample);
      
      expect(res.status).toBe(201);
    });

    it('Should return status 201 and appends task with multiple tags', async () => {
      const res = await request.post(`/api/tasks/${dbUser.id}`)
        .send({ ...taskExample, tags: [dbTag1, dbTag2] });
      const user = await User.findOneOrFail({ where: {id: dbUser.id}, relations: userRelations });
      const task = await Task.findOneOrFail({ where: {taskName: taskExample.taskName, user}, relations: taskRelations });

      expect(user.tasks).toContainEqual(task);
      expect(task.tags).toContainEqual(dbTag1);
      expect(task.tags).toContainEqual(dbTag2);
      expect(res.status).toBe(201);
    });

    it('Should return status 400 because Task isRecursive and missing recTaskDate field', async () => {
      const res = await request.post(`/api/tasks/${dbUser.id}`)
        .send({ ...taskExample, isRecursive: true, tags: [dbTag1] });
      const expectedResponse = JSON.stringify({message: 'Bad request, missing date field(s)'})

      expect(res.status).toBe(400);
      expect(res.text).toBe(expectedResponse);
    });

    it('Should return status 400 because Task is not recursive and missing taskDate field', async () => {
      const res = await request.post(`/api/tasks/${dbUser.id}`)
        .send({...recTaskExample, isRecursive: false});
      const expectedResponse = JSON.stringify({message: 'Bad request, missing date field(s)'})

      expect(res.status).toBe(400);
      expect(res.text).toBe(expectedResponse);
    });

  });

  describe('GET /api/tasks/:userId', () => {

    it.skip('Should return status 200 with all user\'s tasks', async () => {
      const res = await request.get(`/api/tasks/${dbUser.id}`);
      const user = await User.findOneOrFail({ where: {id: dbUser.id}, relations: userRelations});
      const expectedResponse = JSON.stringify(user.tasks);

      expect(res.status).toBe(200);
      expect(res.text).toBe(expectedResponse);
    });

    it('Should return status 200 with user\'s tasks under one tag', async () => {
      const res = await request.get(`/api/tasks/${dbUser.id}?tagId=${dbTag1.id}`);
      const user = await User.findOneOrFail({ where: {id: dbUser.id}, relations: userRelations });
      const expectedResponse = JSON.stringify('hello world')
      
      expect(res.status).toBe(200);
      expect(res.text).toBe(expectedResponse);
    });

    it.skip('Should return status 200 with user\'s completed tasks under one tag', async () => {

    });

    it.skip('Should return status 200 with all user\'s in-progress tasks', async () => {
      const res = await request.get(`/api/tasks/${dbUser.id}`);
      const user = await User.findOneOrFail({email: 'Marty.Byrde@hotmail.com'});
      //Need to find a way to deconstruct user's tasks, then access taskFinished field per each task. (loop?)
      const userTasks = {...user.tasks};

      const expectedResponse = JSON.stringify(userTasks);
    });

    it.skip('Should return status 200 with all user\'s tasks under multiple tags, between two dates', async () => {
      const task1 = await request.post(`/api/tasks/${dbUser.id}`)
        .send({...taskExample, tags: ['workingout', 'tough', 'mustDo\'s']});
      const task2 = await request.post(`/api/tasks/${dbUser.id}`)
        .send({...taskExample, taskDate: 1628913000, tags: ['workingout', 'tough', 'mustDo\'s']});
      const task3 = await request.post(`/api/tasks/${dbUser.id}`)
        .send({...taskExample, taskDate: 1828912900, tags: ['workingout', 'tough', 'mustDo\'s']});
      const res = await request.get(`/api/tasks/${dbUser.id}?tags=workingout+tough+mustDo\'s&taskDate[gte]=1628912900&taskDate[lte]=1628913941`);
      const user = await User.findOneOrFail({email: 'Marty.Byrde@hotmail.com'});
      const expectedResponse = JSON.stringify(user.tasks);

      expect(res.status).toBe(200);
      expect(res.text).toBe(expectedResponse);
    });

    it.skip('Should return status 400 due to searching for tasks with an invalid tag', async () => {
      const res = await request.get(`/api/tasks/${dbUser.id}?tagId=invalidtag`);
      const expectedResponse = JSON.stringify({message: "Not Found"})

      expect(res.status).toBe(404);
      expect(res.text).toBe(expectedResponse);
    });

    it('Should return status 404 due to User not being found', async () => {
      const res = await request.get(`/api/tasks/falseUserId`);
      const expectedResponse = JSON.stringify({message: 'Not found, ensure userId is correct' });

      expect(res.status).toBe(404);
      expect(res.text).toBe(expectedResponse);
    });

  });

  describe.skip('GET /api/tasks/:userId/:taskId', () => {

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
  
  describe.skip('PUT /api/tasks/:taskId', () => {
    
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
  
  describe.skip('DELETE /api/tasks/:taskId', () => {
    
    it('Should return status 200 successfully deleting a non-recurrsive task', async () => {
      const task = await Task.findOneOrFail({ taskName: taskExample.taskName });
      const res = await request.delete(`/api/tasks/${task.id}`)
      .send();
      const task2 = await Task.findOneOrFail({ taskName: taskExample.taskName });
      
      expect(res.status).toBe(200);
      expect(task2).toBe(undefined);
    })
    
    it('Should return status 200 successfully deleting a recurrsive task', async () => {
      const task = await Task.findOneOrFail({ taskName: recTaskExample.taskName });
      const res = await request.delete(`/api/tasks/${task.id}`)
      .send();
      const task2 = await Task.findOneOrFail({ taskName: recTaskExample.taskName });
      
      expect(res.status).toBe(200);
      expect(task2).toBe(undefined);
    })
    
    it('Should return status 400 due to invalid task Id', async () => {
      const res = await request.delete(`/api/tasks/falseId`)
      .send();
      
      expect(res.status).toBe(400);
    })
    
  })
  
});

    // wed -> friday 
    // wed sept 15 -> friday sept 17
    // { recursiveTasks: [{ ... }], nonRecursiveTasks: [{...}] }
    // const recursiveTasks = nonRecursiveTasks.filter((t) => t.isRecursive);
