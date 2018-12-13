
const path = require('path');
const test = require('tape');
const exifLoader = require('../');

const IMG_EXIF = path.join(__dirname, 'has-exif.jpg');
const IMG_NO_EXIF = path.join(__dirname, 'has-no-exif.jpg');

const getContext = (img, cb) => ({
    async: () => cb,
    resourcePath: img,
    _compilation: { outputOptions: {} },
});

test('Has Exif data', (t) => {
    t.plan(2);
    exifLoader.call(getContext(IMG_EXIF, (_, data) => {
        const result = eval(data);
        t.equal(result.exif.FNumber, 8);
        t.notOk(result.src);
    }));
});

test('Has Exif data & src', (t) => {
    const src = path.basename(IMG_EXIF);
    const content = `module.exports = "./${src}"`;
    t.plan(3);
    exifLoader.call(getContext(IMG_EXIF, (_, data) => {
        const result = eval(data);
        t.equal(result.exif.FNumber, 8);
        t.equal(result.size.width, 816);
        t.equal(result.src, `./${src}`);
    }), content);
});

test('Has no Exif data', (t) => {
    t.plan(1);
    exifLoader.call(getContext(IMG_NO_EXIF, (_, data) => {
        const result = eval(data);
        t.notOk(result.exif.camera);
    }));
});

test('Has no Exif data & src', (t) => {
    const src = path.basename(IMG_NO_EXIF);
    const content = `module.exports = "./${src}"`;
    t.plan(2);
    exifLoader.call(getContext(IMG_NO_EXIF, (_, data) => {
        const result = eval(data);
        t.notOk(result.exif.FNumber);
        t.equal(result.src, `./${src}`);
    }), content);
});
