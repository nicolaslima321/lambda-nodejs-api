let offerService = require('../../api/services/offerService');
let locationService = require('../../api/services/locationService');
let brandService = require('../../api/services/brandService');

const offerHandler = require('../../api/offer');

// jest.mock('../../api/services/offerService');
// jest.mock('../../api/services/locationService');
// jest.mock('../../api/services/brandService');

const offerParams = {
  name: "Super Duper Offer",
  brandId: "692126c8-6e72-4ad7-8a73-25fc2f1f56e4",
  startDate: "1633616707",
};

let mockedOffer = {
  ...offerParams,
  id: "d9b1d9ff-543e-47c7-895f-87f71dcad91b",
  publisherId: "d9b1d9ff-543e-47c7-895f-87f71dcad91b",
};

let mockedLocation = {
  id: "d9b1d9ff-543e-47c7-895f-87f71dcad91b",
  address: "Charlie Brown Street, 68",
  brandId: "692126c8-6e72-4ad7-8a73-25fc2f1f56e4",
  hasOffer: false,
};

let mockedBrand = {
  id: "692126c8-6e72-4ad7-8a73-25fc2f1f56e4",
  name: "Starbucks",
};

const showEvent = { pathParameters: { offerId: mockedOffer.id } };
const createEvent = { body: JSON.stringify(offerParams) };

const linkToLocationEvent = {
  pathParameters: {
    offerId: mockedOffer.id,
    locationId: mockedLocation.id,
  }
};

const linkAllBrandsLocationToAnOfferEvent = {
  pathParameters: {
    offerId: mockedOffer.id,
    brandId: mockedBrand.id,
  }
};

describe('Test Offer main lambda function >', () => {
  // beforeAll(() => {

  // });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('index >', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    })

    it('should return all offers, with status 200', async () => {
      const arrayOfMmockedOffers = [ mockedOffer, mockedOffer ];

      offerService.getAll = jest.fn();
      offerService.getAll.mockReturnValue(arrayOfMmockedOffers);

      const response = await offerHandler.index();

      expect(offerService.getAll).toHaveBeenCalledTimes(1);

      expect(response.statusCode).toBe(200);
      expect(response.body).toBe(JSON.stringify({
        message: 'Offers successfully fetched',
        offers: arrayOfMmockedOffers,
      }))

      expect.assertions(3);
    });

    describe('when has no offer', () => {
      it('should return status 404', async () => {
        offerService.getAll = jest.fn();
        offerService.getAll.mockReturnValue(null);

        const response = await offerHandler.index();

        expect(response.statusCode).toBe(404);
        expect(response.body).toBe(JSON.stringify({
          message: 'No offers was found!',
        }))

        expect.assertions(2);
      });
    })
  });

  describe('show >', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    })

    it('should return the given offer, with status 200', async () => {
      offerService.getById = jest.fn();
      offerService.getById.mockReturnValue(mockedOffer);

      const response = await offerHandler.show(showEvent);

      expect(offerService.getById).toHaveBeenCalledTimes(1);
      expect(offerService.getById).toHaveBeenCalledWith(mockedOffer.id);

      expect(response.statusCode).toBe(200);
      expect(response.body).toBe(JSON.stringify({
        message: 'Offer successfully found',
        offer: mockedOffer,
      }))

      expect.assertions(4);
    });

    describe('when has no offer', () => {
      it('should return status 404', async () => {
        offerService.getById = jest.fn();
        offerService.getById.mockReturnValue(null);

        const response = await offerHandler.show(showEvent);

        expect(response.statusCode).toBe(404);
        expect(response.body).toBe(JSON.stringify({
          message: 'No offer was found for given id!',
        }))

        expect.assertions(2);
      });
    })
  });

  describe('create >', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    })

    it('should create and return offer, with status 200', async () => {
      offerService.create = jest.fn();
      offerService.create.mockReturnValue(mockedOffer);

      const response = await offerHandler.create(createEvent);

      expect(offerService.create).toHaveBeenCalledTimes(1);
      expect(offerService.create).toHaveBeenCalledWith(offerParams);

      expect(response.statusCode).toBe(200);
      expect(response.body).toBe(JSON.stringify({
        message: 'Offer successfully created!',
        offer: mockedOffer
      }))

      expect.assertions(4);
    });

    describe('when has required value missing', () => {
      it('should return status 400', async () => {
        const response = await offerHandler.create({ body: JSON.stringify({}) });

        expect(response.statusCode).toBe(400);
        expect(response.body).toBe(JSON.stringify({
          message: 'Could not create offer, invalid or missing params',
        }))

        expect.assertions(2);
      });
    })

    describe('when has an unexpected problem on creation', () => {
      it('should return status 500', async () => {
        offerService.create = jest.fn();
        offerService.create.mockReturnValue(false);

        const response = await offerHandler.create(createEvent);

        expect(response.statusCode).toBe(500);
        expect(response.body).toBe(JSON.stringify({
          message: 'Could not create this offer',
        }))

        expect.assertions(2);
      });
    })
  });

  describe('linkAllBrandsLocationToAnOffer >', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    })

    it('should assign all offers, and return with status 200', async () => {
      offerService.getById = jest.fn();
      offerService.linkToLocation = jest.fn();
      brandService.getAllLocationsFromBrand = jest.fn();

      offerService.getById.mockReturnValue(mockedOffer);
      offerService.linkToLocation.mockReturnValue(Promise.resolve({
        status: 'fulfilled',
      }));
      brandService.getAllLocationsFromBrand.mockReturnValue([
        mockedLocation, mockedLocation, mockedLocation,
      ]);

      const response = await offerHandler.linkAllBrandsLocationToAnOffer(
        linkAllBrandsLocationToAnOfferEvent,
      );

      expect(offerService.linkToLocation).toHaveBeenCalledTimes(3);
      expect(offerService.linkToLocation).toHaveBeenCalledWith(mockedOffer, mockedLocation);

      expect(response.statusCode).toBe(200);
      expect(response.body).toBe(JSON.stringify({
        message: 'The action was successfully completed!',
      }));

      expect.assertions(4);
    });

    describe('when has 10000 locations to assign', () => {
      it('should call offerService.linkToLocation 10000 successfully times', async () => {
        offerService.getById = jest.fn();
        offerService.linkToLocation = jest.fn();
        brandService.getAllLocationsFromBrand = jest.fn();

        offerService.getById.mockReturnValue(mockedOffer);
        offerService.linkToLocation.mockReturnValue(Promise.resolve({
          status: 'fulfilled',
        }));

        brandService.getAllLocationsFromBrand.mockReturnValue(Array(10000).fill(mockedLocation));

        const response = await offerHandler.linkAllBrandsLocationToAnOffer(
          linkAllBrandsLocationToAnOfferEvent,
        );

        expect(offerService.linkToLocation).toHaveBeenCalledTimes(10000);
        expect(offerService.linkToLocation).toHaveBeenCalledWith(mockedOffer, mockedLocation);

        expect(response.statusCode).toBe(200);
        expect(response.body).toBe(JSON.stringify({
          message: 'The action was successfully completed!',
        }));

        expect.assertions(4);
      });

      describe('when has some failure in one of the 10000 locations to assign', () => {
        it('should call offerService.linkToLocation 10000 times and advice about failure', async () => {
          offerService.getById = jest.fn();
          offerService.linkToLocation = jest.fn();
          brandService.getAllLocationsFromBrand = jest.fn();

          offerService.getById.mockReturnValue(mockedOffer);
          offerService.linkToLocation.mockReturnValue(Promise.resolve({
            status: 'fulfilled',
          })).mockReturnValueOnce(Promise.reject({
            status: 'rejected',
          }));

          brandService.getAllLocationsFromBrand.mockReturnValue(Array(10000).fill(mockedLocation));

          const response = await offerHandler.linkAllBrandsLocationToAnOffer(
            linkAllBrandsLocationToAnOfferEvent,
          );

          expect(offerService.linkToLocation).toHaveBeenCalledTimes(10000);
          expect(offerService.linkToLocation).toHaveBeenCalledWith(mockedOffer, mockedLocation);

          expect(response.statusCode).toBe(200);
          expect(response.body).toBe(JSON.stringify({
            message: 'The action was completed, but not entirely successfull, some locations were not linked to this offer. Try again to link all them',
          }));

          expect.assertions(4);
        });
      });
    });

    describe('when has some failure at one of the assignment promises', () => {
      it('should successfully assign some offers and advice to retry, returning status 200', async () => {
        offerService.getById = jest.fn();
        offerService.linkToLocation = jest.fn();
        brandService.getAllLocationsFromBrand = jest.fn();

        offerService.getById.mockReturnValue(mockedOffer);
        offerService.linkToLocation.mockReturnValue(Promise.resolve({
          status: 'fulfilled',
        })).mockReturnValueOnce(Promise.reject({
          status: 'rejected',
        }));

        brandService.getAllLocationsFromBrand.mockReturnValue([
          mockedLocation, mockedLocation, mockedLocation,
        ]);

        const response = await offerHandler.linkAllBrandsLocationToAnOffer(
          linkAllBrandsLocationToAnOfferEvent,
        );

        expect(offerService.linkToLocation).toHaveBeenCalledTimes(3);
        expect(offerService.linkToLocation).toHaveBeenCalledWith(mockedOffer, mockedLocation);

        expect(response.statusCode).toBe(200);
        expect(response.body).toBe(JSON.stringify({
          message: 'The action was completed, but not entirely successfull, some locations were not linked to this offer. Try again to link all them',
        }));

        expect.assertions(4);
      });
    });

    describe('when all assignment promises got failure', () => {
      it('throws exception, log error and return status 500', async () => {
        jest.spyOn(console, 'error');

        offerService.getById = jest.fn();
        offerService.linkToLocation = jest.fn();
        brandService.getAllLocationsFromBrand = jest.fn();

        offerService.getById.mockReturnValue(mockedOffer);
        offerService.linkToLocation.mockReturnValue(Promise.reject({
          status: 'rejected',
        }));

        brandService.getAllLocationsFromBrand.mockReturnValue([
          mockedLocation, mockedLocation, mockedLocation,
        ]);

        const response = await offerHandler.linkAllBrandsLocationToAnOffer(
          linkAllBrandsLocationToAnOfferEvent,
        );

        expect(offerService.linkToLocation).toHaveBeenCalledTimes(3);
        expect(offerService.linkToLocation).toHaveBeenCalledWith(mockedOffer, mockedLocation);

        const raisedException = 'Could not perform assignment, all promises has failed';
        expect(console.error).toHaveBeenCalledWith(
          'Offer@linkAllBrandsLocationToAnOffer: An unexpected error ocurred', raisedException,
        );

        expect(response.statusCode).toBe(500);
        expect(response.body).toBe(JSON.stringify({
          message: 'Could not perform brands location assignment',
        }));

        expect.assertions(5);
      });
    });

    describe('when offer was not found', () => {
      it('should return status 404', async () => {
        offerService.getById = jest.fn();
        offerService.getById.mockReturnValue(null);

        const response = await offerHandler.linkAllBrandsLocationToAnOffer(
          linkAllBrandsLocationToAnOfferEvent,
        );

        expect(offerService.getById).toHaveBeenCalledTimes(1);
        expect(offerService.getById).toHaveBeenCalledWith(mockedOffer.id);

        expect(response.statusCode).toBe(404);
        expect(response.body).toBe(JSON.stringify({
          message: 'Offer does not exists!',
        }));

        expect.assertions(4);
      });
    })

    describe('when location was not found', () => {
      it('should return status 404', async () => {
        offerService.getById = jest.fn();
        offerService.getById.mockReturnValue(mockedOffer);

        brandService.getAllLocationsFromBrand = jest.fn();
        brandService.getAllLocationsFromBrand.mockReturnValue([]);

        const response = await offerHandler.linkAllBrandsLocationToAnOffer(
          linkAllBrandsLocationToAnOfferEvent,
        );

        expect(brandService.getAllLocationsFromBrand).toHaveBeenCalledTimes(1);
        expect(brandService.getAllLocationsFromBrand).toHaveBeenCalledWith(mockedBrand.id);

        expect(response.statusCode).toBe(404);
        expect(response.body).toBe(JSON.stringify({
          message: 'No Locations were found for this brand!',
        }));

        expect.assertions(4);
      });
    });

    describe('when has failure to get location', () => {
      it('should return status 404', async () => {
        offerService.getById = jest.fn();
        offerService.getById.mockReturnValue(mockedOffer);

        brandService.getAllLocationsFromBrand = jest.fn();
        brandService.getAllLocationsFromBrand.mockReturnValue(null);

        const response = await offerHandler.linkAllBrandsLocationToAnOffer(
          linkAllBrandsLocationToAnOfferEvent,
        );

        expect(brandService.getAllLocationsFromBrand).toHaveBeenCalledTimes(1);
        expect(brandService.getAllLocationsFromBrand).toHaveBeenCalledWith(mockedBrand.id);

        expect(response.statusCode).toBe(500);
        expect(response.body).toBe(JSON.stringify({
          message: 'An error ocurred while fetching all locations',
        }));

        expect.assertions(4);
      });
    });
  });
});
