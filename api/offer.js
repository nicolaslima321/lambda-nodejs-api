const __MODULE__ = 'Offer';
const { mountedResponse } = require('./utils/response');
const offerService = require('./services/offerService');
const locationService = require('./services/locationService');

module.exports.create = async (event) => {
  const requestBody = JSON.parse(event.body);
  const { ...offerParams } = requestBody;

  if (!offerParams.name || !offerParams.brandId) {
    console.log(`${__MODULE__}@create: Invalid or missing params`, event);
    const body = { message: 'Could not create offer, invalid or missing params' };

    return mountedResponse(body, 400);
  }

  const offerCreated = await offerService.create(offerParams);

  if (!offerCreated) {
    const body = { message: 'Could not create this offer' };
    return mountedResponse(body, 500);
  }

  const body = { message: 'Offer successfully created!', offer: offerCreated };
  return mountedResponse(body, 200);
};

module.exports.linkToLocation = async (event) => {
  const { offerId, locationId } = event.pathParameters;
  console.log(`${__MODULE__}@linkToLocation: Assigning location #${locationId} to offer #${offerId}`, event);

  const offer = await offerService.getById(offerId);
  const location = await locationService.getById(locationId);

  console.debug(`${__MODULE__}@linkToLocation: Offer found`, offer);
  console.debug(`${__MODULE__}@linkToLocation: Location found`, location);

  if (!offer || !location) {
    const body = { message: 'Offer or Location does not exists!' };

    return mountedResponse(body, 404);
  }

  const offerWasLinked = await offerService.linkToLocation(offer, location);

  if (!offerWasLinked) {
    const body = { message: 'Could not link this Offer to this Location' };
    return mountedResponse(body, 500);
  }

    const body = { message: 'Offer successfully linked to this Location' };
    return mountedResponse(body, 200);
};
