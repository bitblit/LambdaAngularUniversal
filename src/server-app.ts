import 'zone.js/dist/zone-node';
import 'reflect-metadata';

import { enableProdMode } from '@angular/core';

import { join } from 'path';

import * as express from 'express';
import * as logger from 'morgan';
//import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as awsServerlessExpressMiddleware from 'aws-serverless-express/middleware';
import {Logger} from "@bitblit/ratchet/dist/common/logger";
// Express Engine
import { ngExpressEngine } from '@nguniversal/express-engine';
// Import module map for lazy loading
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';


// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('../dist/server/main.bundle');



export class ServerApp {
  // ref to Express instance
  private express: express.Application;
  private distFolder : string;

  public getExpress() : express.Application
  {
    return this.express;
  }

  //Run configuration methods on the Express instance.
  constructor() {
    // Faster server renders w/ Prod mode (dev mode never needed)
    enableProdMode();

    this.distFolder = process.cwd(); //join(process.cwd(), 'dist');
    Logger.debug("4: Using dist folder : "+this.distFolder);
    //console.log("4: Contents "+fs.readdirSync(this.distFolder));

    this.express = express();
    this.setup();
  }

  // Configure Express.
  private setup(): void {

    this.express.engine('html', ngExpressEngine({
      bootstrap: AppServerModuleNgFactory,
      providers: [
        provideModuleMap(LAZY_MODULE_MAP)
      ]
    }));

    //this.express.set('view engine', 'pug');
    this.express.set('view engine', 'html');
    this.express.set('views', join(this.distFolder, 'browser'));

    this.express.use(logger('dev'));
    // Cannot use this or it breaks angular - do compression at the
    // Cloudfront level instead this.express.use(compression());
    this.express.use(cors());
    //this.express.use(bodyParser.json());
    //this.express.use(bodyParser.urlencoded({extended: true}));
    this.express.use(awsServerlessExpressMiddleware.eventContext());

    this.express.use(function(error, req, res, next){
      Logger.warn("Error bubbled to top : "+error);
      if (res.headersSent)
      {
        Logger.warn("Cannot send 500 - headers already sent");
        return next(error);
      }
      else {
        // Any request to this server will get here, and will send an HTTP
        // response with the error message 'woops'
        res.status(500).json({ errors: [error.message] });
      }
    });

    // Routes must come after middleware

    // TODO: implement data requests securely
    this.express.get('/api/*', (req, res) => {
      res.status(404).send('data requests are not supported');
    });

    // Server stati files from /browser
    this.express.get('*.*', express.static(join(this.distFolder, 'browser')));

    // All regular routes use the Universal engine
    this.express.get('*', (req, res) => {
      console.log("1. Serving "+req.path+" from universal engine");
      res.render(join(this.distFolder, 'browser', 'index.html'), { req });
    });

  }

/*
  private extractPrefix(req:any) : string
  {
    return req.apiGateway ? `https://${req.apiGateway.event.headers.Host}/${req.apiGateway.event.requestContext.stage}` : 'http://localhost:3000';
  }
  */

}
