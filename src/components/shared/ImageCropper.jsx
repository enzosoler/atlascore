/**
 * ImageCropper — Modal image cropper using react-easy-crop.
 * Opens with a file/blob, lets user pan/zoom/crop, returns cropped blob.
 */

import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';
import { X, Check, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

/**
 * Extract cropped area from source image.
 */
async function getCroppedBlob(imageSrc, pixelCrop, rotation = 0) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const radians = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));
  const bW = image.width * cos + image.height * sin;
  const bH = image.width * sin + image.height * cos;

  canvas.width = bW;
  canvas.height = bH;
  ctx.translate(bW / 2, bH / 2);
  ctx.rotate(radians);
  ctx.drawImage(image, -image.width / 2, -image.height / 2);

  const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height);
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.putImageData(data, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', 0.92);
  });
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (e) => reject(e));
    img.crossOrigin = 'anonymous';
    img.src = url;
  });
}

export default function ImageCropper({ imageSrc, onComplete, onCancel, aspect = 3 / 4 }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_area, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleDone = useCallback(async () => {
    if (!croppedAreaPixels) return;
    const blob = await getCroppedBlob(imageSrc, croppedAreaPixels, rotation);
    const file = new File([blob], 'progress-photo.jpg', { type: 'image/jpeg' });
    onComplete(file);
  }, [imageSrc, croppedAreaPixels, rotation, onComplete]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black">
      {/* Crop area */}
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          showGrid={true}
          style={{
            containerStyle: { background: '#000' },
            cropAreaStyle: { border: '2px solid #00FFFF' },
          }}
        />
      </div>

      {/* Controls */}
      <div className="bg-[#111] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-3">
        {/* Zoom + rotate */}
        <div className="flex items-center gap-4">
          <ZoomOut className="w-4 h-4 text-white/50 shrink-0" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-[#00FFFF]"
          />
          <ZoomIn className="w-4 h-4 text-white/50 shrink-0" />
          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="ml-2 p-2 rounded-lg bg-white/10 text-white/70"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-12 rounded-xl bg-white/10 text-white text-[14px] font-medium flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
          <button
            onClick={handleDone}
            className="flex-1 h-12 rounded-xl bg-[#00FFFF] text-black text-[14px] font-bold flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" /> Crop & Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
