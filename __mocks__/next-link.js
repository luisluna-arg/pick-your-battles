const React = require('react');

function Link({ href, children, className, ...rest }) {
  return React.createElement('a', { href, className, ...rest }, children);
}

module.exports = { __esModule: true, default: Link };
