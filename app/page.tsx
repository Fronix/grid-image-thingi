"use client";
import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";
import { FileRejection, useDropzone } from "react-dropzone";
import { useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { drawGrid } from "../lib/draw-client";
import { useCopyToClipboard } from "@uidotdev/usehooks";

export default function Home() {
  const maxImages = 10;
  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const currentYear = new Date().getFullYear();

  const [copiedText, copyToClipboard] = useCopyToClipboard();
  const [hasCopied, setHasCopied] = useState(false);

  const [images, setImages] = useState<File[]>([]);
  const [show, setShow] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const getCanvas = () =>
    document.getElementById("canvas") as HTMLCanvasElement;
  const canvasContext = useCallback(
    () => getCanvas().getContext("2d") as CanvasRenderingContext2D,
    []
  );

  const clearCanvas = useCallback(() => {
    const ctx = canvasContext();
    ctx.clearRect(0, 0, getCanvas().width, getCanvas().height);
  }, [canvasContext]);

  const onDropFiles = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      setHasCopied(false);
      if (fileRejections.length > 0) {
        const errors: string[] = fileRejections.map((f) =>
          f.errors.map((e) => e.message).join(", ")
        );
        const uniqueErrors = Array.from(new Set(errors));
        alert(
          "Some files were rejected. \nErrors:\n " + uniqueErrors.join("\n")
        );
        return;
      }
      const allImages = [...images, ...acceptedFiles];
      if (acceptedFiles.length > 1) {
        setShow(true);
      }

      setImages(allImages);
      const imageUrls = allImages.map((file) => URL.createObjectURL(file));
      clearCanvas();
      drawGrid(getCanvas())(imageUrls);
      setShow(true);
    },
    [clearCanvas, images]
  );

  const dropzone = useDropzone({
    accept: {
      "image/png": [".png", ".jpg"],
    },
    multiple: true,
    maxFiles: maxImages,
    maxSize: maxFileSize,
    onDrop: onDropFiles,
    preventDropOnDocument: false,
  });
  const { acceptedFiles, getRootProps, getInputProps } = dropzone;

  // listen to on paste event
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (items) {
        const files = Array.from(items).filter((item) => item.kind === "file");
        const pastedImages = files.map((file) => file.getAsFile() as File);
        const errors: FileRejection[] = [];
        if (pastedImages.length > 10) {
          errors.push({
            file: files[0].getAsFile() as File,
            errors: [
              {
                message: "Maximum of 10 images allowed",
                code: "too-many-files",
              },
            ],
          });
        }
        if (pastedImages.some((file) => file.size > maxFileSize)) {
          errors.push({
            file: files[0].getAsFile() as File,
            errors: [
              { message: "File size too large", code: "file-too-large" },
            ],
          });
        }
        if (
          pastedImages.some(
            (file) => !["image/png", "image/jpeg"].includes(file.type)
          )
        ) {
          errors.push({
            file: files[0].getAsFile() as File,
            errors: [
              {
                message: "Invalid file type",
                code: "file-invalid-type",
              },
            ],
          });
        }

        onDropFiles(pastedImages, errors);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [images, onDropFiles]);

  const removeAll = () => {
    acceptedFiles.length = 0;
    acceptedFiles.splice(0, acceptedFiles.length);
    fileInput!.current!.value = "";
    setShow(false);
    setImages([]);
    clearCanvas();
    console.log(acceptedFiles);
    console.log(images);
    console.log(fileInput!.current!.value);
    console.log(fileInput!.current!.files);
    window.location.reload();
  };

  const onCopyToClipboard = () => {
    const canvas = getCanvas();
    // Convert the canvas to a blob
    canvas.toBlob((blob) => {
      navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob!,
        }),
      ]);
      setHasCopied(true);
    });
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
        className="w-full h-full px-4 sm:px-6 lg:px-8 flex flex-col sm:items-center mx-auto flex-grow justify-center"
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
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG or JPG (MAX. 5MB and MAX. 10 files)
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
          {show && (
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

          <canvas
            id="canvas"
            className={`${show ? "" : "hidden"} flex`}
            width={600}
            height={800}
          ></canvas>
        </div>
      </main>
      <footer className="text-center py-4">
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-white/50">
            © {currentYear} Image grid thingi. Made by{" "}
            <a
              target="_blank"
              className="text-white font-medium hover:text-white/80"
              href="https://github.com/Fronix"
            >
              fronix
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}
