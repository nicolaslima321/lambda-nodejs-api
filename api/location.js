const __MODULE__ = 'Location';
const { mountedResponse } = require('./utils/response');
const locationService = require('./services/locationService');

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
