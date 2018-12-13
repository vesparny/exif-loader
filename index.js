
/*
 * MIT License http://www.opensource.org/licenses/mit-license.php
 * Author Emanuel Kluge (http://emanuel-kluge.de/)
*/

const evaluate = require('node-eval');
const ExifImage = require('exif').ExifImage;
const sizeOf = require('image-size');

const NO_EXIF_SEGMENT = 'NO_EXIF_SEGMENT';

const isError = err =>
    err && err.code !== NO_EXIF_SEGMENT;

const hasNoExifData = err =>
    err && err.code === NO_EXIF_SEGMENT;

const getFile = (publicPath, content) => Promise.resolve((() => {
    try {
        return {
            file: evaluate(`__webpack_public_path__='${publicPath}'; ${content}`),
        };
    } catch (e) {
        return {};
    }
})());

const getExifData = image => new Promise((resolve, reject) => {
    const extractor = new ExifImage({ image }, (err, data) => {
        if (isError(err)) {
            return reject(err);
        }
        const res = hasNoExifData(err) ? extractor.exifData : data;
        const exif = {
            Make: res.image.Make || '',
            Model: res.image.Model || '',
            FNumber: res.exif.FNumber || '',
            ISO: res.exif.ISO || '',
            ExposureTime: res.exif.ExposureTime || '',
            FocalLength: res.exif.FocalLength || '',
            FocalLengthIn35mmFormat: res.exif.FocalLengthIn35mmFormat || '',
            DateTimeOriginal: res.exif.DateTimeOriginal || '',
            GPS: !iEmpty(res.gps) ? dms2dec(res.gps) : null
        }
        return resolve({exif});
    });
});

const getSize = image => new Promise((resolve, reject) => {
    const size = sizeOf(image)
    return resolve({size: {
        width: size.width,
        height: size.height
    }})
});

const mergeResults = done => (results) => {
    const merged = results.reduce((acc, item) => Object.assign({}, acc, item), {});
    return done(null, `module.exports = ${JSON.stringify(merged)};`);
};

const iEmpty = (obj) => {
    return Object.keys(obj).length === 0;
};

const dms2dec = (gps) => {
    let lat = gps.GPSLatitude
    const latRef = gps.GPSLatitudeRef
    let lng = gps.GPSLongitude
    const lngRef = gps.GPSLongitudeRef
    const ref = {'N': 1, 'E': 1, 'S': -1, 'W': -1};
    let sep = [' ,', ' ', ','];
    let i;

    if (typeof lat === 'string') {
      for (i = 0; i < sep.length; i++) {
        if (lat.split(sep[i]).length === 3) {
          lat = lat.split(sep[i]);
          break;
        }
      }
    }

    if (typeof lng === 'string') {
      for (i = 0; i < sep.length; i++) {
        if (lng.split(sep[i]).length === 3) {
          lng = lng.split(sep[i]);
          break;
        }
      }
    }

    for (i = 0; i < lat.length; i++) {
      if (typeof lat[i] === 'string') {
        lat[i] = lat[i].split('/');
        lat[i] = parseInt(lat[i][0], 10) / parseInt(lat[i][1], 10);
      }
    }

    for (i = 0; i < lng.length; i++) {
      if (typeof lng[i] === 'string') {
        lng[i] = lng[i].split('/');
        lng[i] = parseInt(lng[i][0], 10) / parseInt(lng[i][1], 10);
      }
    }

    lat = (lat[0] + (lat[1] / 60) + (lat[2] / 3600)) * ref[latRef];
    lng = (lng[0] + (lng[1] / 60) + (lng[2] / 3600)) * ref[lngRef];

    return {
        lat: lat,
        lng: lng
    }
};

module.exports = function exifLoader(content) {
    if (this.cacheable) {
        this.cacheable();
    }
    const done = this.async();
    /* eslint "no-underscore-dangle": 0 */
    const publicPath = this._compilation.outputOptions.publicPath || '/';
    /* eslint "no-underscore-dangle": 1 */
    Promise
        .all([
            getFile(publicPath, content),
            getExifData(this.resourcePath),
            getSize(this.resourcePath)
        ])
        .then(mergeResults(done))
        .catch(done);
};
