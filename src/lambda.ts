import {Callback, Context, Handler} from "aws-lambda";
import * as fs from 'fs';
import 'zone.js/dist/zone-node';
import 'reflect-metadata';

import { enableProdMode } from '@angular/core';

import { NgModuleFactory, Type, CompilerFactory, Compiler, StaticProvider } from '@angular/core';
import { ResourceLoader } from '@angular/compiler';
import {
  INITIAL_CONFIG,
  renderModuleFactory,
  platformDynamicServer
} from '@angular/platform-server';

const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('../dist/server/main.bundle');


import { FileLoader } from './file-loader';
import {provideModuleMap} from "@nguniversal/module-map-ngfactory-loader";
import {join} from "path";

/**
 * These are the allowed options for the engine
 */
export interface NgSetupOptions {
  bootstrap: Type<{}> | NgModuleFactory<{}>;
  providers?: StaticProvider[];
}

/**
 * These are the allowed options for the render
 */
export interface RenderOptions extends NgSetupOptions {
  req: Request;
  res?: Response;
  url?: string;
  document?: string;
}

/**
 * This holds a cached version of each index used.
 */
const templateCache: { [key: string]: string } = {};

/**
 * Map of Module Factories
 */
const factoryCacheMap = new Map<Type<{}>, NgModuleFactory<{}>>();

/**
 * Get a factory from a bootstrapped module/ module factory
 */
function getFactory(
  moduleOrFactory: Type<{}> | NgModuleFactory<{}>, compiler: Compiler
): Promise<NgModuleFactory<{}>> {
  return new Promise<NgModuleFactory<{}>>((resolve, reject) => {
    // If module has been compiled AoT
    if (moduleOrFactory instanceof NgModuleFactory) {
      resolve(moduleOrFactory);
      return;
    } else {
      let moduleFactory = factoryCacheMap.get(moduleOrFactory);

      // If module factory is cached
      if (moduleFactory) {
        resolve(moduleFactory);
        return;
      }

      // Compile the module and cache it
      compiler.compileModuleAsync(moduleOrFactory)
        .then((factory) => {
          factoryCacheMap.set(moduleOrFactory, factory);
          resolve(factory);
        }, (err => {
          reject(err);
        }));
    }
  });
}

/**
 * Get the document at the file path
 */
function getDocument(filePath: string): string {
  return templateCache[filePath] = templateCache[filePath] || fs.readFileSync(filePath).toString();
}


/**
 * Bridge from a lambda event to angular universal
 * @param event
 * @param {Context} context
 * @param {Callback} callback
 */
const handler: Handler = (event: any, context: Context, callback: Callback) => {

  enableProdMode();

  debugger;

  try {
  let setupOptions : NgSetupOptions=
  {
    bootstrap: AppServerModuleNgFactory,
      providers: [
    provideModuleMap(LAZY_MODULE_MAP)
  ]
  };
  //const moduleOrFactory = options.bootstrap || setupOptions.bootstrap;

  const moduleOrFactory = setupOptions.bootstrap;

  const compilerFactory: CompilerFactory = platformDynamicServer().injector.get(CompilerFactory);
  const compiler: Compiler = compilerFactory.createCompiler([
    {
      providers: [
        { provide: ResourceLoader, useClass: FileLoader, deps: [] }
      ]
    }
  ]);


  const filePath = join(process.cwd(), 'browser', 'index.html');
  const url = event.path;

  const extraProviders = setupOptions.providers.concat(
    //options.providers,
    //getReqResProviders(options.req, options.res),
    [
      {
        provide: INITIAL_CONFIG,
        useValue: {
          document: getDocument(filePath), // options.document || getDocument(filePath)
          url: url// options.url //|| options.req.originalUrl
        }
      }
    ]);

  //const extraProviders = setupOptions.providers;

  getFactory(moduleOrFactory, compiler)
    .then(factory => {
      return renderModuleFactory(factory, {
        extraProviders
      });
    })
    .then((html: string) => {
      callback(null,html);
    }, (err) => {
      callback(err);
    });
} catch (err) {
  callback(err);
}
};

export {handler};
