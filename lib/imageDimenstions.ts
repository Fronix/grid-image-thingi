import { width } from "@fortawesome/free-solid-svg-icons/fa0";

export const base64ImageDimensions = (base64: string) => {
  if (!base64) return;
  const img = new Image();
  img.src = base64;
  return {
    width: img.width,
    height: img.height,
  };
};
