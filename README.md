EXIF-Loader
====

> Extract EXIF- & size data from your JPGs during build-time.

## Install

```
npm install --save-dev exif-size-loader
```

## Usage

You can use the EXIF-loader as a standalone loader:

**webpack.config.js**
```js
module.exports = {
  module: {
    rules: [{
      test: /\.jpg$/,
      use: ['exif-size-loader']
    }]
  }
}
```

**modules/a.js**
```js
import { exif } from './some-image.jpg';

```

You can also use the load in tandem with the [url-loader](https://github.com/webpack-contrib/url-loader).

**webpack.config.js**
```js
module.exports = {
  module: {
    rules: [{
      test: /\.jpg$/,
      use: ['exif-size-loader', 'url-loader']
    }]
  }
}
```

You can also use the load in tandem with the [file-loader](https://github.com/webpack-contrib/file-loader).

**webpack.config.js**
```js
module.exports = {
  module: {
    rules: [{
      test: /\.jpg$/,
      use: ['exif-size-loader', 'file-loader']
    }]
  }
}
```

**modules/b.js**
```js
import { exif, iptc, file } from './some-image.jpg';

const { imageWidth } = exif.image;

export default function () {
    return (<figure>
        <img src={file} width={imageWidth} alt="" />
        <figcaption>{object_name}</figcaption>
    </figure>);
}
```
