import del from 'del';
import webpackStream from 'webpack-stream';
import gulp, { task, series, parallel } from 'gulp';
import gulpSass from 'gulp-sass';
import gulpSourcemaps from 'gulp-sourcemaps';
import plumber from 'gulp-plumber';
import gulpWatch from 'gulp-watch';
import loadPlugins from 'gulp-load-plugins';
import babel from 'gulp-babel';    // 用于ES6转化ES5
import uglify from 'gulp-uglify'; // 用于压缩 JS

import buildConfig from './webpack.build';

const $ = loadPlugins();

const project_path = process.cwd();

/**
 * 路径定义
 */
const paths = {
  src: {
    index: 'src/index.js'
  },
  public: {
    src: `${project_path}/public/src`,
    css: `${project_path}/public/lib`,
    dist: `${project_path}/public/dist`,
    lib: `${project_path}/public/lib`,
    es: `${project_path}/public/es`
  },
  dev: {
    app: `${project_path}/npm-tool-build`
  }
};

/**
 * 清空输出目录
 */
task('clean', series(async () => {
  return del([
    paths.public.dist,
    paths.public.lib,
    paths.public.src,
    paths.public.es
  ]);
}));

/**
 * 应用prduction环境
 */
task('apply-prod-environment', series(async () => {
  process.env.NODE_ENV = 'production';
}));

/**
 * 编译、汇总输出
 * TODO 未实现
 */
task('build:pack', series(async () => {
  return gulp.src(paths.src.index)
    .pipe(webpackStream(buildConfig))
    .pipe(gulp.dest(paths.public.dist))
    // .pipe($.uglify())
    .pipe($.rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.public.dist))
    .pipe($.size({ showFiles: true, title: 'minified' }))
    .pipe($.size({ showFiles: true, gzip: true, title: 'gzipped' }));
}));

const babelPlugin = {
  "plugins": [
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-transform-modules-commonjs"
  ]
}

const babelConfig = {
  "presets": [
    "@babel/preset-env", 
    "@babel/preset-react"
  ],
  ...babelPlugin
};


const esbabelConfig = {
  "presets": [
    ['@babel/env', {
      modules: false
    }],
    "@babel/preset-react"
  ]
};

function buildJs(modules) {
  const config = modules ? esbabelConfig : babelConfig
  const _path = modules ? paths.public.es :  paths.public.lib
  return gulp.src(jsGlob)
  .pipe(plumber())
  .pipe(gulp.dest(paths.public.src))  // 输出源码
  .pipe($.replace('.scss', '.css'))
  .pipe(babel(config))
  // .pipe(uglify())
  .pipe(gulp.dest(_path));
}

/**
 * 构建、监听编译输出js文件
 */
const jsGlob = ['src/**/*.js'];
task('build:js', series(async () => {
  buildJs()
}));
task('build:js:es', series(async () => {
  buildJs(true)
}));

task('watch:js', series(async () => {
  return gulp.src(jsGlob)
    .pipe(plumber())
    //.pipe(gulpSourcemaps.init())
    //  .pipe(changed(paths.public.lib))
    .pipe(gulpWatch(jsGlob).on('change', (thePath) => {
      console.log(`File ${thePath} has been changed`);
    }).on('unlink', (thePath) => {
      // console.log(`File ${thePath} has been removed`);
      const libPath = thePath.replace(/src/, 'public\\lib');
      const srcPath = thePath.replace(/src/, 'public\\src'); // 同步删除public下源码
      del([libPath, srcPath]);
    }))
    .pipe(gulp.dest(paths.public.src))  // 输出源码
    .pipe($.replace('.scss', '.css'))
    .pipe(babel(babelConfig))
    // .pipe(uglify())
    //.pipe(gulpSourcemaps.write('.', { includeContent: false, sourceRoot: '../src' }))
    .pipe(gulp.dest(paths.public.lib));
}));

/**
 * 构建、监听编译输出sass文件
 */
const sassGlob = ['src/**/*.scss'];
task('build:sass', series(async () => {
  return gulp.src(sassGlob)
    .pipe(plumber())
    //  .pipe(changed(paths.public.lib))
    .pipe(gulp.dest(paths.public.src))  // 输出源码
    .pipe(gulpSourcemaps.init())
    .pipe(gulpSass({ outputStyle: 'compressed' }).on('error', gulpSass.logError))
    .pipe(gulpSourcemaps.write())
    .pipe(gulp.dest(paths.public.lib))
    .pipe(gulp.dest(paths.public.es));
}));

task('watch:sass', series(async () => {
  return gulp.src(sassGlob)
    .pipe(plumber())
    //  .pipe(changed(paths.public.lib))
    .pipe(gulpWatch(sassGlob).on('change', (thePath) => {
      console.log(`File ${thePath} has been changed`);
    }).on('unlink', (thePath) => {
      const libPath = thePath.replace(/src/, 'public\\lib').replace('.scss', '.css');
      const srcPath = thePath.replace(/src/, 'public\\src'); // 同步删除public下源码
      del([libPath, srcPath]);
    }))
    .pipe(gulp.dest(paths.public.src))  // 输出源码
    .pipe(gulpSourcemaps.init())
    .pipe(gulpSass({ outputStyle: 'compressed' }).on('error', gulpSass.logError))
    .pipe(gulpSourcemaps.write())
    .pipe(gulp.dest(paths.public.lib))
    .pipe(gulp.dest(paths.public.es));
}));

/**
 * 构建、监听输出其它资源
 */
const resourcesGlob = ['src/**/*.md',
  'src/**/*.html',
  'src/**/*.txt',
  'src/**/*.eot',
  'src/**/*.ttf',
  'src/**/*.woff',
  'src/**/*.gif',
  'src/**/*.png',
  'src/**/*.jpg',
  'src/**/*.jpeg',
  'src/**/*.less'];
task('build:resources', series(async () => {
  return gulp.src(resourcesGlob)
    .pipe(plumber())
    .pipe(gulp.dest(paths.public.src))
    .pipe(gulp.dest(paths.public.lib))
    .pipe(gulp.dest(paths.public.es));
}));
task('watch:resources', series(async () => {
  return gulp.src(resourcesGlob)
    .pipe(plumber())
    .pipe(gulpWatch(resourcesGlob).on('change', (thePath) => {
      console.log(`File ${thePath} has been changed`);
    }).on('unlink', (thePath) => {
      const libPath = thePath.replace(/src/, 'public\\lib');
      const srcPath = thePath.replace(/src/, 'public\\src');
      del([libPath, srcPath]);
    }))
    .pipe(gulp.dest(paths.public.src))
    .pipe(gulp.dest(paths.public.lib))
    .pipe(gulp.dest(paths.public.es));
}));

/**
 * 监听public更新，同步拷贝到项目操作。用于快速开发阶段。
 */
task('watch:public-app', series(async () => {
  return gulp.src(['public/**'])
    .pipe(plumber())
    .pipe(gulpWatch(['public/**']).on('change', (thePath) => {
      console.log(`File ${thePath} has been changed && sync to app`);
    }).on('unlink', (thePath) => {
      const appPath = thePath.replace(paths.dev.app);
      del([appPath], { force: true });
    }))
    .pipe(gulp.dest(paths.dev.app));// 可以多个dest，支持多个项目同时开发
}));

/**
 * 构建总任务。
 */
task('build', series(parallel('apply-prod-environment', 'build:js', 'build:sass', 'build:js:es','build:resources'), async () => {
  console.log('build finished!');
}));

/**
 * 监听总任务。
 */
task('watch:dev', series(parallel('apply-prod-environment', 'watch:js', 'watch:sass', 'watch:resources', 'watch:public-app')))
task('watch', series(parallel('apply-prod-environment', 'watch:js', 'watch:sass', 'watch:resources')))

task('default', series('build'));
