export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
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
