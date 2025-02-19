import { useState, useRef } from 'preact/hooks';

interface ImageUploadProps {
  onImageUpload: (imageData: string) => void;
}

export default function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setFileName(file.name);

    // Create a new image to check dimensions
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      
      // Check aspect ratio (1024:1792 ≈ 0.571)
      const aspectRatio = img.width / img.height;
      if (Math.abs(aspectRatio - 0.571) > 0.1) {
        alert('Please upload an image with approximately 1024:1792 aspect ratio');
        return;
      }

      // Resize image if needed
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set target dimensions (scaled down from 1024x1792)
      const targetWidth = 512;
      const targetHeight = 896;

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Draw and resize image
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      
      // Convert to base64 and send to parent
      const resizedImage = canvas.toDataURL('image/jpeg', 0.9);
      setPreview(resizedImage);
      onImageUpload(resizedImage);
    };

    img.src = objectUrl;
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer?.files[0];
    if (file) handleImage(file);
  };

  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) handleImage(file);
        break;
      }
    }
  };

  const handleFileSelect = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) handleImage(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div class="image-upload-container">
      <div
        ref={dropRef}
        class={`image-upload ${isDragging ? 'dragging' : ''} ${preview ? 'has-preview' : ''}`}
        onClick={handleClick}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleClick();
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          class="file-input"
          onPaste={handlePaste}
        />
        
        {preview ? (
          <div class="preview-container">
            <img src={preview} alt="Preview" class="image-preview" />
            <div class="file-info">
              <span class="file-name">{fileName}</span>
              <button 
                class="remove-image" 
                onClick={(e) => {
                  e.stopPropagation();
                  setPreview(null);
                  setFileName(null);
                  onImageUpload('');
                }}
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <div class="upload-content">
            <p>Drag & drop an image here, paste from clipboard,</p>
            <p>or click to select a file</p>
            <p class="upload-hint">(Recommended: 1024×1792 aspect ratio)</p>
          </div>
        )}
      </div>
    </div>
  );
} 