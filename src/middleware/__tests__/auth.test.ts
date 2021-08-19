import { NextFunction, Request, Response } from "express";

import { restricted } from "../../middleware/auth"

describe('Token authentication middleware', () => {
  
  /**
   * Setting the mock variable's types to Partial<> will return all properties
   * on that type, but they are all optional.
   * 
   * jest.fn() is a mock function used to mimick the environment our test function is
   * being implemented on.
   * 
   * 2 result variables for capturing response fields (auth.ts sends a status and json body)
   */
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();
  let resultJson = {};
  let resultStatus = {};


  /**
   * jest function to reset variables before each test,
   * 
   * Express methods are being caught from middlware, then runs the callback function to handle
   * how the variables given to us by express are stored in this test. 
   * Returns the response object in order to 'chain' the methods as they are in the controller. (.status().json())
   */
  beforeEach(() => {

    mockRequest = {};
    mockResponse = {};
    nextFunction = jest.fn();
    resultJson = {};
    resultStatus = {};

    //'result' is recieved from what is being passed in to '.status' and '.json' when called in middleware.
    mockResponse.status = jest.fn().mockImplementation((result) => {
      resultStatus = result;
      return mockResponse;
    })

    mockResponse.json = jest.fn().mockImplementation((result) => {
      resultJson = result;
      return mockResponse;
    })

  });

  it('Should call next function', () => {
    
    mockRequest = {
      headers: {authorization: 'valid'},
      params: {userId: '1'}
  }   
    restricted(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toBeCalled();

  });

  it('Should call status 400 due to token unable to be parsed', () => {
    
    //Auth token is not correct format (missing 1 character).
    mockRequest = {
      headers: {authorization: 'invalid'},
      params: {userId: '2'}
  }    
    restricted(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(resultStatus).toBe(400);
    expect(resultJson).toEqual({message: 'Cannot parse passed in authorization token'});

  })

  it('Should call status 401 due to incorrect token', () => {

    //Valid auth token, but different userId
    mockRequest = {
      headers: {authorization: 'valid'},
      params: {userId: '2'}
  }
    restricted(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(resultStatus).toBe(401);
    expect(resultJson).toEqual({message: 'You are not authorized to view this information'});

  })

  it('Should call status 401 due to missing userId', () => {

    mockRequest = {
      headers: {authorization: 'valid'},
      params: {}
    }

    restricted(mockRequest as Request, mockResponse as Response, nextFunction);
    
    expect(resultStatus).toBe(401);
    expect(resultJson).toEqual({message: 'You are not authorized to view this information'});

  })

  it('Should call status 400 due to missing auth token', () => {

    mockRequest = {
      headers: {},
      params: {userId: '2'}
    }

    restricted(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(resultStatus).toBe(400);
    expect(resultJson).toEqual({message: 'Bad request, please provide token in authorization headers'});

  })
});
