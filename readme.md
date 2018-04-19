# LambdaAngularUniversal

**Updated April 19th, 2018**

This project unites several of my most commonly used technologies in a way that solves a lot of problems for me.  Specifically:

1.  I use Angular 5.x because the model feels comfortable to me and Typescript makes it maintainable.  It is in my
sweet spot between being able to build a tight, useable interface but still have close control over the HTML.
2. Angular 5.x creates a problem though - websites built with it have an initial slow load and worse, they perform
quite poorly on SEO unless you do a bunch of extra work.
3. Angular Universal (now part of Angular proper) solves problem #2 by pre-rendering the content on the server.  Web
crawlers get the pre-rendered version, and the javascript shows up some seconds later converting it into a 
single page app.  But then you have to run a server on the back end.  I hate running servers because I am both
lazy and cheap.
4. Lambda + API Gateway removes the need for me to run a server by just running the code in Lambda and using API gateway
to convert HTTP requests into Lambda events, but historically the tooling for using API gateway requests was kinda rough.
Plus, it was a huge pain to deploy.  
5. Cloudformation SAM templates take care of the deployment pain.
6. A library, **aws-serverless-express** acts as an adapter allowing one to run a generic express application atop
lambda.  It even includes a tool for easily bootstrapping your first release.  It isn't in Typescript though, so
I fix that.
7. API gateway, by default, requires you to mount your API under a "stage" name, the first part of the path.  We'll 
fix that by mapping a custom domain name to the root in API gateway.  We'll also use a custom generated AWS
SSL certificate so our website is HTTPS everywhere.

So thats the big summary of what I'm doing in this project.  Combining Angular5+AngularUniversal+AWSServerlessExpress to
create an Angular app that is SEO friendly and dirty cheap to run.

## Technology links

* [Angular] (https://angular.io)
* [Angular Universal] (https://angular.io/guide/universal)
* [AWS Serverless Express example template] (https://github.com/awslabs/aws-serverless-express/tree/master/example)

## Prerequisites

Using this is pretty straightforward.  You'll need an AWS account, and keys running on your local machine for
that account that basically have Power User priv.  Step them down later once you seen just how many privs you're
going to need.  You'll also need to know the AWS account ID.

## Usage

Clone the code and remove its Github link so you can substitute your own: 

```
git clone git@github.com:bitblit/LambdaAngularUniversal.git
cd LambdaAngularUniversal
rm -Rf .git
```

Then, you want to run configuration script:

```
node scripts/configure
```

# Contributing

Pull requests are welcome, although I'm not sure why you'd be interested!
