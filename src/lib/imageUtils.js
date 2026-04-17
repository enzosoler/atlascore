/**
 * imageUtils.js — Client-side image processing utilities for progress photos.
 *
 * stripExif(file)       — Removes EXIF APP1 markers from JPEG files (privacy: strips GPS, device info, etc.)
 * resizeImage(file, max) — Resizes an image so its longest side is at most `max` pixels, preserving aspect ratio.
 */

/**
 * Strip all EXIF APP1 markers (0xFFE1) from a JPEG file while preserving image data.
 * PNG and other non-JPEG formats are passed through unchanged.
 *
 * @param {File|Blob} file
 * @returns {Promise<Blob>} Clean blob with EXIF removed
 */
export async function stripExif(file) {
  // Only JPEG files contain EXIF APP1 markers
  const isJpeg =
    file.type === 'image/jpeg' ||
    file.type === 'image/jpg' ||
    (file.name && /\.jpe?g$/i.test(file.name));

  if (!isJpeg) {
    return file;
  }

  const arrayBuffer = await file.arrayBuffer();
  const view = new DataView(arrayBuffer);

  // Verify JPEG SOI marker (0xFFD8)
  if (view.byteLength < 4 || view.getUint16(0) !== 0xFFD8) {
    return file;
  }

  const cleanChunks = [];
  // Always keep the SOI marker
  cleanChunks.push(arrayBuffer.slice(0, 2));

  let offset = 2;

  while (offset < view.byteLength - 1) {
    const marker = view.getUint16(offset);

    // If we hit SOS (Start Of Scan, 0xFFDA) or image data, copy the rest as-is
    if (marker === 0xFFDA) {
      cleanChunks.push(arrayBuffer.slice(offset));
      break;
    }

    // All markers 0xFFxx with a length field
    if ((marker & 0xFF00) !== 0xFF00) {
      // Not a valid marker — copy the rest and bail
      cleanChunks.push(arrayBuffer.slice(offset));
      break;
    }

    // Markers without a length field (standalone markers like 0xFF01, 0xFFD0-0xFFD7)
    if (
      marker === 0xFF01 ||
      (marker >= 0xFFD0 && marker <= 0xFFD7)
    ) {
      cleanChunks.push(arrayBuffer.slice(offset, offset + 2));
      offset += 2;
      continue;
    }

    // Read segment length (includes the 2 length bytes but not the marker)
    if (offset + 3 >= view.byteLength) {
      cleanChunks.push(arrayBuffer.slice(offset));
      break;
    }

    const segmentLength = view.getUint16(offset + 2);
    const segmentEnd = offset + 2 + segmentLength;

    // APP1 marker (0xFFE1) — this is where EXIF and XMP data live. Skip it.
    if (marker === 0xFFE1) {
      offset = segmentEnd;
      continue;
    }

    // Keep all other segments (APP0/JFIF, DQT, DHT, SOF, COM, etc.)
    cleanChunks.push(arrayBuffer.slice(offset, segmentEnd));
    offset = segmentEnd;
  }

  return new Blob(cleanChunks, { type: 'image/jpeg' });
}

/**
 * Resize an image so its longest side is at most `maxDimension` pixels.
 * Uses an off-screen canvas. Output is JPEG at 0.85 quality.
 * If the image is already within bounds, it is returned as-is.
 *
 * @param {File|Blob} file
 * @param {number} maxDimension — Max pixels on the longest side (default 2048)
 * @returns {Promise<Blob>}
 */
export async function resizeImage(file, maxDimension = 2048) {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  // Already within bounds — return as-is
  if (width <= maxDimension && height <= maxDimension) {
    bitmap.close();
    return file;
  }

  const scale = maxDimension / Math.max(width, height);
  const newWidth = Math.round(width * scale);
  const newHeight = Math.round(height * scale);

  const canvas = new OffscreenCanvas(newWidth, newHeight);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, newWidth, newHeight);
  bitmap.close();

  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 });
  return blob;
}
