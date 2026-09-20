/**
 * Hand a Blob to the browser as a file download.
 * 2026-09-04: generalised from `downloadExcelFromBlob` — the same primitive now serves
 * report CSV/PDF exports, invoice PDFs and spreadsheet exports.
 * @param blob The binary data.
 * @param filename The file name the browser should save it as.
 */
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};
