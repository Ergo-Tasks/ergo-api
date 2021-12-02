import supertest from 'supertest';
import { NextFunction, Request, Response } from "express";

import server from "../../server";
import createConnection from '../../typeorm';
import { Tag } from '../../typeorm/entities/Tag';
import { User } from '../../typeorm/entities/User';


jest.mock('../../middleware/auth', () => ({
  restricted: (req: Request, res: Response, nextFunction: NextFunction) => {
    nextFunction();
  }
}));

const request = supertest(server);

describe('Tag routes', () => {

  const tagExample = {
    tagName: 'Workout',
    tagColor: '#101010'
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

  beforeAll(async () => {
    await createConnection();
    await request.post('/api/users/')
      .send(userExample);
    dbUser = await User.findOneOrFail({email: userExample.email});
  });

  describe('POST /api/tags/:userId', () => {

    it('Should return status 201 indicating tag has been created successfully', async () => {
      const res = await request.post(`/api/tags/${dbUser.id}`)
        .send(tagExample);
      
      expect(res.status).toBe(201);
    });

    it('Should return status 400 indicating tag name already exists', async () => {
      const res = await request.post(`/api/tags/${dbUser.id}`)
        .send(tagExample);

      expect(res.status).toBe(400)
    })

  });

});
