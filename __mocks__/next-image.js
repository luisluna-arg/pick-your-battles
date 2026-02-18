const React = require('react');

function Image({ src, alt, width, height, className, ...rest }) {
  return React.createElement('img', { src, alt, width, height, className, ...rest });
}

module.exports = { __esModule: true, default: Image };
