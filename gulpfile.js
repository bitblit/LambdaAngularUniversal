require('dotenv').config();

const gulp = require('gulp');
const del = require('del');
const install = require('gulp-install');
const run = require('gulp-run-command').default;

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

gulp.task('clean', () => {
  return del([paths.dist, paths.tmp]);
});

gulp.task('build:full', () => {
  gulp.src(['scripts/test-lambda.js', 'scripts/*.json']).pipe(gulp.dest(paths.dist));
})

gulp.task('build:lambda', () => {
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

gulp.task('package:cloudformation', run(`aws cloudformation package \
--template ./cloudformation.yaml \
--s3-bucket ${vars.s3BucketName} \
--output-template packaged-sam.yaml \
--region ${vars.region}`));

gulp.task('deploy:cloudformation', run(`aws cloudformation deploy \
--template-file packaged-sam.yaml \
--stack-name ${vars.cloudFormationStackName} \
--capabilities CAPABILITY_IAM \
--region ${vars.region}`));

gulp.task('stack:delete', run(`aws cloudformation delete-stack \
--stack-name ${vars.cloudFormationStackName} \
--region ${vars.region}`));

gulp.task('setup', run(`aws s3 get-bucket-location \
--bucket ${vars.s3BucketName} \
--region ${vars.region} || npm run create:bucket`));

gulp.task('create:bucket', run(`aws s3 mb s3://${vars.s3BucketName} \
--region ${vars.region}`));

gulp.task('delete:bucket', run(`aws s3 rb s3://${vars.s3BucketName} \
--region ${vars.region}`));
