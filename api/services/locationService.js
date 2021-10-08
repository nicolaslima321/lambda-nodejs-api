const uuid = require('uuid');
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const __MODULE__ = 'LocationService';
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

  try {
    return await dynamoDb.get(locationParams).promise();

  } catch (error) {
    console.error(`${__MODULE__}@getById: An error ocurred to get location #${locationId}`, error);

    return null;
  }
};
