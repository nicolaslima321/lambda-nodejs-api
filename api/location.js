const __MODULE__ = 'Location';
const { mountedResponse } = require('./utils/response');
const locationService = require('./services/locationService');

module.exports.index = async (event) => {
  console.log(`${__MODULE__}@index: Fetch all locations`, event);

  const locations = await locationService.getAll();

  if (!locations) {
    const body = { message: 'No locations was found!' };

    return mountedResponse(body, 404);
  }

  const body = { message: 'Locations successfully fetched', locations };

  return mountedResponse(body, 200);
};

module.exports.show = async (event) => {
  const { locationId } = event.pathParameters;
  console.log(`${__MODULE__}@show: Show location #${locationId}`, event);

  const location = await locationService.getById(locationId);

  if (!location) {
    const body = { message: 'No location was found for given id!' };

    return mountedResponse(body, 404);
  }

  const body = { message: 'Location successfully found', location };

  return mountedResponse(body, 200);
};

module.exports.create = async (event) => {
  const requestBody = JSON.parse(event.body);
  const { ...locationParams } = requestBody;

  if (!locationParams.address || !locationParams.brandId) {
    console.log(`${__MODULE__}@create: Invalid or missing params`, event);
    const body = { message: 'Could not create location, invalid or missing params' };

    return mountedResponse(body, 400);
  }

  const locationCreated = await locationService.create(locationParams);

  if (!locationCreated) {
    const body = { message: 'Could not create this location' };
    return mountedResponse(body, 500);
  }

  const body = { message: 'Location successfully created!', offer: locationCreated };
  return mountedResponse(body, 200);
};
