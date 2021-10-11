const AWS = require('aws-sdk');
AWS.config.update({ region:'us-east-1' });

const dynamoDb = require('aws-sdk/clients/dynamodb');
require('dotenv').config()

const locationService = require('../../api/services/locationService');

let dynamoDbPut;
let dynamoDbGet;
let dynamoDbScan;

const locationTableName = process.env.LOCATION_TABLE;

const locationParams = {
  address: "Konohagakure, 172",
  brandId: "692126c8-6e72-4ad7-8a73-25fc2f1f56e4",
  hasOffer: false,
};

let mockedLocation = {
  ...locationParams,
  id: "d9b1d9ff-543e-47c7-895f-87f71dcad91b",
};

describe('Test LocationService >', () => {
  beforeAll(() => {
    dynamoDbPut = jest.spyOn(dynamoDb.DocumentClient.prototype, 'put');
    dynamoDbGet = jest.spyOn(dynamoDb.DocumentClient.prototype, 'get');
    dynamoDbScan = jest.spyOn(dynamoDb.DocumentClient.prototype, 'scan');
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    })

    it('should create item on db and return location', async () => {
      dynamoDbPut.mockReturnValue({
        promise: () => Promise.resolve('data'),
      });

      const location = await locationService.create(locationParams);

      expect(location).toHaveProperty('id');
      expect(location).toHaveProperty('address', locationParams.address);
      expect(location).toHaveProperty('brandId', locationParams.brandId);
      expect(location).toHaveProperty('hasOffer', false);
      expect(location).toHaveProperty('created');
      expect(location).toHaveProperty('updated');

      expect(dynamoDbPut).toHaveBeenCalledTimes(1);
      expect(dynamoDbPut).toHaveBeenCalledWith({
        TableName: locationTableName,
        Item: expect.any(Object),
      });

      expect.assertions(8);
    });

    it('should log error and return false on failure', async () => {
      jest.spyOn(console, 'error');

      const rejectionObject = { error: 'foo-bar'};

      dynamoDbPut.mockReturnValue({
        promise: () => Promise.reject(rejectionObject),
      });

      await locationService.create(locationParams);

      expect(dynamoDbPut).toHaveBeenCalledTimes(1);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(
        'LocationService@create: An error ocurred for location creation',
        rejectionObject
      );

      expect.assertions(3);
    });
  });

  describe('getById', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    })

    it('should get item on db', async () => {
      dynamoDbGet.mockReturnValue({
        promise: () => Promise.resolve({ Item: mockedLocation }),
      });

      const location = await locationService.getById(mockedLocation.id);

      expect(location).toBeDefined();
      expect(typeof location).toBe('object');

      expect(dynamoDbGet).toHaveBeenCalledTimes(1);
      expect(dynamoDbGet).toHaveBeenCalledWith({
        TableName: locationTableName,
        Key: { id: mockedLocation.id },
      });

      expect.assertions(4);
    });

    it('should return null when item does not exists on db', async () => {
      dynamoDbGet.mockReturnValue({
        promise: () => Promise.resolve(null),
      });

      const location = await locationService.getById(123);

      expect(location).toBeNull();

      expect(dynamoDbGet).toHaveBeenCalledTimes(1);
      expect(dynamoDbGet).toHaveBeenCalledWith({
        TableName: locationTableName,
        Key: { id: 123 },
      });

      expect.assertions(3);
    });
  });

  describe('getAll', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    })

    it('should get all items on db', async () => {
      dynamoDbScan.mockReturnValue({
        promise: () => Promise.resolve({ Items: [ mockedLocation, mockedLocation ] }),
      });

      const locations = await locationService.getAll();

      expect(locations).toBeDefined();
      expect(Array.isArray(locations)).toBeTruthy();
      expect(locations.length).toBe(2);

      expect(dynamoDbScan).toHaveBeenCalledTimes(1);
      expect(dynamoDbScan).toHaveBeenCalledWith({ TableName: locationTableName });

      expect.assertions(5);
    });

    it('should return null when item does not exists on db', async () => {
      dynamoDbScan.mockReturnValue({
        promise: () => Promise.resolve(null),
      });

      const location = await locationService.getAll();

      expect(location).toBeNull();

      expect(dynamoDbScan).toHaveBeenCalledTimes(1);
      expect(dynamoDbScan).toHaveBeenCalledWith({ TableName: locationTableName });

      expect.assertions(3);
    });
  });
});
