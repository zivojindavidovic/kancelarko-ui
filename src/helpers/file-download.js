export function downloadBlob(blob, filename) {
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(blobUrl);
}

export function resolveFilenameFromHeaders(headers, fallbackName) {
    const disposition = headers['content-disposition'];
    if (!disposition) return fallbackName;

    const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
        return decodeURIComponent(utf8Match[1]);
    }

    const asciiMatch = disposition.match(/filename=\"?([^\";]+)\"?/i);
    if (asciiMatch?.[1]) {
        return asciiMatch[1];
    }

    return fallbackName;
}