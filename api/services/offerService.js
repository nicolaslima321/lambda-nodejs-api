const uuid = require('uuid');
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const __MODULE__ = 'OfferService';
const myLodash = require('../utils/myLodash');
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

  const offerFound = await dynamoDb.get(offerParams).promise();

  if (!offerFound || myLodash.objectIsEmpty(offerFound)) {
    console.log(`${__MODULE__}@getById: No offer was found by id ${offerId}`);

    return null;
  }

  const { Item: offer } = offerFound;

  return offer;
};

module.exports.getAll = async () => {
  const offerParams = { TableName: OFFER_TABLE }

  const offersFound = await dynamoDb.scan(offerParams).promise();

  if (!offersFound || myLodash.objectIsEmpty(offersFound)) {
    console.log(`${__MODULE__}@getAll: No offer was found`);

    return null;
  }

  const { Items: offer } = offersFound;

  return offer;
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
