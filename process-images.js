const { Jimp } = require('jimp');

async function processImages() {
  try {
    const kunafaPath = 'c:/Users/tousi/OneDrive/Documents/Pushya Restaurent PWA/public/images/kunafa.png';
    const kunafa = await Jimp.read(kunafaPath);
    await kunafa.rotate(180).writeAsync(kunafaPath);
    console.log('Kunafa image rotated successfully!');
  } catch (err) {
    console.error('Error processing images:', err);
  }
}

processImages();
