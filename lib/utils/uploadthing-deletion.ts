import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function deleteUploadThingFile(url: string): Promise<boolean> {
  if (
    !url.includes("uploadthing") &&
    !url.includes("utfs.io") &&
    !url.includes("ufs.sh")
  ) {
    return false;
  }

  try {
    const fileKey = url.split("/").pop();

    if (!fileKey) {
      console.error("Could not extract file key from URL");
      return false;
    }

    await utapi.deleteFiles(fileKey);
    return true;
  } catch {
    return false;
  }
}

export async function deleteUploadThingFiles(
  urls: string[]
): Promise<boolean[]> {
  const validUrls = urls.filter((url) => url);

  if (validUrls.length === 0) {
    return [];
  }

  const results = await Promise.all(
    validUrls.map((url) => deleteUploadThingFile(url))
  );

  return results;
}
