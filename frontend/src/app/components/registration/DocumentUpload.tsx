import { useState, useRef } from 'react';
import { Upload, CheckCircle, X, FileText } from 'lucide-react';

interface DocumentUploadProps {
  label: string;
  description: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  accentColor: string;
}

export function DocumentUpload({ label, description, file, onFileChange, accentColor }: DocumentUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="mb-6">
      <label className="block mb-2 text-sm" style={{ color: '#374151', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>
        {label}
      </label>
      <p className="text-xs mb-3" style={{ color: '#9ca3af' }}>{description}</p>

      {!file ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
          className="relative cursor-pointer rounded-lg transition-all"
          style={{
            border: `2px dashed ${dragActive ? accentColor : '#d1d5db'}`,
            backgroundColor: dragActive ? `${accentColor}08` : '#fafafa',
            padding: '2rem',
          }}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleChange}
            accept=".pdf,.jpg,.jpeg,.png"
          />

          <div className="text-center">
            <Upload className="w-12 h-12 mx-auto mb-4" style={{ color: dragActive ? accentColor : '#9ca3af' }} />
            <p className="mb-2 text-sm" style={{ color: '#374151' }}>
              <span style={{ color: accentColor, fontWeight: 600 }}>Click to upload</span> or drag and drop
            </p>
            <p className="text-xs" style={{ color: '#9ca3af' }}>
              PDF, JPG, PNG (MAX. 5MB)
            </p>
          </div>
        </div>
      ) : (
        <div
          className="rounded-lg p-4 transition-all"
          style={{
            border: `2px solid ${accentColor}`,
            backgroundColor: `${accentColor}08`,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: accentColor }}>
                  <FileText className="w-5 h-5 text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: '#374151' }}>
                  {file.name}
                </p>
                <p className="text-xs" style={{ color: '#9ca3af' }}>
                  {formatFileSize(file.size)}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <CheckCircle className="w-5 h-5" style={{ color: accentColor }} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileChange(null);
                  }}
                  className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                  style={{ color: '#6b7280' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleClick}
            className="mt-3 text-xs transition-opacity"
            style={{ color: accentColor }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Replace file
          </button>

          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleChange}
            accept=".pdf,.jpg,.jpeg,.png"
          />
        </div>
      )}
    </div>
  );
}
