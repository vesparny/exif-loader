
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
            camera: res.image.Make ? `${res.image.Make} ${res.image.Model}` :'',
            aperture: res.exif.FNumber || '',
            ISO: res.exif.ISO || '',
            ExposureTime: res.exif.ExposureTime || '',
            'Focal': res.exif.FocalLength || '',
            'FocalLengthIn35mmFormat': res.exif.FocalLengthIn35mmFormat || ''
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
