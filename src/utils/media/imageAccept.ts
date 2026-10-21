// Explicit extensions also support files whose browser MIME type is missing
// or reported as the nonstandard image/jpg. The cropper exports valid JPEG/PNG.
export const imageAccept = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/jpg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
};
