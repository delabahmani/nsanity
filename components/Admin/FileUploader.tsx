import { OurFileRouter } from "@/app/api/uploadthing/core";
import { generateReactHelpers } from "@uploadthing/react";
import { X } from "lucide-react";
import Image from "next/image";
import React, { useCallback } from "react";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  onFilePreviewsGenerated: (previews: string[]) => void;
  onRemoveFile: (index: number) => void;
  existingImagePreviews: string[];
}

export default function FileUploader({
  onFilesSelected,
  onFilePreviewsGenerated,
  onRemoveFile,
  existingImagePreviews,
}: FileUploaderProps) {
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (!fileList?.length) return;

      const newFiles = Array.from(fileList);
      onFilesSelected(newFiles);

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      onFilePreviewsGenerated(newPreviews);

      e.target.value = ""; // Clear the input value to allow re-uploading the same file
    },
    [onFilesSelected, onFilePreviewsGenerated]
  );

  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        Upload Product Images
      </label>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-nsanity-darkorange file:text-white hover:file:bg-nsanity-orange"
      />
      {existingImagePreviews.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {existingImagePreviews.map((previewUrl, index) => (
            <div key={index} className="relative aspect-square">
              <div className="h-full w-full relative">
                <Image
                  src={previewUrl}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <button
                type="button"
                onClick={() => onRemoveFile(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                aria-label="Remove image"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
