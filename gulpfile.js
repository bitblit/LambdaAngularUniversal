require('dotenv').config();

const gulp = require('gulp');
const install = require('gulp-install');
const run = require('gulp-run-command').default();

const vars = {
  s3BucketName: process.env.S3_BUCKET_NAME,
  region: process.env.AWS_REGION,
  cloudFormationStackName: process.env.CF_STACK_NAME,
  functionName: process.env.LAMBDA_FUNCTION_NAME,
  accountId: process.env.AWS_ACCOUNT_ID
};

const paths = {
  src: 'src',
  dist: 'dist',
  tmp: 'tmp'
};

gulp.task('clean',run('rm -rf dist'));

gulp.task('setup',run(`aws s3 get-bucket-location \
--bucket ${vars.s3BucketName} \
--region ${vars.region} || npm run create-bucket`));

gulp.task('create:bucket',run(`aws s3 mb s3://${vars.s3BucketName} \
--region ${vars.region}`));

gulp.task('delete:bucket',run(`aws s3 rb s3://${vars.s3BucketName} \
--region ${vars.region}`));
