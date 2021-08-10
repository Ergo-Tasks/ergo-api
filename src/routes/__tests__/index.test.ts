import supertest from 'supertest'

import server from "../../server";

const request = supertest(server);

describe('GET /', () => {
  it('Should return 200 and message that ergo api has started', async () => {
    const res = await request.get('/');

    expect(res.status).toBe(200);
    expect(res.text).toBe("Ergo api running here");
  })
})