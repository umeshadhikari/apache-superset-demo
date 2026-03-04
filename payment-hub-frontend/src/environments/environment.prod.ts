export const environment = {
  production: true,
  apiUrl: '',
  database: {
    host: 'localhost',
    port: 5432,
    name: 'demo_db',
    user: 'demo_user',
    password: 'demo_pass',
  },
  superset: {
    baseUrl: 'http://localhost:8088',
    username: 'admin',
    password: 'admin',
  },
};
