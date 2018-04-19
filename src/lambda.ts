// This is the implementation of the Lambda interface that handles incoming requests from API gateway and
// hands them off to the awsServerlessExpress library to convert them into something that express recognizes,
// which is then converted into something Angular recognizes

import * as awsServerlessExpress from 'aws-serverless-express';
import {ServerApp} from './server-app';

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

var express = new ServerApp().getExpress();
var server = awsServerlessExpress.createServer(express, function(){console.log("ServerListenCallback");}, binaryMimeTypes);
export default function lambdaHandler(event, context){awsServerlessExpress.proxy(server, event, context)};
