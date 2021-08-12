import { NextFunction, Request, Response, Router } from "express";

import createConnection from "../../typeorm";
import server from "../../server";
import { User } from "../../typeorm/entities/User";
import { restricted } from "../../middleware/auth"

describe('Token authentication middleware', () => {
  
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {json: jest.fn()}
    nextFunction = jest.fn()
  });

  it('Should call next function', () => {
    mockRequest = {
      headers: {authorization: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImthZ3JhbnRAdXcuZWR1MiIsImlkIjoiNWU0NmU4MGYtNWE1Ni00MWY1LTk4NzctOTQ0NjFiODkxNWNmIiwiaWF0IjoxNjI4NTQzNDEzfQ.4qY27QJ_I9Ds2iy9ouC_NIrIdtz-WuqaoSyji3KZruU"},
      params: {userId: "5e46e80f-5a56-41f5-9877-94461b8915cf"}
    }
    restricted(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(nextFunction).toBeCalled();
  });

});

//mockResponse.json toBe
