var gulp = require("gulp");
var ts = require("gulp-typescript");
var nodemon = require("gulp-nodemon");
const del = require('del');
var tsProject = ts.createProject("tsconfig.json");
var fs = require('fs');

gulp.task("build", ['clean'], function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("./dist"));
});

gulp.task('clean', function () {
    return del(['dist/**', '!dist'], {
        force: true
    });
});

gulp.task('serverDev', ['build'], function () {
    process.env.NODE_ENV = "development";
    nodemon({
        // the script to run the app
        script: 'dist/index.js',
        watch: ["src/**/*.ts"],
        ext: 'ts',
        // Below i'm using es6 arrow functions but you can remove the arrow and have it a normal .on('restart', function() { // then place your stuff in here }
    }).on('restart', ['build']);
});

gulp.task('serverProd', ['build'], function () {
    process.env.NODE_ENV = "production";
    nodemon({
        // the script to run the app
        script: 'dist/index.js',
        // this listens to changes in any of these files/routes and restarts the application
        watch: ["src/**/*.ts"],
        ext: 'ts',
        // Below i'm using es6 arrow functions but you can remove the arrow and have it a normal .on('restart', function() { // then place your stuff in here }
    }).on('restart', ['build']);
});