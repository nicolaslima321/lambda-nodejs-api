const AWS = require('aws-sdk');
AWS.config.update({ region:'us-east-1' });

const dynamoDb = require('aws-sdk/clients/dynamodb');
require('dotenv').config()

const offerService = require('../../api/services/offerService');
const locationService = require('../../api/services/locationService');

let dynamoDbPut;
let dynamoDbGet;
let dynamoDbUpdate;

const offerTableName = process.env.OFFER_TABLE;
const locationTableName = process.env.LOCATION_TABLE;

const offerParams = {
  name: "Super Duper Offer",
  brandId: "692126c8-6e72-4ad7-8a73-25fc2f1f56e4",
  locationsTotal: 0,
};

let mockedOffer = {
  ...offerParams,
  id: "d9b1d9ff-543e-47c7-895f-87f71dcad91b",
  publisherId: "d9b1d9ff-543e-47c7-895f-87f71dcad91b",
};

let mockedLocation = {
  id: "d9b1d9ff-543e-47c7-895f-87f71dcad91b",
  address: "Charlie Brown Street, 68",
  brandId: "692126c8-6e72-4ad7-8a73-25fc2f1f56e4",
  hasOffer: false,
};

describe('Test OfferService >', () => {
  beforeAll(() => {
    dynamoDbPut = jest.spyOn(dynamoDb.DocumentClient.prototype, 'put');
    dynamoDbGet = jest.spyOn(dynamoDb.DocumentClient.prototype, 'get');
    dynamoDbUpdate = jest.spyOn(dynamoDb.DocumentClient.prototype, 'update');
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
        promise: () => Promise.resolve({ Item: mockedOffer }),
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

  describe('linkToLocation', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      offerService.getById = jest.fn();
      locationService.getById = jest.fn();

      offerService.getById.mockReturnValue(mockedOffer);
      locationService.getById.mockReturnValue(mockedLocation);
    })

    it('should update offer and location on db', async () => {
      dynamoDbUpdate.mockImplementation(Item => {
        if (Item.locationsTotal) Item.locationsTotal =+ 1;
        else Item.hasOffer = true;
      });

      dynamoDbUpdate.mockReturnValue({
        promise: () => Promise.resolve(true),
      });

      const offer = await offerService.getById(mockedOffer.id);
      const location = await locationService.getById(mockedLocation.id);

      await offerService.linkToLocation(offer, location);

      expect(offer).toBeDefined();
      expect(typeof offer).toBe('object');

      expect(location).toBeDefined();
      expect(typeof offer).toBe('object');

      expect(dynamoDbUpdate).toHaveBeenCalledTimes(2);

      expect(dynamoDbUpdate).toHaveBeenCalledWith({
        TableName: offerTableName,
        Key: { id: offer.id },
        UpdateExpression: "set locationsTotal = :l",
        ExpressionAttributeValues: { ":l": 1 },
        ReturnValues: "UPDATED_NEW"
      });

      expect(dynamoDbUpdate).toHaveBeenCalledWith({
        TableName: locationTableName,
        Key: { id: location.id },
        UpdateExpression: "set hasOffer = :h",
        ExpressionAttributeValues: { ":h": true },
        ReturnValues: "UPDATED_NEW"
      });

      expect.assertions(7);
    });

    it('should log error on failure', async () => {
      jest.spyOn(console, 'error');

      const offer = await offerService.getById(mockedOffer.id);
      const location = await locationService.getById(mockedLocation.id);

      const rejectionObject = { error: 'foo-bar'};

      dynamoDbUpdate.mockReturnValue({
        promise: () => Promise.reject(rejectionObject),
      });

      await offerService.linkToLocation(offer, location);

      expect(dynamoDbUpdate).toHaveBeenCalledTimes(1);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(
        `OfferService@linkToLocation: An error ocurred to link offer #${offer.id} to location #${location.id}`,
        rejectionObject
      );

      expect.assertions(3);
    });
  });
});
