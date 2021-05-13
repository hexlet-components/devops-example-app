// @ts-check

const _ = require('lodash');

module.exports = (app) => {
  app.get('/', { name: 'root' }, (req, reply) => {
    const serverIp = _.get(process.env, 'SERVER_IP', 'не определен');
    reply.view('index', { serverIp });
  });
};
