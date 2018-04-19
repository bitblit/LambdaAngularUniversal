"use strict"
console.log("a");
var awsServerlessExpress =require('aws-serverless-express');
console.log("b");
var serverApp = require("./server");
console.log("c");

// NOTE: If you get ERR_CONTENT_DECODING_FAILED in your browser, this is likely
// due to a compressed response (e.g. gzip) which has not been handled correctly
// by aws-serverless-express and/or API Gateway. Add the necessary MIME types to
// binaryMimeTypes below, then redeploy (`npm run package-deploy`)
var binaryMimeTypes = [
  'application/javascript',
  'application/json',
  'application/octet-stream',
  'application/xml',
  'font/eot',
  'font/opentype',
  'font/otf',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'text/comma-separated-values',
  'text/css',
  'text/html',
  'text/javascript',
  'text/plain',
  'text/text',
  'text/xml'
];

console.log("In lambda.js, sa : "+serverApp);
var express = new ServerApp().getExpress();
console.log("Created express : "+express);
var server = awsServerlessExpress.createServer(express, function(){console.log("ServerListenCallback");}, binaryMimeTypes);
console.log("Created server : "+server);
exports.handler = function(event, context){awsServerlessExpress.proxy(server, event, context)};
