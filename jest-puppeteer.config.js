module.exports = {
  server: {
    command: 'npm start',
    port: 5000,
    launchTimeout: 10000,
  },
  launch: {
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
    args: [
      '--no-sandbox',
    ],
  },
};
