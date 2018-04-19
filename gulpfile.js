const gulp = require('gulp');
const del = require('del');
const zip = require('gulp-zip');
const ts = require('gulp-typescript');
const tslint = require('gulp-tslint');
const install = require('gulp-install');
const JSON_FILES = ['src/*.json', 'src/**/*.json'];
const BRIGHTSIGN_FILES = ['src/*.brs', 'src/**/*.brs'];
const IMG_FILES = ['src/*.png', 'src/**/*.png','src/*.jpg', 'src/**/*.jpg'];
const VIEW_FILES = ['src/*.pug', 'src/**/*.pug'];
const SWAGGER_FILES = ['./simple-proxy-api.yaml'];

// pull in the project TypeScript config
const tsProject = ts.createProject('tsconfig.json');

gulp.task('scripts', () => {
    const tsResult = tsProject.src()
        .pipe(tsProject());
    return tsResult.js.pipe(gulp.dest('dist'));
});

gulp.task('watch', ['scripts'], () => {
    gulp.watch('src/**/*.ts', ['scripts']);
});

gulp.task('assets', function() {
    return gulp.src(JSON_FILES)
        .pipe(gulp.dest('dist')) &&
        gulp.src(IMG_FILES)
            .pipe(gulp.dest('dist')) &&
        gulp.src(SWAGGER_FILES)
            .pipe(gulp.dest('dist')) &&
        gulp.src(BRIGHTSIGN_FILES)
            .pipe(gulp.dest('dist')) &&
        gulp.src(VIEW_FILES)
            .pipe(gulp.dest('dist'));
});

gulp.task('tslint', ()=>
    gulp.src("src/**/*.ts", { base: '.' })
        .pipe(tslint({
            configuration: "tslint.json",
            formatter: "verbose"
        }))
        .pipe(tslint.report())
);

gulp.task('cw', function(){
    gulp.src('./package.json')
        .pipe(gulp.dest('lambda-dist/'))
        .pipe(install({production:true}));
    gulp.src('dist/**')
        .pipe(gulp.dest('lambda-dist/'));
});

gulp.task('createLambdaPackage', ['scripts','assets'], function(){
/*    gulp.src(['dist/**','node_modules/**'])
        .pipe(zip('lambda-build.zip'))
        .pipe(gulp.dest('.'))
        */
    gulp.src('./package.json')
        .pipe(gulp.dest('lambda-dist/'))
        .pipe(install({production:true}));
    gulp.src('dist/**')
        .pipe(gulp.dest('lambda-dist/'));

});


gulp.task('createLambdaPackage2', [], function(){
  /*    gulp.src(['dist/**','node_modules/**'])
          .pipe(zip('lambda-build.zip'))
          .pipe(gulp.dest('.'))
          */
  gulp.src('./package.json')
    .pipe(gulp.dest('lambda-dist/'))
    .pipe(install({production:true}));
  gulp.src('dist/**')
    .pipe(gulp.dest('lambda-dist/'));

});

gulp.task('cleanLambdaPackage', function(){
    return del(['lambda-dist/']);
    //return del(['./lambda-build.zip']);
});

gulp.task('default', ['watch', 'assets']);
