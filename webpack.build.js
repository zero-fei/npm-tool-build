export default {
  output: {
    library: 'Bundle',
    filename: 'Bundle.js'
  },
  module: { //在配置文件里添加JSON loader
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
          'sourceMap'
        ]
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
          'sourceMap'
        ]
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader'
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        loader: 'url-loader?limit=1000&name=images/[hash:8].[name].[ext]'
      }, // 内联 base64 URLs, 限定 <=8k 的图片, 其他的用 URL
      {
        test: /\.woff$/,
        loader: 'url-loader?prefix=font/&limit=1000&mimetype=application/font-woff&name=fonts/[hash:8].[name].[ext]'
      },
      {
        test: /\.(ttf|eot|svg)$/,
        loader: 'file-loader?prefix=font/&name=fonts/[hash:8].[name].[ext]'
      }
    ]
  },
  watch: false,
};
