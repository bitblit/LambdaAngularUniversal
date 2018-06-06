# LambdaAngularUniversal

**Updated June 5th, 2018**

This project unites several of my most commonly used technologies in a way that solves a lot of problems for me.  Specifically:

1.  I use Angular 6.x because the model feels comfortable to me and Typescript makes it maintainable.  It is in my
sweet spot between being able to build a tight, useable interface but still have close control over the HTML.
2. Angular 6.x creates a problem though - websites built with it have an initial slow load and worse, they perform
quite poorly on SEO unless you do a bunch of extra work.
3. Angular Universal (now part of Angular proper) solves problem #2 by pre-rendering the content on the server.  Web
crawlers get the pre-rendered version, and the javascript shows up some seconds later converting it into a 
single page app.  But then you have to run a server on the back end.  I hate running servers because I am both
lazy and cheap.
4. Lambda + API Gateway removes the need for me to run a server by just running the code in Lambda and using API gateway
to convert HTTP requests into Lambda events, but historically the tooling for using API gateway requests was kinda rough.
Plus, it was a huge pain to deploy.  
5. Cloudformation SAM templates take care of the deployment pain.
6. Previously I used the **aws-serverless-express** library as a bridge, but with the June release of this I am removing
it and Express since it was kinda unnecessary overhead for the simplistic use case here.
7. We'll use a custom generated AWS SSL certificate so our website is HTTPS everywhere.

So that's the big summary of what I'm doing in this project.  Combining Angular6+AngularUniversal+AWSServerlessExpress to
create an Angular app that is SEO friendly and dirty cheap to run.

## Technology links

* [Angular] (https://angular.io)
* [Angular Universal] (https://angular.io/guide/universal)
* [AWS Serverless Express example template] (https://github.com/awslabs/aws-serverless-express/tree/master/example)

## TODO List
* CORS
* Whitelabel handler?

## Prerequisites

Using this is pretty straightforward.  You'll need an AWS account, and keys running on your local machine for
that account that basically have Power User priv.  Step them down later once you seen just how many privs you're
going to need.  You'll also need to know the AWS account ID.  Oh, and you need Node (^8.10) and NPM.

## First Run

Clone the code, remove its Github link so you can substitute your own, and install all the dependencies :  

```
git clone git@github.com:bitblit/LambdaAngularUniversal.git
cd LambdaAngularUniversal
rm -Rf .git
npm install
```

Then, you'll want to make a copy of the environment file and edit it, filling in your details

```
cp sample-env-file.env .env
```

Don't worry, .env is in .gitignore so it won't get committed.  If you are using an CI environment like CircleCI for
deployment you'll want to put those variables into its environmental variables, NOT in a file that gets checked in.

* LAU_ACCOUNT_ID : this is obvious
* LAU_S3_BUCKET : From here on in, deployments will cause the whole thing to be zipped and sent to a bucket first.  This bucket.
* LAU_AWS_REGION : AWS region.  I'd use **us-east-1**, but that just me.
* LAU_FUNCTION_NAME: Name for the lambda function that will be created.

Make sure that the bucket exists, and that your selected AWS cli credentials have the authority to do things on the
selected account.  Setting up privs is outside the scope of this document.

Finally, do an initial deployment like so:

```
npm run package-deploy
```

This should create the stack.  If you go to CloudFormation you should see it in there, and one of the outputs will
be the url at which you can find the system.  You can also get this by heading over to API gateway and looking for it there.

## Making it useful

The template ships with the Tour of Heroes app from Angular already in place.  I do this since its a pretty good
way to tell if everything is working, since it has multiple routes, relatively intricate pages, etc.  In general
you'll want to nuke the contents of src/app and replace it with your application, but then if you are an 
Angular developer you probably already figured that out on your own.

Ok, so there is one thing that is pretty important here.  In your app.module.ts file, you are likely importing
**BrowserModule**.  That needs to become **BrowserModule.withServerTransition({ appId: 'some-id' })** (TODO: what 
are the constraints on appId here?).  

You need to add these imports:

```
import { PLATFORM_ID, APP_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
```

Additionally, your

```
export class AppModule {
}
```

needs to become 

```
export class AppModule {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(APP_ID) private appId: string) {
    const platform = isPlatformBrowser(platformId) ?
      'in the browser' : 'on the server';
    console.log(`Running ${platform} with appId=${appId}`);
  }
}
```

There are other things you need to know about running Angular universal (mainly around not
promiscuously using the window object because that can't be simulated server side) but you should
read the Angular Universal docs for that stuff.


## Subsequent runs

Future deployments can be done by running:

```
npm run package-deploy
```

## Removal

If you want to remove one of these just go to Cloudformation and delete the stack.  Cloud formation will take
care of nuking everything downstream of there.  Or, locally you can run : 

```
npm run delete-stack
```

## Running locally

Just the standard Angular endpoint:

```
npm run start
```

This runs Angular like you would if you weren't using Universal et al.  Much faster for day-to-day development.


## Weird notes

Since this is a combination of a bunch of relatively bleeding-edge tech, and because I am no NodeJS expert,
there are a couple weirdnesses going on in here that I am putting here as reminders to myself as why I am
doing them.

* Since this goes into Lambda, we have to include everything we want from node_modules.  We do that by
running an npm install into the dist directory, basically
* fsevents includes a tar package that has bad file modification dates in it.  Zip won't accept files
older than 1980 for some reason.  So there is a find command in here to path those

## 2018-06-04 : Updating to Angular 6

On 2018-06-04 to 05 I updated this to use Angular 6 (I used the notes at https://dev.to/chiangs/upgrading-to-angular-6-309p and
also https://github.com/hapinessjs/ng-universal-module).  The good news is that it works.  The bad news is that,
at least with the Angular TOH codebase that I ported the --prod flag does not work.  I am merging it forward so 
that I can do further testing but obviously I'd like to fix that.  If you wish to use the Angular5 version of
this codebase, you can checkout the **2018-06-04-Working-Angular-5** tag, which is the last work I'll be 
doing on the Angular 5 version.  

If you'd like to use Angular6, but want to test it in prod mode for yourself, all you have to do is edit package.json
and add --prod to the **ng build** command in the **build-client-and-server-bundles** script.

Once I get it working for prod mode, this note should go away (except the tag for 5, which I'll leave in here indefinitely)

# Contributing

Pull requests are welcome, although I'm not sure why you'd be interested!
