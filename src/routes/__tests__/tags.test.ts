import supertest from 'supertest';
import { NextFunction, Request, Response } from "express";

import server from "../../server";
import createConnection from '../../typeorm';
import { Tag } from '../../typeorm/entities/Tag';
import { User } from '../../typeorm/entities/User';
import color from 'color';

jest.mock('../../middleware/auth', () => ({
  restricted: (req: Request, res: Response, nextFunction: NextFunction) => {
    nextFunction();
  }
}));

const request = supertest(server);

describe('Tag routes', () => {

  const tagExample = {
    tagName: 'workout',
    tagColor: color.rgb(255,255,255)
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

  describe('POST /api/tags/:userId', () => {

    it('Should return status 201', async () => {
      const res = await request.post(`/api/tags/${dbUser.id}`)
        .send(tagExample);
      
      expect(res.status).toBe(201);
    });

    

  });

});
