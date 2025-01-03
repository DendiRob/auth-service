module.exports = async () => {
  process.env.FRONTEND_DOMAIN = 'http://localhost:5454';

  process.env.ACCESS_SECRET = 'ACCESS_SECRET';
  process.env.REFRESH_SECRET = 'REFRESH_SECRET';

  process.env.ACCESS_TOKEN_LIFE = '600';
  process.env.REFRESH_TOKEN_LIFE = '604800';
  process.env.REFRESH_TOKEN_HEADER = 'refresh-token';

  process.env.CONFIRMATION_USER_LIFE = '600000';
  process.env.FORGOTTEN_PASSWORD_SESSION_LIFE = '600000';
};
// TODO: надо все сделать водном конфиг файле
