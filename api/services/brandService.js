const uuid = require('uuid');
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const __MODULE__ = 'BrandService';
const myLodash = require('../utils/myLodash');
const { LOCATION_TABLE, BRAND_TABLE } = process.env

module.exports.create = async (brandParams) => {
  const currentTimestamp = new Date().now;

  const brand = {
    id: uuid.v1(),
    name: brandParams.name,
    created: currentTimestamp,
    updated: currentTimestamp,
  };

  const brandInfo = { TableName: BRAND_TABLE, Item: brand };

  try {
    await dynamoDb.put(brandInfo).promise();

    return brand;

  } catch (error) {
    console.error(`${__MODULE__}@create: An error ocurred for brand creation`, error);

    return false;
  }
};

module.exports.getById = async (brandId) => {
  const brandParams = { TableName: BRAND_TABLE, Key: { id: brandId } }

  const brandFound = await dynamoDb.get(brandParams).promise();

  if (!brandFound || myLodash.objectIsEmpty(brandFound)) {
    console.log(`${__MODULE__}@getById: No brand was found by id ${brandId}`);

    return null;
  }

  const { Item: brand } = brandFound;

  return brand;
};

module.exports.getAll = async () => {
  const brandParams = { TableName: BRAND_TABLE }

  const brandsFound = await dynamoDb.scan(brandParams).promise();

  if (!brandsFound || myLodash.objectIsEmpty(brandsFound)) {
    console.log(`${__MODULE__}@getAll: No brand was found`);

    return null;
  }

  const { Items: brand } = brandsFound;

  return brand;
};

module.exports.getAllLocationsFromBrand = async (brandId) => {
  const locationQuery = {
    FilterExpression: 'brandId = :brandId AND hasOffer = :hasOffer',
    ExpressionAttributeValues: {
      ':brandId': brandId,
      ':hasOffer': false,
    },
    ProjectionExpression: 'id, brandId, hasOffer, address',
    TableName: LOCATION_TABLE,
  };

  try {
    const { Items: locations } = await dynamoDb.scan(locationQuery).promise();

    if (!locations || locations.length < 1) {
      console.log(`${__MODULE__}@getAllLocationsFromBrand: No locations were found by brandId ${brandId}`);

      return [];
    }

    return locations;

  } catch (error) {
    console.error(`${__MODULE__}@getAllLocationsFromBrand: An error ocurred for locations fetch`, error);

    return null;
  }
};
