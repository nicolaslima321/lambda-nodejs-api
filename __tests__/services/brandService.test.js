const AWS = require('aws-sdk');
AWS.config.update({ region:'us-east-1' });

const dynamoDb = require('aws-sdk/clients/dynamodb');
require('dotenv').config()

const brandService = require('../../api/services/brandService');

let dynamoDbPut;
let dynamoDbGet;
let dynamoDbScan;

const brandTableName = process.env.BRAND_TABLE;
const locationTableName = process.env.LOCATION_TABLE;

const brandParams = { name: "Starbucks" };

let mockedBrand = {
  ...brandParams,
  id: "d9b1d9ff-543e-47c7-895f-87f71dcad91b",
};

const mockedLocation = {
  id: "d9b1d9ff-543e-47c7-895f-87f71dcad91b",
  address: "Konohagakure, 172",
  brandId: mockedBrand.id,
  hasOffer: false,
};

describe('Test BrandService >', () => {
  beforeAll(() => {
    dynamoDbPut = jest.spyOn(dynamoDb.DocumentClient.prototype, 'put');
    dynamoDbGet = jest.spyOn(dynamoDb.DocumentClient.prototype, 'get');
    dynamoDbScan = jest.spyOn(dynamoDb.DocumentClient.prototype, 'scan');
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('create >', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    })

    it('should create item on db and return brand', async () => {
      dynamoDbPut.mockReturnValue({
        promise: () => Promise.resolve('data'),
      });

      const brand = await brandService.create(brandParams);

      expect(brand).toHaveProperty('id');
      expect(brand).toHaveProperty('name', brandParams.name);
      expect(brand).toHaveProperty('created');
      expect(brand).toHaveProperty('updated');

      expect(dynamoDbPut).toHaveBeenCalledTimes(1);
      expect(dynamoDbPut).toHaveBeenCalledWith({
        TableName: brandTableName,
        Item: expect.any(Object),
      });

      expect.assertions(6);
    });

    it('should log error and return false on failure', async () => {
      jest.spyOn(console, 'error');

      const rejectionObject = { error: 'foo-bar'};

      dynamoDbPut.mockReturnValue({
        promise: () => Promise.reject(rejectionObject),
      });

      await brandService.create(brandParams);

      expect(dynamoDbPut).toHaveBeenCalledTimes(1);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(
        'BrandService@create: An error ocurred for brand creation',
        rejectionObject
      );

      expect.assertions(3);
    });
  });

  describe('getById >', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    })

    it('should get item on db', async () => {
      dynamoDbGet.mockReturnValue({
        promise: () => Promise.resolve({ Item: mockedBrand }),
      });

      const brand = await brandService.getById(mockedBrand.id);

      expect(brand).toBeDefined();
      expect(typeof brand).toBe('object');

      expect(dynamoDbGet).toHaveBeenCalledTimes(1);
      expect(dynamoDbGet).toHaveBeenCalledWith({
        TableName: brandTableName,
        Key: { id: mockedBrand.id },
      });

      expect.assertions(4);
    });

    it('should return null when item does not exists on db', async () => {
      dynamoDbGet.mockReturnValue({
        promise: () => Promise.resolve(null),
      });

      const brand = await brandService.getById(123);

      expect(brand).toBeNull();

      expect(dynamoDbGet).toHaveBeenCalledTimes(1);
      expect(dynamoDbGet).toHaveBeenCalledWith({
        TableName: brandTableName,
        Key: { id: 123 },
      });

      expect.assertions(3);
    });
  });

  describe('getAll >', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    })

    it('should get all items on db', async () => {
      dynamoDbScan.mockReturnValue({
        promise: () => Promise.resolve({ Items: [ mockedBrand, mockedBrand ] }),
      });

      const brands = await brandService.getAll();

      expect(brands).toBeDefined();
      expect(Array.isArray(brands)).toBeTruthy();
      expect(brands.length).toBe(2);

      expect(dynamoDbScan).toHaveBeenCalledTimes(1);
      expect(dynamoDbScan).toHaveBeenCalledWith({ TableName: brandTableName });

      expect.assertions(5);
    });

    it('should return null when item does not exists on db', async () => {
      dynamoDbScan.mockReturnValue({
        promise: () => Promise.resolve(null),
      });

      const brand = await brandService.getAll();

      expect(brand).toBeNull();

      expect(dynamoDbScan).toHaveBeenCalledTimes(1);
      expect(dynamoDbScan).toHaveBeenCalledWith({ TableName: brandTableName });

      expect.assertions(3);
    });
  });

  describe('getAllLocationsFromBrand >', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    })

    it('should get all locations associated to a brand', async () => {
      dynamoDbScan.mockReturnValue({
        promise: () => Promise.resolve({ Items: [ mockedLocation, mockedLocation ] }),
      });

      const locations = await brandService.getAllLocationsFromBrand(mockedBrand.id);

      expect(locations).toBeDefined();
      expect(Array.isArray(locations)).toBeTruthy();
      expect(locations.length).toBe(2);

      expect(dynamoDbScan).toHaveBeenCalledTimes(1);
      expect(dynamoDbScan).toHaveBeenCalledWith({
        FilterExpression: 'brandId = :brandId AND hasOffer = :hasOffer',
        ExpressionAttributeValues: {
          ':brandId': mockedBrand.id,
          ':hasOffer': mockedLocation.hasOffer,
        },
        ProjectionExpression: 'id, brandId, hasOffer, address',
        TableName: locationTableName,
      });

      expect.assertions(5);
    });

    it('should return null when theres no locations', async () => {
      dynamoDbScan.mockReturnValue({
        promise: () => Promise.resolve({ Items: [] }),
      });

      const locations = await brandService.getAllLocationsFromBrand(mockedBrand.id);

      expect(locations).toStrictEqual([]);

      expect(dynamoDbScan).toHaveBeenCalledTimes(1);
      expect(dynamoDbScan).toHaveBeenCalledWith({
        FilterExpression: 'brandId = :brandId AND hasOffer = :hasOffer',
        ExpressionAttributeValues: {
          ':brandId': mockedBrand.id,
          ':hasOffer': mockedLocation.hasOffer,
        },
        ProjectionExpression: 'id, brandId, hasOffer, address',
        TableName: locationTableName,
      });

      expect.assertions(3);
    });

    it('should log error and return null on failure', async () => {
      jest.spyOn(console, 'error');

      const rejectionObject = { error: 'foo-bar'};

      dynamoDbScan.mockReturnValue({
        promise: () => Promise.reject(rejectionObject),
      });

      const locations = await brandService.getAllLocationsFromBrand(mockedBrand.id);

      expect(locations).toBeNull();

      expect(dynamoDbScan).toHaveBeenCalledTimes(1);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(
        'BrandService@getAllLocationsFromBrand: An error ocurred for locations fetch',
        rejectionObject
      );

      expect.assertions(4);
    });
  });
});
