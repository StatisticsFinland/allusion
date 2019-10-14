const express = require('express');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js')();
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const compiler = webpack(webpackConfig);
const compression = require('compression');

app.use(compression());

/* Routes */
app.use('/', express.static(`${__dirname}/dist`));
app.get('*', (req, res) => {
    res.send({message: 'This is not the base you are looking for.'});
});

app.use(webpackDevMiddleware(compiler, {
    hot: true,
    filename: 'main.js',
    publicPath: '/',
    stats: {
        colors: true
    },
    historyApiFallback: true
}));

const server = app.listen(port, () => {
    const host = server.address().address;
    const port = server.address().port;
    console.log(`App listening at https://${host}:${port}`);
});
