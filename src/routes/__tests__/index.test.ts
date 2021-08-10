import request from 'supertest'
import { Express } from 'express';

import { createServer } from "../../server";

let server: Express;

describe('GET /', () => {
  beforeAll(async () => {
    server = await createServer(2342);
  });

  it('Should return 200 and message that ergo api has started', done => {
    request(server)
      .get('/')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.text).toBe("Ergo api running here");
        done();
      })
  })
})