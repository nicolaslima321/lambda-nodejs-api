const uuid = require('uuid');
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const __MODULE__ = 'LocationService';
const myLodash = require('../utils/myLodash');
const { LOCATION_TABLE } = process.env

module.exports.create = async (locationParams) => {
  const currentTimestamp = new Date().now;

  const location = {
    id: uuid.v1(),
    address: locationParams.address,
    brandId: locationParams.brandId,
    hasOffer: false,
    created: currentTimestamp,
    updated: currentTimestamp,
  };

  const locationInfo = { TableName: LOCATION_TABLE, Item: location };

  try {
    await dynamoDb.put(locationInfo).promise();

    return location;

  } catch (error) {
    console.error(`${__MODULE__}@create: An error ocurred for location creation`, error);

    return false;
  }
};

module.exports.getById = async (locationId) => {
  const locationParams = { TableName: LOCATION_TABLE, Key: { id: locationId } }

  const locationFound = await dynamoDb.get(locationParams).promise();

  if (!locationFound || myLodash.objectIsEmpty(locationFound)) {
    console.log(`${__MODULE__}@getById: No location was found by id ${locationId}`);

    return null;
  }

  const { Item: location } = locationFound;

  return location;
};
