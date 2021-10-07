const uuid = require('uuid');
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const { mountedResponse } = require('./utils/response');
const { DEFAULT_UUID, OFFER_TABLE } = process.env

module.exports.create = async (event) => {
  const requestBody = JSON.parse(event.body);
  const { ...offerParams } = requestBody;

  if (!offerParams.name || !offerParams.brandId) {
    console.error('Bad request');
    const body = { message: 'Could not create offer, invalid or missing params' };

    return mountedResponse(body, 400);
  }

  const currentTimestamp = new DateTime().now();

  const offer = {
    id: uuid.v1(),
    publisherId: offerParams.publisherId || DEFAULT_UUID,
    name: offerParams.name,
    brandId: offerParams.brandId,
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
