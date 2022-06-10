import supertest from 'supertest';
import { NextFunction, Request, Response } from "express";

import server from "../../server";
import { Tag } from '../../typeorm/entities/Tag';
import { User, userRelations } from '../../typeorm/entities/User';
import { createTestUser, createTypeormConn } from '../../utils';

jest.mock('../../middleware/auth', () => ({
  restricted: (req: Request, res: Response, nextFunction: NextFunction) => {
    nextFunction();
  }
}));

const request = supertest(server);

describe('Tag routes', () => {

  beforeAll(async () => {
    await createTypeormConn(); 
    dbUser = await createTestUser('Marty.Byrde@hotmail.com');
  });

  const tagExample = {
    tagName: 'workout',
    tagColor: '#fff'
  }

  const tagExample2 = {
    tagName: 'delete this tag',
    tagColor: '#fff'
  }

  let dbUser:User;

  describe('POST /api/tags/:userId', () => {

    it('Should return status 201 indicating tag has been created successfully', async () => {
      const res = await request.post(`/api/tags/${dbUser.id}`)
        .send(tagExample);
      
      expect(res.status).toBe(201);
    });
    
    it('Should return status 201 and link tag to user', async () => {
      const res = await request.post(`/api/tags/${dbUser.id}`)
        .send(tagExample);
      const user = await User.findOneOrFail({ where: {id: dbUser.id}, relations: userRelations });
      const tag = await Tag.findOneOrFail({ where: {tagName: tagExample.tagName, user }})

      expect(res.status).toBe(201);
      expect(user.tags).toEqual(expect.arrayContaining([tag]));
    });
    
    it('Should return status 400 because of missing tagName field', async () => {
      const res = await request.post(`/api/tags/${dbUser.id}`)
        .send({tagColor: 'good tag color'});
      const expectedResponse = JSON.stringify({ message: 'Bad request, missing required field(s)' });

      expect(res.status).toBe(400);
      expect(res.text).toBe(expectedResponse);
    });

    it('Should return status 400 because of missing tagColor field', async () => {
      const res = await request.post(`/api/tags/${dbUser.id}`)
        .send({tagName: 'good tag name'});
      const expectedResponse = JSON.stringify({ message: 'Bad request, missing required field(s)' });

      expect(res.status).toBe(400);
      expect(res.text).toBe(expectedResponse);
    });

    it('Should return status 400 because of invalid userId', async () => {
      const res = await request.post('/api/tags/invalidUserId')
        .send(tagExample);
      const expectedResponse = JSON.stringify({ message: 'Not found, ensure userId is correct' });  

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
      const expectedResponse = JSON.stringify({ message: 'Not found, ensure userId is correct' });

      expect(res.status).toBe(404);
      expect(res.text).toBe(expectedResponse)
    });

  });

  describe('GET /api/tags/:userId/:tagId', () => {

    it('Should return status 200 with tag in JSON body', async () => {
      const testTag = await Tag.findOneOrFail({ tagName: tagExample.tagName });
      const res = await request.get(`/api/tags/${dbUser.id}/${testTag.id}`);
      const expectedResponse = JSON.stringify({ tag: testTag });

      expect(res.status).toBe(200);
      expect(res.text).toBe(expectedResponse);
    });

    it('Should return status 404 because user cannot be found', async () => {
      const testTag = await Tag.findOneOrFail({ tagName: tagExample.tagName });
      const res = await request.get(`/api/tags/invalidUserId/${testTag.id}`);
      const expectedResponse = JSON.stringify({ message: 'Not found, ensure user and tag Ids are correct' });

      expect(res.status).toBe(404);
      expect(res.text).toBe(expectedResponse);
    });

    it('Should return status 404 because tag cannot be found', async () => {
      const res = await request.get(`/api/tags/${dbUser.id}/invalidTagId`);
      const expectedResponse = JSON.stringify({ message: 'Not found, ensure user and tag Ids are correct' });

      expect(res.status).toBe(404);
      expect(res.text).toBe(expectedResponse);
    });

  });

  describe('PUT /api/tags/:userId/:tagId', () => {

    it('Should return status 200 with updated tag information in JSON body', async () => {
      const testTag = await Tag.findOneOrFail({ tagName: tagExample.tagName });
      const updatedTag = { tagName: 'Priority Tasks' };

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
      const testTag = await Tag.findOneOrFail({ tagName: tagExample.tagName });
      const updatedTag = { tagName: 'Fun Tasks' };

      const res = await request.put(`/api/tags/invalidUserId/${testTag.id}`)
        .send(updatedTag);
      const expectedResponse = JSON.stringify({ message: 'Not found, ensure user and tag Ids are correct' });

      expect(res.status).toBe(404);
      expect(res.text).toBe(expectedResponse);
    });

    it('Should return status 404 because tag cannot be found', async () => {
      const updatedTag = { tagName: 'Priority Tasks' };

      const res = await request.put(`/api/tags/${dbUser.id}/invalidTagId`)
        .send(updatedTag);
      const expectedResponse = JSON.stringify({ message: 'Not found, ensure user and tag Ids are correct' });

      expect(res.status).toBe(404);
      expect(res.text).toBe(expectedResponse);
    });

  });

  describe('DELETE /api/tags/:userId/:tagId', () => {

    it('Should return status 201 and sucessfully remove tag from db and from user.tags', async () => {
      await request.post(`/api/tags/${dbUser.id}`)
        .send(tagExample2);

      const testTag = await Tag.findOneOrFail({ tagName: tagExample2.tagName });
      const res = await request.delete(`/api/tags/${dbUser.id}/${testTag.id}`);
      const deletedTag = await Tag.findOne({ tagName: testTag.tagName });

      expect(res.status).toBe(200);
      expect(deletedTag).toBeUndefined();
    });

    it('Should return status 404 because user is not found', async () => {
      await request.post(`/api/tags/${dbUser.id}`)
        .send(tagExample2);
      const testTag = await Tag.findOneOrFail({ tagName: tagExample2.tagName });
      
      const res = await request.delete(`/api/tags/invalidUserId/${testTag.id}`);
      const expectedResponse = JSON.stringify({ message: 'Not found, ensure user and tag Ids are correct' });

      expect(res.status).toBe(404);
      expect(res.text).toBe(expectedResponse);
    });

    it('Should return status 404 because tag is not found', async () => {
      const res = await request.delete(`/api/tags/${dbUser.id}/invalidTagId`);
      const expectedResponse = JSON.stringify({ message: 'Not found, ensure user and tag Ids are correct' });

      expect(res.status).toBe(404);
      expect(res.text).toBe(expectedResponse);
    });

  });

});
