const __MODULE__ = 'Brand';
const { mountedResponse } = require('./utils/response');
const brandService = require('./services/brandService');

module.exports.index = async (event) => {
  console.log(`${__MODULE__}@index: Fetch all brands`, event);

  const brands = await brandService.getAll();

  if (!brands) {
    const body = { message: 'No brands was found!' };

    return mountedResponse(body, 404);
  }

  const body = { message: 'Brands successfully fetched', brands };

  return mountedResponse(body, 200);
};

module.exports.show = async (event) => {
  const { brandId } = event.pathParameters;
  console.log(`${__MODULE__}@show: Show brand #${brandId}`, event);

  const brand = await brandService.getById(brandId);

  if (!brand) {
    const body = { message: 'No brand was found for given id!' };

    return mountedResponse(body, 404);
  }

  const body = { message: 'Brand successfully found', brand };

  return mountedResponse(body, 200);
};

module.exports.create = async (event) => {
  const requestBody = JSON.parse(event.body);
  const { ...brandParams } = requestBody;

  if (!brandParams.name) {
    console.log(`${__MODULE__}@create: Invalid or missing params`, event);
    const body = { message: 'Could not create brand, invalid or missing params' };

    return mountedResponse(body, 400);
  }

  const brandCreated = await brandService.create(brandParams);

  if (!brandCreated) {
    const body = { message: 'Could not create this brand' };
    return mountedResponse(body, 500);
  }

  const body = { message: 'Brand successfully created!', brand: brandCreated };
  return mountedResponse(body, 200);
};
