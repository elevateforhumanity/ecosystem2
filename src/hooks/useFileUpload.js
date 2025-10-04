import { useState, useCallback } from 'react';
import { api } from '../lib/api';

export function useFileUpload(options = {}) {
  const {
    maxSize = 10 * 1024 * 1024,
    accept = '*/*',
    multiple = false,
    autoUpload = true,
  } = options;

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});
  const [errors, setErrors] = useState([]);

  const validateFile = useCallback(
    (file) => {
      if (file.size > maxSize) {
        return {
          valid: false,
          error: `File size exceeds ${(maxSize / 1024 / 1024).toFixed(0)}MB limit`,
        };
      }

      if (accept !== '*/*') {
        const acceptedTypes = accept.split(',').map((t) => t.trim());
        const fileType = file.type;
        const fileExt = `.${file.name.split('.').pop()}`;

        const isAccepted = acceptedTypes.some(
          (type) =>
            type === fileType ||
            type === fileExt ||
            (type.endsWith('/*') && fileType.startsWith(type.replace('/*', '')))
        );

        if (!isAccepted) {
          return {
            valid: false,
            error: `File type not accepted. Accepted: ${accept}`,
          };
        }
      }

      return { valid: true };
    },
    [maxSize, accept]
  );

  const uploadFile = useCallback(async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress((prev) => ({ ...prev, [file.name]: percentComplete }));
        }
      });

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => reject(new Error('Upload failed'));

      xhr.open('POST', '/api/upload');
      const token = localStorage.getItem('token');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send(formData);
    });
  }, []);

  const addFiles = useCallback(
    async (newFiles) => {
      const filesToAdd = Array.isArray(newFiles) ? newFiles : [newFiles];
      const validatedFiles = [];
      const newErrors = [];

      for (const file of filesToAdd) {
        const validation = validateFile(file);
        if (validation.valid) {
          validatedFiles.push({
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'pending',
            progress: 0,
          });
        } else {
          newErrors.push({ file: file.name, error: validation.error });
        }
      }

      if (newErrors.length > 0) {
        setErrors((prev) => [...prev, ...newErrors]);
      }

      if (validatedFiles.length > 0) {
        setFiles((prev) => (multiple ? [...prev, ...validatedFiles] : validatedFiles));

        if (autoUpload) {
          await uploadFiles(validatedFiles);
        }
      }
    },
    [validateFile, multiple, autoUpload]
  );

  const uploadFiles = useCallback(
    async (filesToUpload = files) => {
      setUploading(true);

      for (const fileObj of filesToUpload) {
        if (fileObj.status === 'uploaded') continue;

        try {
          setFiles((prev) =>
            prev.map((f) =>
              f.name === fileObj.name ? { ...f, status: 'uploading' } : f
            )
          );

          const response = await uploadFile(fileObj.file);

          setFiles((prev) =>
            prev.map((f) =>
              f.name === fileObj.name
                ? { ...f, status: 'uploaded', url: response.url, ...response }
                : f
            )
          );
        } catch (error) {
          console.error('Upload error:', error);
          setFiles((prev) =>
            prev.map((f) =>
              f.name === fileObj.name ? { ...f, status: 'error' } : f
            )
          );
          setErrors((prev) => [
            ...prev,
            { file: fileObj.name, error: error.message },
          ]);
        }
      }

      setUploading(false);
    },
    [files, uploadFile]
  );

  const removeFile = useCallback((fileOrIndex) => {
    setFiles((prev) => {
      if (typeof fileOrIndex === 'number') {
        return prev.filter((_, i) => i !== fileOrIndex);
      }
      return prev.filter((f) => f.name !== fileOrIndex.name);
    });
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setProgress({});
    setErrors([]);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return {
    files,
    uploading,
    progress,
    errors,
    addFiles,
    uploadFiles,
    removeFile,
    clearFiles,
    clearErrors,
  };
}
