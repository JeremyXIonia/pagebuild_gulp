const gulp = require('gulp'),
    sass = require('gulp-sass'),
    watch = require('gulp-watch'),
    spritesmith = require('gulp.spritesmith'),
    minimist = require('minimist'),
    fileinclude = require('gulp-file-include'),
    browserSync = require('browser-sync').create();

const compileHtml = () => {
    return gulp.src('./src/html/*.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('./dist/html'))
        .pipe(browserSync.stream());
}

const compileStyle = () => {
    return gulp.src('./src/sass/*.scss')
        .pipe(sass({
                outputStyle: 'expanded'
            })
            .on('error', sass.logError))
        .pipe(gulp.dest('./dist/css'))
        .pipe(browserSync.stream());
}

gulp.task('style', function () {
    watch('./src/sass/**/*.scss', () => {
        compileStyle();
    })
});

gulp.task('html', function () {
    watch('./src/html/**/*.html', () => {
        compileHtml();
    })
});

var spriteDefOpt = {
    string: 'name',
    default: {
        env: process.env.NODE_ENV || 'sprite'
    }
};
var options = minimist(process.argv.slice(2), spriteDefOpt);

var spritesMithConfig = {
    imgName: '' + options.name + '.png',
    cssName: '_' + options.name + '.scss',
    algorithm: 'binary-tree',
    imgPath: '../images/' + options.name + '.png',
    padding: 8,
    cssTemplate: (data) => {
        let arr = [],
            width = data.spritesheet.px.width,
            height = data.spritesheet.px.height,
            url = data.spritesheet.image;
        data.sprites.forEach(function (sprite) {
            var className;
            if (sprite.name.indexOf('-hover') !== -1) {
                className =  '.icon-' + sprite.name.replace('-hover', ':hover');
            } else {
                className = '.icon-' + sprite.name;
            }
            arr.push(
                className +
                "{" +
                "background: url('" + url + "') " +
                "no-repeat " +
                sprite.px.offset_x + " " + sprite.px.offset_y + ";" +
                "background-size: " + width + " " + height + ";" +
                "width: " + sprite.px.width + ";" +
                "height: " + sprite.px.height + ";" +
                "}\n"
            )
        });
        return arr.join("");
    }

}

gulp.task('sprite', function () {
    var spriteData = gulp.src('./src/images/' + options.name + '/*.png').pipe(spritesmith(spritesMithConfig));
    spriteData.img.pipe(gulp.dest("./dist/images/"));
    spriteData.css.pipe(gulp.dest("./src/sass/module/"));
});


gulp.task('browser-sync', () => {
    return browserSync.init({
        server: {
            baseDir: './dist'
        },
        port: 8091,
        notify: false,
        open: false
    });

});

gulp.task('default', ['html', 'style', 'browser-sync'], () => {
    watch('./dist/**/*.+(html|css|js|png|jpg|ttf)', () => {
        browserSync.reload();
    })
});