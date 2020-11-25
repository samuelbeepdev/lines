var path = require('path')
var build = path.resolve('..', 'out')
module.exports = (env) => ({
    mode: (() => {
        return (env && env.production) ?
            'production' : 'development'
    })(),
    entry: './index.js',
    resolve: {
        symlinks: false,
    },
    performance: {
        maxEntrypointSize: 1.5e6,
        maxAssetSize: 1.5e6,
    },
    output: {
        path: build,
        filename: 'bundle.js',
    },
    stats: {
        modules: false,
    },
    devtool: 'source-map',
    devServer: {
        contentBase: build,
        inline: true,
        host: "0.0.0.0",
        stats: "minimal",
        disableHostCheck: true,
    },
    watchOptions: {
        aggregateTimeout: 500,
        poll: 1000,
        ignored: ["node_modules"],
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                babylon: {
                    chunks: 'initial',
                    test: /babylonjs/,
                    filename: 'babylon.js',
                },
            },
        },
    },
})
