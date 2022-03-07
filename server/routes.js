// @ts-check

export default (app) => {
  app.get('/', { name: 'root' }, (req, reply) => {
    const serverMessage = process.env.SERVER_MESSAGE;

    reply.view('index', { serverMessage });
  });
  app.get('/error', { name: 'error' }, () => {
    throw new Error('Oops! Something went wrong!');
  });
};
