const __MODULE__ = 'Offer';
const { mountedResponse } = require('./utils/response');
const offerService = require('./services/offerService');

module.exports.create = async (event) => {
  const requestBody = JSON.parse(event.body);
  const { ...offerParams } = requestBody;

  if (!offerParams.name || !offerParams.brandId) {
    console.log(`${__MODULE__}@create: Invalid or missing params`, event);
    const body = { message: 'Could not create offer, invalid or missing params' };

    return mountedResponse(body, 400);
  }

  const offerCreated = offerService.create(offerParams);

  if (!offerCreated) {
    const body = { message: 'Could not create this offer' };
    return mountedResponse(body, 500);
  }

  const body = { message: 'Offer successfully created!', offer: offerCreated };
  return mountedResponse(body, 200);
};

module.exports.linkToLocation = async (event) => {
  const { offerId, locationId } = event.pathParameters;

  // TODO: get location and offer and send as parameters
  const offerWasLinked = offerService.linkToLocation(offerId, locationId);

  if (!offerWasLinked) {
    const body = { message: 'Could not link this Offer to this Location' };
    return mountedResponse(body, 500);
  }

    const body = { message: 'Offer successfully linked to this Location' };
    return mountedResponse(body, 200);
};
