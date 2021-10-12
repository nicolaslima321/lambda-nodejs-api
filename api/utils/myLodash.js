module.exports.objectIsEmpty = (object) => {
  if (typeof object != 'object') return;
  return Object.keys(object).length === 0
}
