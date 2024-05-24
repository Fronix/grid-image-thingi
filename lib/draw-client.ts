"use client";
export const drawGrid = (canvas: HTMLCanvasElement) => (images: string[]) => {
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const numColumns = Math.ceil(Math.sqrt(images.length));
  const numRows = Math.ceil(images.length / numColumns);
  const maxImageWidth = canvas.width / numColumns;
  const maxImageHeight = canvas.height / numRows;
  const textHeight = 20; // Height reserved for text above each image

  images.forEach((src, index) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      let drawWidth, drawHeight;

      if (aspectRatio > 1) {
        // Landscape
        drawWidth = maxImageWidth;
        drawHeight = drawWidth / aspectRatio;
      } else {
        // Portrait or square
        drawHeight = maxImageHeight - textHeight;
        drawWidth = drawHeight * aspectRatio;
      }

      // Ensure the image fits within the grid cell dimensions
      if (drawWidth > maxImageWidth) {
        drawWidth = maxImageWidth;
        drawHeight = drawWidth / aspectRatio;
      }
      if (drawHeight > maxImageHeight - textHeight) {
        drawHeight = maxImageHeight - textHeight;
        drawWidth = drawHeight * aspectRatio;
      }

      const x =
        (index % numColumns) * maxImageWidth + (maxImageWidth - drawWidth) / 2;
      const y =
        Math.floor(index / numColumns) * maxImageHeight +
        textHeight +
        (maxImageHeight - textHeight - drawHeight) / 2;

      // Draw the number above the image
      const textX = (index % numColumns) * maxImageWidth + maxImageWidth / 2;
      const textY =
        Math.floor(index / numColumns) * maxImageHeight + textHeight / 2;

      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fff";
      ctx.fillText((index + 1).toString(), textX, textY);

      // Draw the image
      ctx.drawImage(img, x, y, drawWidth, drawHeight);
    };
  });
};
