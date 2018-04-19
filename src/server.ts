
import {ServerApp} from './server-app';
//import * as awsServerlessExpress from 'aws-serverless-express';

//console.log((awsServerlessExpress)?"Loaded ASE":"Failed to load ASE");

const PORT = process.env.PORT || 4001;

new ServerApp().getExpress().listen(PORT);
console.log(`listening on http://localhost:${PORT}`);


//export default function lambdaHandler(event, context) {console.log("Running lambda handler!");return{"output":"a test"}};

