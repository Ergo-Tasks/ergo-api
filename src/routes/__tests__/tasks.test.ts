import supertest from 'supertest';
import { NextFunction, Request, Response } from "express";

import { createConnection } from 'typeorm';
import { Task } from '../../typeorm/entities/Task';

import server from "../../server";

const request = supertest(server);

describe('Task routes', () => {

  beforeAll(async () => {
    await createConnection();
  });

  const taskExample = {
    taskName: 'Workout',
    taskDescription: 'Chest, back, shoulders, legs, arms',
    isRecursive: true,
    recTaskDate: [{day: 'MONDAY', time: 1315},{day: 'THURSDAY', time: 900}] //not sure if this is correct syntax
  }

  describe('POST /api/tasks/', () => {

    it('Should return status 201', async () => {
      const res = await request.post('/api/tasks/')
        .send(taskExample);
      expect(res.status).toBe(201);
    });


  });

});