export const environment = {
  production: false,
  apiUrl: '',
  database: {
    host: 'localhost',
    port: 5432,
    name: 'demo_db',
    user: 'demo_user',
    password: 'demo_pass',
  },
  superset: {
    baseUrl: '/superset-proxy',
    username: 'admin',
    password: 'admin',
  },
};
