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

  describe('index', () => {
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

  describe('getById', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    })

    it('should return the given offer, with status 200', async () => {
      offerService.getAll = jest.fn();
      offerService.getAll.mockReturnValue(mockedOffer);

      const response = await offerHandler.show(showEvent);

      expect(offerService.getById).toHaveBeenCalledTimes(1);
      expect(offerService.getById).toHaveBeenCalledWith(mockedOffer.id);

      expect(response.statusCode).toBe(200);
      expect(response.body).toBe(JSON.stringify({
        message: 'Offer successfully found',
        offer: mockedOffer,
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

  describe('create', () => {
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
});
