const uuid = require('uuid');
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const __MODULE__ = 'BrandService';
const { LOCATION_TABLE, BRAND_TABLE } = process.env

module.exports.create = async (brandName) => {
  const currentTimestamp = new Date().now;

  const brand = {
    id: uuid.v1(),
    name: brandName,
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
