import { useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw, CheckCircle } from 'lucide-react';

interface SelfieCaptureProps {
  onCapture: (dataUrl: string) => void;
  captured?: string | null;
}

export function SelfieCapture({ onCapture, captured }: SelfieCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const startCamera = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreaming(true);
      }
    } catch {
      setError('Could not access camera. Please allow camera permissions and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setStreaming(false);
  }, []);

  const capture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d')!;
    // Mirror horizontally for natural selfie feel
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    stopCamera();
    onCapture(dataUrl);
  }, [onCapture, stopCamera]);

  const retake = useCallback(() => {
    onCapture('');
    startCamera();
  }, [onCapture, startCamera]);

  if (captured) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="relative rounded-2xl overflow-hidden border-4 border-green-500 shadow-lg" style={{ width: 240, height: 240 }}>
          <img src={captured} alt="Selfie" className="w-full h-full object-cover" />
          <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
            <CheckCircle size={16} className="text-white" />
          </div>
        </div>
        <button
          type="button"
          onClick={retake}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={14} /> Retake Photo
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative rounded-2xl overflow-hidden bg-gray-900 flex items-center justify-center"
        style={{ width: 240, height: 240, border: streaming ? '3px solid #22c55e' : '2px dashed #d1d5db' }}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          style={{ display: streaming ? 'block' : 'none', transform: 'scaleX(-1)' }}
          muted
          playsInline
        />
        {!streaming && (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <Camera size={40} />
            <span className="text-xs text-center px-4">Click below to open camera</span>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {error && <p className="text-red-500 text-xs text-center max-w-xs">{error}</p>}

      {!streaming ? (
        <button
          type="button"
          onClick={startCamera}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60"
        >
          <Camera size={16} />
          {loading ? 'Starting camera…' : 'Open Camera'}
        </button>
      ) : (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={capture}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <Camera size={16} /> Take Photo
          </button>
          <button
            type="button"
            onClick={stopCamera}
            className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
