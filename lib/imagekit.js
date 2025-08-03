  // SDK initialization
const ImageKit = require("imagekit");

const imagekit = new ImageKit({
    publicKey : process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
    privateKey : process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY,
    urlEndpoint : process.env.NEXT_PUBLIC_IMAGEKIT_URL
});


module.exports = imagekit;
