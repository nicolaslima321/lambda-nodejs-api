const uuid = require('uuid');
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const { mountedResponse } = require('./utils/response');
const { DEFAULT_UUID, LOCATION_TABLE, OFFER_TABLE } = process.env

module.exports.create = async (event) => {
  const requestBody = JSON.parse(event.body);
  const { ...offerParams } = requestBody;

  if (!offerParams.name || !offerParams.brandId) {
    console.error('Bad request');
    const body = { message: 'Could not create offer, invalid or missing params' };

    return mountedResponse(body, 400);
  }

  const currentTimestamp = new Date().now;

  const offer = {
    id: uuid.v1(),
    publisherId: offerParams.publisherId || DEFAULT_UUID,
    name: offerParams.name,
    brandId: offerParams.brandId,
    locationsTotal: 0,
    startDate: offerParams.startDate || currentTimestamp,
    created: currentTimestamp,
    updated: currentTimestamp,
  };

  const offerInfo = {
    TableName: OFFER_TABLE,
    Item: offer,
  };

  try {
    await dynamoDb.put(offerInfo).promise();
    const body = {
      message: 'Sucessfully created this offer',
      offerId: offer.id
    };

    return mountedResponse(body, 201);

  } catch (error) {

    const body = { message: 'Could not create this offer' };
    return mountedResponse(body, 500);
  }
};

module.exports.linkToLocation = async (event) => {
  const { offerId, locationId } = event.pathParameters;

  // TODO: Refactor all Offer & Location operations to an service
  const offerParams = {
    TableName: OFFER_TABLE,
    Key: { id: offerId }
  }

  const locationParams = {
    TableName: LOCATION_TABLE,
    Key: { id: locationId }
  }

  try {
    offer = await dynamoDb.get(offerParams).promise();
    location = await dynamoDb.get(locationParams).promise();

    const locationParams = {
      TableName: LOCATION_TABLE,
      Key: { locationId },
      UpdateExpression: "set hasOffer = :h",
      ExpressionAttributeValues: { ":h": true },
      ReturnValues: "UPDATED_NEW"
    };

    const offerParams = {
      TableName: OFFER_TABLE,
      Key: { offerId },
      UpdateExpression: "set locationsTotal = :l",
      ExpressionAttributeValues: { ":l": offer.locationsTotal + 1 },
      ReturnValues: "UPDATED_NEW"
    };

    await dynamoDb.update(offerParams).promise();
    await dynamoDb.update(locationParams).promise();

    const body = { message: 'Offer successfully linked to this Location' };

    return mountedResponse(body, 200);

  } catch (error) {
    console.log(error);
    const body = { message: 'Could not link this Offer to this Location' };

    return mountedResponse(body, 500);
  }
};
