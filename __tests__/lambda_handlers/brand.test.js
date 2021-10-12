let brandService = require('../../api/services/brandService');

const brandHandler = require('../../api/brand');

const brandParams = {
  name: "Starbucks",
};

let mockedBrand = {
  id: "692126c8-6e72-4ad7-8a73-25fc2f1f56e4",
  name: "Starbucks",
};

const showEvent = { pathParameters: { brandId: mockedBrand.id } };
const createEvent = { body: JSON.stringify(brandParams) };

describe('Test Brand main lambda function >', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('index >', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    })

    it('should return all brands, with status 200', async () => {
      const arrayOfMockedBrands = [ mockedBrand, mockedBrand ];

      brandService.getAll = jest.fn();
      brandService.getAll.mockReturnValue(arrayOfMockedBrands);

      const response = await brandHandler.index();

      expect(brandService.getAll).toHaveBeenCalledTimes(1);

      expect(response.statusCode).toBe(200);
      expect(response.body).toBe(JSON.stringify({
        message: 'Brands successfully fetched',
        brands: arrayOfMockedBrands,
      }))

      expect.assertions(3);
    });

    describe('when has no brand', () => {
      it('should return status 404', async () => {
        brandService.getAll = jest.fn();
        brandService.getAll.mockReturnValue(null);

        const response = await brandHandler.index();

        expect(response.statusCode).toBe(404);
        expect(response.body).toBe(JSON.stringify({
          message: 'No brands was found!',
        }))

        expect.assertions(2);
      });
    })
  });

  describe('show >', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    })

    it('should return the given brand, with status 200', async () => {
      brandService.getById = jest.fn();
      brandService.getById.mockReturnValue(mockedBrand);

      const response = await brandHandler.show(showEvent);

      expect(brandService.getById).toHaveBeenCalledTimes(1);
      expect(brandService.getById).toHaveBeenCalledWith(mockedBrand.id);

      expect(response.statusCode).toBe(200);
      expect(response.body).toBe(JSON.stringify({
        message: 'Brand successfully found',
        brand: mockedBrand,
      }))

      expect.assertions(4);
    });

    describe('when has no brand', () => {
      it('should return status 404', async () => {
        brandService.getById = jest.fn();
        brandService.getById.mockReturnValue(null);

        const response = await brandHandler.show(showEvent);

        expect(response.statusCode).toBe(404);
        expect(response.body).toBe(JSON.stringify({
          message: 'No brand was found for given id!',
        }))

        expect.assertions(2);
      });
    })
  });

  describe('create >', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    })

    it('should create and return brand, with status 200', async () => {
      brandService.create = jest.fn();
      brandService.create.mockReturnValue(mockedBrand);

      const response = await brandHandler.create(createEvent);

      expect(brandService.create).toHaveBeenCalledTimes(1);
      expect(brandService.create).toHaveBeenCalledWith(brandParams);

      expect(response.statusCode).toBe(200);
      expect(response.body).toBe(JSON.stringify({
        message: 'Brand successfully created!',
        brand: mockedBrand
      }))

      expect.assertions(4);
    });

    describe('when has required value missing', () => {
      it('should return status 400', async () => {
        const response = await brandHandler.create({ body: JSON.stringify({}) });

        expect(response.statusCode).toBe(400);
        expect(response.body).toBe(JSON.stringify({
          message: 'Could not create brand, invalid or missing params',
        }))

        expect.assertions(2);
      });
    })

    describe('when has an unexpected problem on creation', () => {
      it('should return status 500', async () => {
        brandService.create = jest.fn();
        brandService.create.mockReturnValue(false);

        const response = await brandHandler.create(createEvent);

        expect(response.statusCode).toBe(500);
        expect(response.body).toBe(JSON.stringify({
          message: 'Could not create this brand',
        }))

        expect.assertions(2);
      });
    })
  });
});
