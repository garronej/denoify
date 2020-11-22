const browserSync = require('browser-sync').create();
const gulp = require('gulp');
const sass = require('gulp-sass');
const ejs = require('gulp-ejs');
const ext_replace = require('gulp-ext-replace');

gulp.task('copy-bootstrap', () => {
	return gulp.src([
		'node_modules/bootstrap/dist/**/*',
		'!**/*.map'
	])
		.pipe(gulp.dest('docs/assets/3p/bootstrap'));
})

gulp.task('copy-fontawesome', () => {
	return gulp.src([
		'node_modules/font-awesome/**/*',
		'!**/*.map'
	])
		.pipe(gulp.dest('docs/assets/3p/font-awesome'));
})

gulp.task('copy-jquery', () => {
	return gulp.src([
		'node_modules/jquery/dist/**/*',
		'!**/*.map'
	])
		.pipe(gulp.dest('docs/assets/3p/jquery'));
})

gulp.task('copy-types', () => {
	return gulp.src([
		'node_modules/typed.js/lib/**/*',
		'!**/*.map'
	])
		.pipe(gulp.dest('docs/assets/3p/typed.js'));
})

gulp.task('copy-img', () => {
	return gulp.src('img/*')
		.pipe(gulp.dest('docs/assets/img'));
})

gulp.task("copy-CNAME", () =>
	gulp.src("CNAME")
		.pipe(gulp.dest("docs"))
);

gulp.task("copy-robots.txt", () =>
	gulp.src("robots.txt")
		.pipe(gulp.dest("docs"))
);

gulp.task('copy', gulp.parallel(['copy-bootstrap', 'copy-fontawesome', 'copy-jquery', 'copy-types', 'copy-img', "copy-CNAME"]));

gulp.task('ejs', () => {
	delete require.cache[require.resolve('./content')];
	const content = require('./content');
	return gulp.src('*.ejs')
		.pipe(ejs(content))
		.pipe(ext_replace('.html'))
		.pipe(gulp.dest('docs'))
		.pipe(browserSync.reload({
			stream: true
		}))
})


gulp.task('sass', () => {
	return gulp.src('scss/main.scss')
		.pipe(sass())
		.pipe(gulp.dest('docs/assets/css'))
		.pipe(browserSync.reload({
			stream: true
		}))
})

gulp.task('browserSync', () => {
	return browserSync.init({
		server: {
			baseDir: './docs'
		},
	});
});

gulp.task('default', gulp.parallel(['copy', 'sass', 'ejs']));

gulp.task('dev', gulp.parallel(['browserSync', 'sass', 'ejs'], () => {
	gulp.watch('scss/*.scss', gulp.series(['sass']));
	gulp.watch('*.ejs', gulp.series(['ejs']));
	gulp.watch('content.js', gulp.series(['ejs']));
}));