#!/usr/bin/env node

const getApp = require('../index.js');

const port = process.env.PORT || 5000;
const host = '0.0.0.0';

getApp().listen(port, host, () => {
  // eslint-disable-next-line
  console.log(`Server is running on port: ${port}`);
});
