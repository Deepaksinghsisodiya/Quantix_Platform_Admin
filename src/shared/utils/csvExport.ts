/**
 * Generic Utility to export JSON data to a highly compatible and safe CSV file.
 * Handles escaping of commas, quotes, and newlines automatically.
 * 
 * @param data Array of objects representing rows.
 * @param filename Desired name of the exported file (without extension).
 * @param customHeaders Optional map of key names to human-readable column headers.
 */
export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  filename: string,
  customHeaders?: Record<string, string>
) => {
  if (!data || data.length === 0) {
    console.warn("No data provided to CSV export");
    return;
  }

  // 1. Determine the keys to export
  const firstItem = data[0];
  if (!firstItem) {
    console.warn("Empty array passed to CSV export");
    return;
  }
  const keys = Object.keys(firstItem);

  // 2. Generate the headers row
  const headers = keys.map((key) => {
    const customHeader = customHeaders ? customHeaders[key] : undefined;
    return escapeCSVValue(customHeader || key);
  });

  const csvRows = [headers.join(",")];

  // 3. Generate the data rows
  for (const item of data) {
    const values = keys.map((key) => {
      const value = item[key];
      // Format dates nicely
      if (value instanceof Date) {
        return escapeCSVValue(value.toLocaleString());
      }
      if (typeof value === 'object' && value !== null) {
        return escapeCSVValue(JSON.stringify(value));
      }
      return escapeCSVValue(value === undefined || value === null ? "" : String(value));
    });
    csvRows.push(values.join(","));
  }

  // 4. Create a BOM (Byte Order Mark) for UTF-8 so Excel opens it with correct encoding (e.g. emojis or special characters)
  const bom = "\uFEFF";
  const blob = new Blob([bom + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  
  // 5. Trigger the browser download
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${filename.replace(/\.csv$/i, "")}_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Escapes values containing quotes, commas, or newlines according to RFC 4180.
 */
const escapeCSVValue = (val: string): string => {
  let escaped = val.replace(/"/g, '""'); // Double up double quotes
  if (escaped.includes(",") || escaped.includes('"') || escaped.includes("\n") || escaped.includes("\r")) {
    escaped = `"${escaped}"`; // Wrap in double quotes if special character exists
  }
  return escaped;
};
