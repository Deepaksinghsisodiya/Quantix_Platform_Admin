/**
 * Utility to download a file from a Blob response.
 * @param blob The binary data (typically from an Excel export)
 * @param filename The desired filename for the download
 */
export const downloadExcelFromBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};
