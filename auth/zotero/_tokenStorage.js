const storage = {};

module.exports = {
  get: function (type) {
    return storage[type];
  },
  set: function (type, token) {
    storage[type] = token;
  },
  debug: function () {
    console.log('----------------------');
    console.log('TokenStorage contents:');
    console.log(JSON.stringify(storage, null, 2));
    console.log('----------------------');
  }
};
