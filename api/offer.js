const uuid = require('uuid');
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const { DEFAULT_UUID, OFFER_TABLE } = process.env

module.exports.create = async (event) => {
  const requestBody = JSON.parse(event.body);
  let { ...offerParams } = requestBody;

  if (!offerParams.name || !offerParams.brandId) {
    console.error('Bad request');
    
    const response = {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Could not create offer, invalid or missing params'
      }),
    };

    console.log(`response from: ${event.path} statusCode: ${response.statusCode} error:`, error);
    return response;
  }

  const currentTimestamp = new DateTime().now();

  const offer = {
    id: uuid.v1(),
    publisherId: offerParams.publisherId ?? DEFAULT_UUID,
    name: offerParams.name,
    brandId: offerParams.brandId,
    startDate: offerParams.startDate ?? currentTimestamp,
    created: currentTimestamp,
    updated: currentTimestamp,
  };

  const offerInfo = {
    TableName: OFFER_TABLE,
    Item: offer,
  };

  try {
    await dynamoDb.put(offerInfo).promise();
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: `Sucessfully created this offer`,
        offerId: offer.id
      }),
    };

    return response;

  } catch (error) {
    const response = {
      statusCode: 500,
      body: JSON.stringify({
        message: `Could not create this offer`
      }),
    };

    return response;
  }
};
