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

  const tagExample2 = {
    tagName: 'delete this tag',
    tagColor: '#fff'
  }

  const taskExample = {
    taskName: 'Math416 HW',
    taskDescription: 'Complete problems 13-54 in textbook Ch. 12',
    isRecursive: false,
    taskDate: 1628912941, // 8-13-21 20-49-01
  }

  const multTagEx = [{
    tagName: 'School',
    tagColor: '#101010'
  },
  { tagName: 'Afterschool',
    tagColor: '#333333'
  }]

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

    it('Should return status 201 indicating tag has been created successfully', async () => {
      const res = await request.post(`/api/tags/${dbUser.id}`)
        .send(tagExample);
      
      expect(res.status).toBe(201);
    });
    
    it('Should return status 201 (with taskId) and link task with tag using taskId', async () => {
      const res = await request.post(`/api/tags/${dbUser.id}?taskId=${dbTask.id}`)
      .send(tagExample);
      const task = await Task.findOneOrFail({ where: {id: dbTask.id}, relations: taskRelations });

      expect(res.status).toBe(201);
      expect(task.tags).toMatchObject([tagExample]);
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

  describe('GET /api/tags/:userId', () => {

    it('Should return status 200 with tag array of all tags in JSON body', async () => {
      await request.post(`/api/tags/${dbUser.id}`)
        .send({ ...tagExample, tagName: 'Favorites' });
      await request.post(`/api/tags/${dbUser.id}`)
        .send({ ...tagExample, tagName: 'Things to do' });
      
      const res = await request.get(`/api/tags/${dbUser.id}`);
      const user = await User.findOneOrFail({ where: {id: dbUser.id}, relations: userRelations });
      const expectedResponse = JSON.stringify(user.tags);

      expect(res.status).toBe(200);
      expect(res.text).toBe(expectedResponse);
    });

    it('Should return status 404 because user cannot be found', async () => {
      const res = await request.get('/api/tags/invalidUserId');
      const expectedResponse = JSON.stringify({ message: 'Not Found' });

      expect(res.status).toBe(404);
      expect(res.text).toBe(expectedResponse)
    })

  });

  describe('GET /api/tags/:userId/:tagId', () => {

    it('Should return status 200 with tag in JSON body', async () => {
      const testTag = await Tag.findOneOrFail({
        tagName: tagExample.tagName
      });
      const res = await request.get(`/api/tags/${dbUser.id}/${testTag.id}`);
      const expectedResponse = JSON.stringify({ tag: testTag });

      expect(res.status).toBe(200);
      expect(res.text).toBe(expectedResponse);
    });

    it('Should return status 404 because user cannot be found', async () => {
      const testTag = await Tag.findOneOrFail({
        tagName: tagExample.tagName
      });
      const res = await request.get(`/api/tags/invalidUserId/${testTag.id}`);
      const expectedResponse = JSON.stringify({ message: 'Not Found' });

      expect(res.status).toBe(404);
      expect(res.text).toBe(expectedResponse);
    });

    it('Should return status 404 because tag cannot be found', async () => {
      const res = await request.get(`/api/tags/${dbUser.id}/invalidTagId`);
      const expectedResponse = JSON.stringify({ message: 'Not Found' });

      expect(res.status).toBe(404);
      expect(res.text).toBe(expectedResponse);
    });

  });

  describe('PUT /api/tags/:userId/:tagId', () => {

    it('Should return status 200 with updated tag information in JSON body', async () => {
      const testTag = await Tag.findOneOrFail({
        tagName: tagExample.tagName
      });
      const updatedTag = {
        tagName: 'Priority Tasks'
      }
      const res = await request.put(`/api/tags/${dbUser.id}/${testTag.id}`)
        .send(updatedTag);
      const expectedResponse = JSON.stringify({ tag: {
        ...testTag,
        ...updatedTag
      }});

      expect(res.status).toBe(200);
      expect(res.text).toBe(expectedResponse);
    });

    it('Should return status 404 because user cannot be found', async () => {
      const testTag = await Tag.findOneOrFail({
        tagName: tagExample.tagName
      });
      const updatedTag = {
        tagName: 'Fun Tasks'
      }
      const res = await request.put(`/api/tags/invalidUserId/${testTag.id}`)
        .send(updatedTag);
      const expectedResponse = JSON.stringify({ message: 'Not Found' });

      expect(res.status).toBe(404);
      expect(res.text).toBe(expectedResponse);
    });

    it('Should return status 404 because tag cannot be found', async () => {
      const updatedTag = {
        tagName: 'Priority Tasks'
      }
      const res = await request.put(`/api/tags/${dbUser.id}/invalidTagId`)
        .send(updatedTag);
      const expectedResponse = JSON.stringify({ message: 'Not Found' });

      expect(res.status).toBe(404);
      expect(res.text).toBe(expectedResponse);
    });

  });

  describe('DELETE /api/tags/:userId/:tagId', () => {
    it('Should return status 201 and sucessfully remove tag from db', async () => {
      await request.post(`/api/tags/${dbUser.id}`)
        .send(tagExample2);
      const testTag = await Tag.findOneOrFail({ tagName: tagExample2.tagName })
      const res = await request.delete(`/api/tags/${dbUser.id}/${testTag.id}`)
        .send()
      const deletedTag = await Tag.findOne({
        tagName: testTag.tagName
      });

      expect(res.status).toBe(201);
      expect(deletedTag).toBeUndefined();
    });
    it('Should return status 400 indicating tag name already exists', async () => {
      const res = await request.post(`/api/tags/${dbUser.id}`)
        .send(tagExample);

      expect(res.status).toBe(400)
    })

  });

});
