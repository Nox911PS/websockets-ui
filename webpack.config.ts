import path from 'path';
import nodeExternals from 'webpack-node-externals';
import { Configuration, DefinePlugin } from 'webpack';

interface Env {
  NODE_ENV?: string;
}

export default (env: Env): Configuration => {
  const isProduction: boolean = env.NODE_ENV === 'production';

  return {
    entry: './src/index.ts',
    target: 'node',
    externals: [nodeExternals()],
    mode: isProduction ? 'production' : 'development',
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
      new DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
      }),
    ],
    optimization: {
      minimize: isProduction,
    },
  };
};
