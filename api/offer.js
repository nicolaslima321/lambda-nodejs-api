const __MODULE__ = 'Offer';
const { mountedResponse } = require('./utils/response');
const brandService = require('./services/brandService');
const offerService = require('./services/offerService');
const locationService = require('./services/locationService');

module.exports.index = async (event) => {
  console.log(`${__MODULE__}@index: Fetch all offers`, event);

  const offers = await offerService.getAll();

  if (!offers) {
    const body = { message: 'No offers was found!' };

    return mountedResponse(body, 404);
  }

  const body = { message: 'Offers successfully fetched', offers };

  return mountedResponse(body, 200);
};

module.exports.show = async (event) => {
  const { offerId } = event.pathParameters;
  console.log(`${__MODULE__}@show: Show offer #${offerId}`, event);

  const offer = await offerService.getById(offerId);

  if (!offer) {
    const body = { message: 'No offer was found for given id!' };

    return mountedResponse(body, 404);
  }

  const body = { message: 'Offer successfully found', offer };

  return mountedResponse(body, 200);
};

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

module.exports.linkAllBrandsLocationToAnOffer = async (event) => {
  const { offerId, brandId } = event.pathParameters;
  console.log(`${__MODULE__}@linkAllBrandsLocationToAnOffer: Assigning all locations from brand #${brandId} to offer #${offerId}`, event);

  const offer = await offerService.getById(offerId);
  const locations = await brandService.getAllLocationsFromBrand(brandId);

  console.debug(`${__MODULE__}@linkAllBrandsLocationToAnOffer: Offer found`, offer);
  console.debug(`${__MODULE__}@linkAllBrandsLocationToAnOffer: Locations found`, locations);

  if (!offer) {
    const body = { message: 'Offer does not exists!' };

    return mountedResponse(body, 404);
  }

  if (locations && locations.length == 0) {
    const body = { message: 'No Locations were found for this brand!' };

    return mountedResponse(body, 404);
  }

  if (!locations) {
    const body = { message: 'An error ocurred while fetching all locations' };
    return mountedResponse(body, 500);
  }

  try {
    const assignmentPromises = locations.map((location) => {
      offer.locationsTotal += 1;
      return offerService.linkToLocation(offer, location);
    });

    const results = await Promise.allSettled(assignmentPromises);

    const hasSomeFailure = results.some(result => result.status == 'rejected');

    if (hasSomeFailure) {
      const body = { message: 'The action was completed, but not entirely successfull, some locations were not linked to this offer. Try again to link all them' };

      return mountedResponse(body, 200);
    }

    const body = { message: 'The action was successfully completed!' };

    return mountedResponse(body, 200);

  } catch (error) {
    console.error(`${__MODULE__}@linkAllBrandsLocationToAnOffer: An unexpected error ocurred`, error);

    const body = { message: 'Could not perform brands location assignment' };

    return mountedResponse(body, 500);
  }
};
