const AWS = require('aws-sdk');
AWS.config.update({ region:'us-east-1' });

const dynamoDb = require('aws-sdk/clients/dynamodb');
require('dotenv').config()

const offerService = require('../../api/services/offerService');

let dynamoDbPut;
let dynamoDbGet;

const offerTableName = 'offer-dev';
const offerParams = {
  name: "Super Duper Offer",
  brandId: "692126c8-6e72-4ad7-8a73-25fc2f1f56e4",
  locationsTotal: 0,
};

const mockedOffer = {
  ...offerParams,
  id: "d9b1d9ff-543e-47c7-895f-87f71dcad91b",
  locationsTotal: "d9b1d9ff-543e-47c7-895f-87f71dcad91b",
};

describe('Test OfferService >', () => {
  beforeAll(() => {
    dynamoDbPut = jest.spyOn(dynamoDb.DocumentClient.prototype, 'put');
    dynamoDbGet = jest.spyOn(dynamoDb.DocumentClient.prototype, 'get');
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    })

    it('should create item on db and return offer', async () => {
      dynamoDbPut.mockReturnValue({
        promise: () => Promise.resolve('data'),
      });

      const offer = await offerService.create(offerParams);

      expect(offer).toHaveProperty('id');
      expect(offer).toHaveProperty('publisherId', process.env.DEFAULT_UUID);
      expect(offer).toHaveProperty('name', offerParams.name);
      expect(offer).toHaveProperty('brandId', offerParams.brandId);
      expect(offer).toHaveProperty('locationsTotal', 0);
      expect(offer).toHaveProperty('startDate');
      expect(offer).toHaveProperty('created');
      expect(offer).toHaveProperty('updated');

      expect(dynamoDbPut).toHaveBeenCalledTimes(1);
      expect(dynamoDbPut).toHaveBeenCalledWith({
        TableName: offerTableName,
        Item: expect.any(Object),
      });

      expect.assertions(10);
    });

    it('should log error and return false on failure', async () => {
      jest.spyOn(console, 'error');

      const rejectionObject = { error: 'foo-bar'};

      dynamoDbPut.mockReturnValue({
        promise: () => Promise.reject(rejectionObject),
      });

      await offerService.create(offerParams);

      expect(dynamoDbPut).toHaveBeenCalledTimes(1);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(
        'OfferService@create: An error ocurred for offer creation',
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
        promise: () => Promise.resolve(mockedOffer),
      });

      const offer = await offerService.getById(mockedOffer.id);

      expect(offer).toBeDefined();
      expect(typeof offer).toBe('object');

      expect(dynamoDbGet).toHaveBeenCalledTimes(1);
      expect(dynamoDbGet).toHaveBeenCalledWith({
        TableName: offerTableName,
        Key: { id: mockedOffer.id },
      });

      expect.assertions(4);
    });

    it('should return null when item does not exists on db', async () => {
      dynamoDbGet.mockReturnValue({
        promise: () => Promise.resolve(null),
      });

      const offer = await offerService.getById(123);

      expect(offer).toBeNull();

      expect(dynamoDbGet).toHaveBeenCalledTimes(1);
      expect(dynamoDbGet).toHaveBeenCalledWith({
        TableName: offerTableName,
        Key: { id: 123 },
      });

      expect.assertions(3);
    });
  });
});
