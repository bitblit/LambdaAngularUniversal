"use strict";

var fs = require("fs");
var lambda = require("./lambda");
var zlib = require('zlib');


var evtString = fs.readFileSync('./sample-api-gateway-event.json').toString('ascii');
var evt = JSON.parse(evtString);
var context = {
};


function unzip(input, options={}){
  var promise = new Promise<Buffer>(function (resolve, reject) {
    zlib.gunzip(input, options, function (error, result) {
      if (!error) resolve(result);else reject(error);
    });
  });
  return promise;
};

var callback = function(err,value)
{
  if (err)
  {
    console.error("Callback failed with : "+err);
  }
  else
  {
    console.log("Lambda success : Result was : \n"+JSON.stringify(value));

    if (value && value.isBase64Encoded)
    {
      var decoded = Buffer.from(value.body,'base64');
      if (value.headers['content-encoding']=='gzip')
      {
        console.log("Decoded unzipped body is : \n");
        zlib.gunzip(decoded, {}, function (error, result) {
          if (error)
          {
            console.log("Error unzipping : "+error);
          }
          else
          {
            console.log("Decoded unzipped body is : \n");
            console.log(result.toString('ascii'));
          }
        });
      }
      else {
        console.log("Decoded body is : \n");
        console.log(decoded.toString('ascii'));
      }
    }

  }

};




console.log("About to run handler");
lambda.handler(evt, context, callback);
