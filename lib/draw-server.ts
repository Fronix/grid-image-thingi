import Jimp from "jimp";
import path from "path";

function extractAfterFonts(path: string) {
  const keyword = "fonts";
  const index = path.indexOf(keyword);
  return path.substring(index + keyword.length);
}

export const drawGrid = async (
  imageBuffers: Buffer[],
  drawXTarget?: number
) => {
  console.log("Drawing");
  console.log("DrawXTarget: ", drawXTarget);

  const images = await Promise.all(
    imageBuffers.map((buffer) => Jimp.read(buffer))
  );
  const numColumns = Math.ceil(Math.sqrt(images.length));
  const numRows = Math.ceil(images.length / numColumns);

  const maxImageWidth = Math.max(...images.map((img) => img.bitmap.width));
  const maxImageHeight = Math.max(...images.map((img) => img.bitmap.height));

  const gridWidth = numColumns * maxImageWidth;
  const gridHeight = numRows * maxImageHeight;

  const canvas = new Jimp(gridWidth, gridHeight, 0x00000000); // Transparent background

  const _numberFont = extractAfterFonts(Jimp.FONT_SANS_64_WHITE);
  const numberFontPath = path.resolve(`./assets/${_numberFont}`);
  const numberFont = await Jimp.loadFont(numberFontPath);

  const _waterMarkFont = extractAfterFonts(Jimp.FONT_SANS_32_WHITE);
  const waterMarkFontPath = path.resolve(`./assets/${_waterMarkFont}`);
  const waterMarkFont = await Jimp.loadFont(waterMarkFontPath);

  images.forEach((img, index) => {
    const col = index % numColumns;
    const row = Math.floor(index / numColumns);
    const x = col * maxImageWidth;
    const y = row * maxImageHeight;

    canvas.composite(img, x, y);

    // Draw the number on top of the image
    canvas.print(
      numberFont,
      x,
      y + 10,
      {
        text: (index + 1).toString(),
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_TOP,
      },
      maxImageWidth,
      maxImageHeight
    );
  });

  // Add watermark
  const watermarkText = "Generated by grid-image-thingi.fronix.se";
  const watermarkFont = waterMarkFont;
  const watermarkY =
    gridHeight -
    Jimp.measureTextHeight(watermarkFont, watermarkText, gridWidth) -
    10;
  canvas.print(
    watermarkFont,
    10,
    watermarkY,
    {
      text: watermarkText,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_TOP,
    },
    gridWidth,
    gridHeight
  );
  const buffer = await canvas.getBufferAsync(Jimp.MIME_PNG);
  return buffer;
};

// Example usage
// const imagePaths = [
//   'path/to/image1.jpg',
//   'path/to/image2.jpg',
//   'path/to/image3.jpg',
//   'path/to/image4.jpg'
// ];
// const outputFilePath = 'path/to/outputImage.jpg';

// drawGrid(imagePaths, outputFilePath).then(() => {
//   console.log('Grid image created successfully.');
// }).catch(err => {
//   console.error('Error creating grid image:', err);
// });
