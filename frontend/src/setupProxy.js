const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', // Change this to your API endpoint
    createProxyMiddleware({
      target: 'http://localhost:8000', // Change to your backend server URL
      changeOrigin: true,
    })
  );
};