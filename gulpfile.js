const gulp = require('gulp');
const scss = require('gulp-sass');
const browserSync = require('browser-sync').create();

gulp.task('scss', () => {
	return gulp.src('./scss/app.scss')
		.pipe(scss({ errLogToConsole: true }))
		.pipe(gulp.dest('./public/css'));
})

gulp.task('browserSync', () => {
	browserSync.init(['./public'], {
		server: {
			baseDir: './public'
		}
	});
});

gulp.task('watch', () => {
	gulp.watch('./scss/**/*.scss', ['scss']);
});

gulp.task('default', ['scss', 'watch', 'browserSync']);