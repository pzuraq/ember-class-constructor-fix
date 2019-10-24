'use strict';

// This bug can only occur in browser targets that don't transpile native classes,
// no reason to test IE11 or other older browsers
const browsers = [
  'last 1 Chrome versions',
  'last 1 Firefox versions',
  'last 1 Safari versions'
];

module.exports = {
  browsers
};
