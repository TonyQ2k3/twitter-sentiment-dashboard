const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', // Change this to your API endpoint
    createProxyMiddleware({
      target: `${process.env.REACT_APP_API}`, // Change to your backend server URL
      changeOrigin: true,
    })
  );
};