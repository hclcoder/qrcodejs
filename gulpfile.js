const gulp = require('gulp');//Gulp
const del = require('del');//删除文件
const rename = require('gulp-rename');//重命名
const rev = require('gulp-rev');//清缓存
const revcollector = require('gulp-rev-collector');
const connect = require('gulp-connect');

//js处理插件
const babel = require('gulp-babel');
const babelenv = require('babel-preset-env');
const uglify = require('gulp-uglify');

//css处理插件
const postcss = require('gulp-postcss');

//html处理插件
const htmlmin = require('gulp-htmlmin');

//删除
function clean(cb) {
    return del(['dist']);
}

//测试
function test(cb) {
   cb()
}

//img icon
function hIcon() {
    return gulp.src(['src/icon/**/*.png', 'src/icon/**/*.jpg'])
        .pipe(rev())
        .pipe(gulp.dest('dist/icon'))
        .pipe(rev.manifest('rev-manifest-icon.json', { merge: true }))
        .pipe(gulp.dest('manifest/'))
}

function hImg() {
    return gulp.src(['src/image/**/*.png', 'src/image/**/*.jpg'])
        .pipe(rev())
        .pipe(gulp.dest('dist/image'))
        .pipe(rev.manifest('rev-manifest-image.json', { merge: true }))
        .pipe(gulp.dest('manifest/'))
}

//javascript
function hScript() {
    return gulp.src('src/js/*.js')
        .pipe(babel({
            presets: [babelenv]
        }))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(process.cwd()))
        .pipe(rev())
        .pipe(gulp.dest('dist/js/'))
        .pipe(rev.manifest('rev-manifest-js.json', { merge: true }))
        .pipe(gulp.dest('manifest/'))
}


//third library
function hThirdLibrary(){
    return gulp.src('src/lib/**/*')
        .pipe(rev())
        .pipe(gulp.dest('dist/lib'))
        .pipe(rev.manifest('rev-manifest-lib.json', { merge: true }))
        .pipe(gulp.dest('manifest/'))
}

//css
function hCss(cb) {
    return gulp.src('src/css/*.css')
        .pipe(rev())
        .pipe(postcss())
        .pipe(gulp.dest('dist/css'))
        .pipe(rev.manifest('rev-manifest-css.json', { merge: true }))
        .pipe(gulp.dest('manifest/'))
}

//html
function hHtml(cb) {
    var option = {
        collapseWhitespace: true,
        minifyJS: true,
        minifyCSS: true,
        removeComments: true,
        removeEmptyAttributes: true
    }
    return gulp.src('src/*.html')
        .pipe(htmlmin(option))
        .pipe(gulp.dest('dist/'))
}

//modify link
function mRely() {
    return gulp.src(['manifest/*.json', 'dist/*.html'])
        .pipe(revcollector({
            replaceReved: true
        }))
        .pipe(gulp.dest('dist/'))
        .pipe(connect.reload())
}

//server
function server(cb) {
    connect.server({ root: 'dist', livereload: true });
    cb();
}


//watch
function watcher(cb) {
    //样式
    gulp.watch(['src/css/*.css'], gulp.series(hCss, mRely));
    //javascript
    gulp.watch(['src/js/*.js'], gulp.series(hScript, mRely));
    //lib
    gulp.watch(['src/lib/**/*'], gulp.series(hThirdLibrary, mRely));
    //页面
    gulp.watch(['src/*.html'], gulp.series(hHtml, mRely));
    cb();
}

//export defalt task
exports.test = test;
exports.clean = clean;
exports.css = hCss;
exports.script = hScript;
exports.lib = hThirdLibrary
exports.html = hHtml;
exports.modrely = mRely;
exports.watche = watcher;
exports.server = server;

exports.development = gulp.series(watcher, server);
exports.build = gulp.series(clean, test, gulp.parallel(hIcon, hImg, hCss, hScript, hThirdLibrary, hHtml), mRely);
exports.initial = gulp.series(clean, test, gulp.parallel(hIcon, hImg, hCss, hScript, hThirdLibrary, hHtml), mRely, watcher, server);
