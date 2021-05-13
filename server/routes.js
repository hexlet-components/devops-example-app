/* eslint no-param-reassign: ["error", { "props": false }] */

module.exports = (app) => {
  app.get('/', { name: 'root' }, (req, reply) => {
    const serverIp = process.env.SERVER_IP ?? 'IP не определен';
    reply.view('index', { serverIp });
  });
};
