const uuid = require('uuid');
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const { mountedResponse } = require('./utils/response');
const { LOCATION_TABLE } = process.env

module.exports.create = async (event) => {
  const requestBody = JSON.parse(event.body);
  const { ...locationParams } = requestBody;

  if (!locationParams.address || !locationParams.brandId) {
    console.error('Bad request');
    const body = { message: 'Could not create location, invalid or missing params' };

    return mountedResponse(body, 400);
  }

  const currentTimestamp = new Date().now;

  const location = {
    id: uuid.v1(),
    address: locationParams.address,
    brandId: locationParams.brandId,
    created: currentTimestamp,
    updated: currentTimestamp,
  };

  const locationInfo = {
    TableName: LOCATION_TABLE,
    Item: location,
  };

  try {
    await dynamoDb.put(locationInfo).promise();
    const body = {
      message: 'Sucessfully created this location',
      locationId: location.id
    };

    return mountedResponse(body, 201);

  } catch (error) {

    const body = { message: 'Could not create this location' };
    return mountedResponse(body, 500);
  }
};
