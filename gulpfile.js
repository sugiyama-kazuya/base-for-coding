const { src, dest, watch, series, parallel } = require("gulp");
const loadPlugins = require("gulp-load-plugins");
const $ = loadPlugins();
const autoprefixer = require("autoprefixer");
const server = require("browser-sync");
const imageminMozjpeg = require("imagemin-mozjpeg");
const imageminPngquant = require("imagemin-pngquant");
const imageminSvgo = require("imagemin-svgo");

const srcPath = {
  css: "./src/styles/*.scss",
  js: "./src/scripts/*.js",
  img: "./src/images/*",
  html: "./*.html",
};

const destPath = {
  css: "./dist/css/",
  js: "./dist/js",
  img: "./dist/images",
};

function imgImagemin() {
  return src(srcPath.img)
    .pipe(
      $.imagemin(
        [
          imageminMozjpeg({
            quality: 80,
          }),
          imageminPngquant(),
          imageminSvgo({
            plugins: [
              {
                removeViewbox: false,
              },
            ],
          }),
        ],
        {
          verbose: true,
        }
      )
    )
    .pipe(dest(destPath.img));
}

function styles() {
  return src(srcPath.css)
    .pipe(
      $.plumber({
        errorHandler: $.notify.onError("Error: <%= error.message %>"),
      })
    )
    .pipe($.sassGlob())
    .pipe($.sass())
    .pipe($.postcss([autoprefixer()]))
    .pipe(dest(destPath.css))
    .pipe($.cleanCss())
    .pipe(
      $.rename({
        extname: ".min.css",
      })
    )
    .pipe(dest(destPath.css));
}

function scripts() {
  return src(srcPath.js)
    .pipe(
      $.plumber({
        errorHandler: $.notify.onError("Error: <%= error.message %>"),
      })
    )
    .pipe(
      $.babel({
        presets: ["@babel/preset-env"],
      })
    )
    .pipe(dest(destPath.js))
    .pipe($.uglify())
    .pipe(
      $.rename({
        extname: ".min.js",
      })
    )
    .pipe(dest(destPath.js));
}

function startAppServer() {
  server.init({
    server: {
      baseDir: ".",
    },
  });

  watch(srcPath.css, styles);
  watch(srcPath.js, scripts);
  watch(srcPath.html).on("change", server.reload);
  watch(srcPath.css).on("change", server.reload);
}

function watchCss() {
  watch("./src/**/*.scss", styles);
}

const serve = series(parallel(styles, series(scripts)), startAppServer);
exports.comp = imgImagemin;
exports.serve = serve;
exports.watch = watchCss;
exports.style = styles;