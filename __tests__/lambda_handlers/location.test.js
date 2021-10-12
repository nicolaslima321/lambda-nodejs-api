let locationService = require('../../api/services/locationService');

const locationHandler = require('../../api/location');

const locationParams = {
  address: "Lorem Ipsum Dolor Street, 102",
  brandId: "692126c8-6e72-4ad7-8a73-25fc2f1f56e4",
};

let mockedLocation = {
  id: "d9b1d9ff-543e-47c7-895f-87f71dcad91b",
  address: "Lorem Ipsum Dolor Street, 68",
  brandId: "692126c8-6e72-4ad7-8a73-25fc2f1f56e4",
  hasOffer: false,
};

const showEvent = { pathParameters: { locationId: mockedLocation.id } };
const createEvent = { body: JSON.stringify(locationParams) };

describe('Test Location main lambda function >', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('index >', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    })

    it('should return all locations, with status 200', async () => {
      const arrayOfMockedLocations = [ mockedLocation, mockedLocation ];

      locationService.getAll = jest.fn();
      locationService.getAll.mockReturnValue(arrayOfMockedLocations);

      const response = await locationHandler.index();

      expect(locationService.getAll).toHaveBeenCalledTimes(1);

      expect(response.statusCode).toBe(200);
      expect(response.body).toBe(JSON.stringify({
        message: 'Locations successfully fetched',
        locations: arrayOfMockedLocations,
      }))

      expect.assertions(3);
    });

    describe('when has no location', () => {
      it('should return status 404', async () => {
        locationService.getAll = jest.fn();
        locationService.getAll.mockReturnValue(null);

        const response = await locationHandler.index();

        expect(response.statusCode).toBe(404);
        expect(response.body).toBe(JSON.stringify({
          message: 'No locations was found!',
        }))

        expect.assertions(2);
      });
    })
  });

  describe('show >', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    })

    it('should return the given location, with status 200', async () => {
      locationService.getById = jest.fn();
      locationService.getById.mockReturnValue(mockedLocation);

      const response = await locationHandler.show(showEvent);

      expect(locationService.getById).toHaveBeenCalledTimes(1);
      expect(locationService.getById).toHaveBeenCalledWith(mockedLocation.id);

      expect(response.statusCode).toBe(200);
      expect(response.body).toBe(JSON.stringify({
        message: 'Location successfully found',
        location: mockedLocation,
      }))

      expect.assertions(4);
    });

    describe('when has no location', () => {
      it('should return status 404', async () => {
        locationService.getById = jest.fn();
        locationService.getById.mockReturnValue(null);

        const response = await locationHandler.show(showEvent);

        expect(response.statusCode).toBe(404);
        expect(response.body).toBe(JSON.stringify({
          message: 'No location was found for given id!',
        }))

        expect.assertions(2);
      });
    })
  });

  describe('create >', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    })

    it('should create and return location, with status 200', async () => {
      locationService.create = jest.fn();
      locationService.create.mockReturnValue(mockedLocation);

      const response = await locationHandler.create(createEvent);

      expect(locationService.create).toHaveBeenCalledTimes(1);
      expect(locationService.create).toHaveBeenCalledWith(locationParams);

      expect(response.statusCode).toBe(200);
      expect(response.body).toBe(JSON.stringify({
        message: 'Location successfully created!',
        location: mockedLocation
      }))

      expect.assertions(4);
    });

    describe('when has required value missing', () => {
      it('should return status 400', async () => {
        const response = await locationHandler.create({ body: JSON.stringify({}) });

        expect(response.statusCode).toBe(400);
        expect(response.body).toBe(JSON.stringify({
          message: 'Could not create location, invalid or missing params',
        }))

        expect.assertions(2);
      });
    })

    describe('when has an unexpected problem on creation', () => {
      it('should return status 500', async () => {
        locationService.create = jest.fn();
        locationService.create.mockReturnValue(false);

        const response = await locationHandler.create(createEvent);

        expect(response.statusCode).toBe(500);
        expect(response.body).toBe(JSON.stringify({
          message: 'Could not create this location',
        }))

        expect.assertions(2);
      });
    })
  });
});
