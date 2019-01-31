// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
    throw err;
});

// Ensure environment variables are read.
require('./config/env');

var express = require('express'),
    path = require('path');

var isDeveloping = process.env.NODE_ENV !== 'production',
    port = 8000,        // isDeveloping ? 3000 : process.env.PORT
    app = express();

var indexRouter = require('./routes/index');
var taskRouter = require('./routes/taskController');

if (isDeveloping) {
    var config = require('./config/webpack.config.dev'),
        compiler = require('webpack')(config),
        middleware = require('webpack-dev-middleware')(compiler, {
            publicPath: config.output.publicPath,
            contentBase: 'src',
            stats: {
                colors: true,
                hash: false,
                timings: true,
                chunks: false,
                chunkModules: false,
                modules: false
            }
        });

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(middleware);
    app.use('/', indexRouter);
    app.use('/task', taskRouter);
    app.use(require('webpack-hot-middleware')(compiler));/*
    app.get('*', function response(req, res) {
        res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'public/index.html')));
        res.end();
    });*/
} else {
    app.use(express.static(__dirname + '/build'));
    app.get('*', function response(req, res) {
        res.sendFile(path.join(__dirname, 'public/index.html'));
    });
}

app.listen(port, '0.0.0.0', function onStart(err) {
    if (err) {
        console.log(err);
    }

    console.info('==> Listening on port %s.', port);
    console.info('==> Open up http://0.0.0.0:%s/ in your browser.', port);

});