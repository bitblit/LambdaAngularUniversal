"use strict";

var fs = require("fs");
var lambda = require("./lambda");

var evtString = fs.readFileSync('./sample-api-gateway-event.json').toString('ascii');
var evt = JSON.parse(evtString);
var context = {
};
var callback = function(err,value)
{
  if (err)
  {
    console.error("Callback errored with : "+err);
  }
  else
  {
    console.log("Lambda success : Result was : \n"+JSON.stringify(value));
  }

};




console.log("About to run handler");
lambda.handler(evt, context, callback);
