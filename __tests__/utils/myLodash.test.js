const myLodash = require('../../api/utils/myLodash');

describe('myLodash >', () => {
  describe('objectIsEmpty >', () => {
    describe('when receives an filled object', () => {
      it('should return false', () => {
        const objectIsEmpty = myLodash.objectIsEmpty({ lorem: 'ipsum' });

        expect(objectIsEmpty).toBeFalsy();
        expect.assertions(1);
      });
    });

    describe('when receives an empty object', () => {
      it('should return true', () => {
        const objectIsEmpty = myLodash.objectIsEmpty({});

        expect(objectIsEmpty).toBeTruthy();
        expect.assertions(1);
      });
    });

    describe('when receives anything that arent a object', () => {
      it('should do nothing', () => {
        const objectIsEmpty = myLodash.objectIsEmpty('foobar');

        expect(objectIsEmpty).toBeUndefined();
        expect.assertions(1);
      });
    });
  });
});