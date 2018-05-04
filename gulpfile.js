require('dotenv').config();

const gulp = require('gulp');
const del = require('del');
const touch = require('gulp-touch-fd');
const install = require('gulp-install');
const replace = require('gulp-replace');
const run = require('gulp-run-command').default;

const vars = {
  s3BucketName: process.env.S3_BUCKET_NAME,
  region: process.env.AWS_REGION,
  cloudFormationStackName: process.env.CF_STACK_NAME,
  functionName: process.env.LAMBDA_FUNCTION_NAME,
  accountId: process.env.AWS_ACCOUNT_ID
};

const placeholders = {
  [vars.functionName]: 'YOUR_SERVERLESS_EXPRESS_LAMBDA_FUNCTION_NAME',
  [vars.accountId]: 'YOUR_ACCOUNT_ID',
  [vars.region]: 'YOUR_AWS_REGION',
  [vars.s3BucketName]: 'OUR_UNIQUE_BUCKET_NAME'
}

const paths = {
  src: 'src',
  dist: 'dist',
  tmp: 'tmp'
};

gulp.task('clean', () => {
  return del([paths.dist, paths.tmp]);
});

gulp.task('build:full', () => {
  gulp.src(['scripts/test-lambda.js', 'scripts/*.json']).pipe(gulp.dest(paths.dist));
})

gulp.task('build:lambda', ['build:fixDates'], () => {
  return del(`${paths.dist}/package*.json`)
});

gulp.task('build:fixDates', ['build:modules'], () => {
  return gulp.src(`${paths.dist}/node_modules/fsevents/**/*`).pipe(gulp.dest(`${paths.dist}/node_modules/fsevents`)).pipe(touch());
})

gulp.task('build:modules', () => {
  return gulp.src('package.json')
    .pipe(gulp.dest(paths.dist))
    .pipe(
      install({
        production: true
      })
    ).on('end', () => {
      del(`${paths.dist}/package*.json`);
    });
});

gulp.task('configure:templates', () => {
  return gulp.src(['cloudformation.yaml', 'simple-proxy-api.yaml']).
  pipe(replace(placeholders[vars.functionName], vars.functionName)).
  pipe(replace(placeholders[vars.accountId], vars.accountId)).
  pipe(replace(placeholders[vars.s3BucketName], vars.s3BucketName)).
  pipe(replace(placeholders[vars.region], vars.region)).
  pipe(gulp.dest(paths.tmp));
})

gulp.task('package:cloudformation', ['configure:templates'], run(`aws cloudformation package \
--template ${paths.tmp}/cloudformation.yaml \
--s3-bucket ${vars.s3BucketName} \
--output-template ${paths.tmp}/packaged-sam.yaml \
--region ${vars.region}`));

gulp.task('deploy:cloudformation', run(`aws cloudformation deploy \
--template-file ${paths.tmp}/packaged-sam.yaml \
--stack-name ${vars.cloudFormationStackName} \
--capabilities CAPABILITY_IAM \
--region ${vars.region}`));

gulp.task('delete:stack', run(`aws cloudformation delete-stack \
--stack-name ${vars.cloudFormationStackName} \
--region ${vars.region}`));

gulp.task('invoke:lambda', run(`aws lambda invoke \
--function-name ${vars.functionName} \
--region ${vars.region} \
--payload file://api-gateway-event.json \
${paths.tmp}/lambda-invoke-response.json && \
cat ${paths.tmp}/lambda-invoke-response.json`));

gulp.task('setup', run(`aws s3api get-bucket-location \
--bucket ${vars.s3BucketName} \
--region ${vars.region}`));

gulp.task('create:bucket', run(`aws s3 mb s3://${vars.s3BucketName} \
--region ${vars.region}`));

gulp.task('delete:bucket', run(`aws s3 rb s3://${vars.s3BucketName} \
--region ${vars.region}`));
