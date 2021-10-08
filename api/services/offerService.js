const uuid = require('uuid');
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const __MODULE__ = 'OfferService';
const { DEFAULT_UUID, LOCATION_TABLE, OFFER_TABLE } = process.env

module.exports.create = async (offerParams) => {
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

  const offerInfo = { TableName: OFFER_TABLE, Item: offer };

  try {
    await dynamoDb.put(offerInfo).promise();

    return offer;

  } catch (error) {
    console.error(`${__MODULE__}@create: An error ocurred for offer creation`, error);

    return false;
  }
};

module.exports.getById = async (offerId) => {
  const offerParams = { TableName: OFFER_TABLE, Key: { id: offerId } }

  return await dynamoDb.get(offerParams).promise();
};

module.exports.linkToLocation = async (offer, location) => {
  const locationParams = {
    TableName: LOCATION_TABLE,
    Key: { id: location.id },
    UpdateExpression: "set hasOffer = :h",
    ExpressionAttributeValues: { ":h": true },
    ReturnValues: "UPDATED_NEW"
  };

  const offerParams = {
    TableName: OFFER_TABLE,
    Key: { id: offer.id },
    UpdateExpression: "set locationsTotal = :l",
    ExpressionAttributeValues: { ":l": offer.locationsTotal + 1 },
    ReturnValues: "UPDATED_NEW"
  };

  try {
    await dynamoDb.update(offerParams).promise();
    await dynamoDb.update(locationParams).promise();

    return true;
  } catch (error) {
    console.error(`${__MODULE__}@linkToLocation: An error ocurred to link offer #${offer.id} to location #${location.id}`, error);

    return false;
  }
};
