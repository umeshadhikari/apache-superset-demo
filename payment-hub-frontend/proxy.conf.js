module.exports = {
  '/api': {
    target: 'http://localhost:8080',
    secure: false,
    changeOrigin: true
  },
  '/superset-proxy': {
    target: 'http://localhost:8088',
    secure: false,
    pathRewrite: { '^/superset-proxy': '' },
    changeOrigin: true,
    on: {
      // Dev only: remove headers that would block iframe embedding in the local Angular app.
      proxyRes: function (proxyRes) {
        delete proxyRes.headers['x-frame-options'];
        delete proxyRes.headers['content-security-policy'];
      }
    }
  }
};
