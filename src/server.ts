
// This file allows serving the Angular-Universal (server side rendered) version on your local machine
// See lambda.ts for the wrapper used when doing the same thing through Lambda/API Gateway
import {ServerApp} from './server-app';

const PORT = process.env.PORT || 4001;

new ServerApp().getExpress().listen(PORT);
console.log(`listening on http://localhost:${PORT}`);

