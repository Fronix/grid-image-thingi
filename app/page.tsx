"use client";
import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCopyToClipboard } from "@uidotdev/usehooks";
import domtoimage from "dom-to-image";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";

export default function Home() {
  const maxImages = 10;
  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const currentYear = new Date().getFullYear();

  const [copiedText, copyToClipboard] = useCopyToClipboard();
  const [hasCopied, setHasCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const [base64, setBase64] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (images.length > 0) {
      setBase64("");
    }
  }, [images]);

  const dropzone = useDropzone({
    multiple: true,
    maxFiles: maxImages,
    maxSize: maxFileSize,
    onDrop: async (acceptedFiles, fileRejections) => {
      const newImgs = [...images, ...acceptedFiles];
      setImages(newImgs);
      if (newImgs.length > 1) await domToImage();
    },
    preventDropOnDocument: false,
  });
  const { acceptedFiles, getRootProps, getInputProps } = dropzone;

  // listen to on paste event
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      console.log("paste event", event);
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, []);

  const removeAll = () => {
    acceptedFiles.length = 0;
    acceptedFiles.splice(0, acceptedFiles.length);
    fileInput!.current!.value = "";
    setImages([]);
    setBase64("");
  };

  const onCopyToClipboard = () => {
    // Convert the canvas to a blob
    const base64ToBlob = (base64: string) => {
      const byteString = atob(base64.split(",")[1]);
      const mimeString = base64.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: mimeString });
    };

    navigator.clipboard.write([
      new ClipboardItem({
        "image/png": base64ToBlob(base64),
      }),
    ]);
    setHasCopied(true);
  };

  const domToImage = async () => {
    const grid = gridRef.current;
    if (grid) {
      setLoading(true);
      setTimeout(async () => {
        const dataUrl = await domtoimage.toPng(grid, {
          width: grid.clientWidth * 1,
          height: grid.clientHeight,
          bgcolor: "black",
        });
        setBase64(dataUrl);
        setLoading(false);
      }, 600);
    }
  };

  return (
    <>
      <header className="text-white py-4 flex">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold">Image grid thingi</h1>
        </div>
      </header>
      <main
        {...getRootProps()}
        tabIndex={-1}
        className="w-full h-full px-4 sm:px-6 lg:px-8 flex flex-col sm:items-center mx-auto flex-grow justify-center focus:outline-none"
      >
        <div className="flex flex-col gap-4 w-full max-w-2xl">
          <div>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col cursor-pointer items-center justify-center w-full border-2 hover:bg-bray-800 bg-gray-700 hover:bg-gray-600 border-gray-400 hover:border-gray-500 border-dotted"
              >
                <div className="flex flex-col items-center justify-center pt-6 pb-8 px-32">
                  <svg
                    className="w-10 h-10 mb-3 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    ></path>
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span>,{" "}
                    <span className="font-semibold">Paste (CTRL+V)</span> or
                    drag and drop images
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG or JPG (MAX. 5MB and MAX. 10 files)
                  </p>
                  <p className="text-sm pt-4 text-gray-500 dark:text-gray-400">
                    {images.length === 1 ? (
                      <span className="text-red-300">
                        Add more images to create a grid
                      </span>
                    ) : (
                      ""
                    )}
                  </p>
                </div>
                <input
                  id="dropzone-file"
                  {...getInputProps()}
                  name="files"
                  ref={fileInput}
                />
              </label>
            </div>
          </div>
          {base64 && (
            <div className="flex w-full justify-center gap-4">
              <button
                className="btn btn-primary"
                disabled={images.length === 0}
                onClick={removeAll}
              >
                Reset
              </button>
              <button className="btn btn-secondary" onClick={onCopyToClipboard}>
                Copy to clipboard{" "}
                {hasCopied ? (
                  <FontAwesomeIcon icon={faCheck} />
                ) : (
                  <FontAwesomeIcon icon={faCopy} />
                )}
              </button>
            </div>
          )}
          <div className="flex w-full">
            <div className="m-[0_auto]">
              {loading && (
                <span className="loading loading-ring loading-lg text-info"></span>
              )}
              {base64 && (
                <>
                  <Image
                    src={`${base64}`}
                    width={700}
                    height={820}
                    alt="grid"
                  />
                </>
              )}
            </div>
          </div>
          <div className="absolute bottom-[100rem]">
            <div
              ref={gridRef}
              className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-800 relative w-full"
            >
              {images.length > 0 &&
                images.map((file, index) => (
                  <div key={index} className={`text-center`}>
                    <span className="font-sans text-white font-bold text-xl">
                      {index + 1}
                    </span>
                    <Image
                      src={URL.createObjectURL(images[index])}
                      width={700}
                      height={800}
                      alt="grid"
                    />
                  </div>
                ))}
              <span
                className={`absolute bottom-0 right-0 font-sans text-white font-bold text-xl ${
                  base64 ? "" : "hidden"
                }`}
              >
                By: grid-image-thingi.fronix.se
              </span>
            </div>
          </div>
        </div>
      </main>
      <footer className="text-center py-4">
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-white/50">
            © {currentYear}{" "}
            <Link
              href="https://github.com/Fronix/grid-image-thingi"
              className="text-white font-medium hover:text-white/80"
            >
              Image grid thingi
            </Link>
            . Made by{" "}
            <Link
              target="_blank"
              className="text-white font-medium hover:text-white/80"
              href="https://github.com/Fronix"
            >
              fronix
            </Link>
          </p>
        </div>
      </footer>
    </>
  );
}
