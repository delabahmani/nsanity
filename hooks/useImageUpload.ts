/* eslint-disable @typescript-eslint/no-unused-vars */
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { generateReactHelpers } from "@uploadthing/react";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

export default function useImageUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { startUpload } = useUploadThing("productImage", {
    onClientUploadComplete: () => {
      setIsUploading(false);
    },
    onUploadError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
      setIsUploading(false);
    },
  });

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles((prev) => [...prev, ...selectedFiles]);
  }, []);

  const handleFilePreviewsGenerated = useCallback((newPreviews: string[]) => {
    setPreviews((prev) => [...prev, ...newPreviews]);
  }, []);

  const removeFile = useCallback(
    (index: number) => {
      setFiles((prev) => prev.filter((_, i) => i !== index));

      URL.revokeObjectURL(previews[index]);
      setPreviews((prev) => prev.filter((_, i) => i !== index));
    },
    [previews]
  );

  const uploadFiles = useCallback(async (): Promise<string[]> => {
    if (files.length === 0) return [];

    setIsUploading(true);
    try {
      const uploadResults = await startUpload(files);

      previews.forEach((url) => URL.revokeObjectURL(url));

      setFiles([]);
      setPreviews([]);

      return uploadResults ? uploadResults.map((file) => file.ufsUrl) : [];
    } catch (error) {
      toast.error("Upload failed. Please try again.");
      return [];
    }
  }, [files, startUpload, previews]);

  return {
    files,
    previews,
    isUploading,
    handleFilesSelected,
    handleFilePreviewsGenerated,
    removeFile,
    uploadFiles,
  };
}
