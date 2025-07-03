import { supabase } from '../services/database';
import { StorageError, ErrorCodes } from './errorUtils';

/**
 * Uploads a file to Supabase Storage with proper validation and error handling
 * 
 * @param bucketName The name of the storage bucket
 * @param file The file to upload
 * @param options Additional options for the upload
 * @returns The public URL of the uploaded file
 */
export async function uploadFileToSupabaseStorage(
  bucketName: string,
  file: Blob | File,
  options: {
    fileName?: string;
    path?: string;
    contentType?: string;
    validateFileType?: boolean;
    allowedTypes?: string[];
    maxSizeBytes?: number;
  } = {}
): Promise<string> {
  try {
    // Set default options
    const {
      fileName = `${Date.now()}.${getFileExtension(file)}`,
      path = fileName, // Default path is just the filename
      contentType = file.type,
      validateFileType = true,
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'text/csv', 'application/json', 'application/pdf'],
      maxSizeBytes = 5 * 1024 * 1024 // 5MB default
    } = options;

    // Validate file size
    if (file.size > maxSizeBytes) {
      throw new StorageError(
        `File size exceeds the maximum allowed size of ${maxSizeBytes / (1024 * 1024)}MB`,
        ErrorCodes.STORAGE.SIZE_EXCEEDED
      );
    }

    // Validate file type if required
    if (validateFileType && !allowedTypes.includes(file.type)) {
      throw new StorageError(
        `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
        ErrorCodes.STORAGE.UPLOAD_FAILED
      );
    }

    console.log(`Uploading file to ${bucketName}/${path}`, { 
      fileSize: file.size, 
      fileType: file.type,
      path
    });

    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(path, file, {
        upsert: true,
        contentType
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new StorageError(
        `Failed to upload file: ${uploadError.message}`,
        ErrorCodes.STORAGE.UPLOAD_FAILED,
        uploadError
      );
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(path);

    return urlData.publicUrl;
  } catch (error) {
    // Ensure we're returning a StorageError
    if (error instanceof StorageError) {
      throw error;
    }
    
    throw new StorageError(
      `File upload failed: ${error instanceof Error ? error.message : String(error)}`,
      ErrorCodes.STORAGE.UPLOAD_FAILED,
      error
    );
  }
}

/**
 * Gets the file extension from a Blob or File object
 */
function getFileExtension(file: Blob | File): string {
  // Try to get extension from File name if available
  if ('name' in file && file.name) {
    const parts = file.name.split('.');
    if (parts.length > 1) {
      return parts[parts.length - 1];
    }
  }

  // Otherwise infer from MIME type
  switch (file.type) {
    case 'text/csv':
      return 'csv';
    case 'application/json':
      return 'json';
    case 'application/pdf':
      return 'pdf';
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/gif':
      return 'gif';
    default:
      return 'bin'; // Default binary extension
  }
}

/**
 * Deletes a file from Supabase Storage
 */
export async function deleteFileFromSupabaseStorage(
  bucketName: string,
  filePath: string
): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      throw new StorageError(
        `Failed to delete file: ${error.message}`,
        ErrorCodes.STORAGE.DELETE_FAILED,
        error
      );
    }
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    
    throw new StorageError(
      `File deletion failed: ${error instanceof Error ? error.message : String(error)}`,
      ErrorCodes.STORAGE.DELETE_FAILED,
      error
    );
  }
}