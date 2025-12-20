/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import * as React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { CameraFlipIcon, LuminescenceIcon } from './icons';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const { t } = useLanguage();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [permissionError, setPermissionError] = React.useState<string | null>(null);
  const [facingMode, setFacingMode] = React.useState<'user' | 'environment'>('user');
  const [hasMultipleCameras, setHasMultipleCameras] = React.useState(false);

  React.useEffect(() => {
    // Check for multiple cameras
    navigator.mediaDevices?.enumerateDevices().then(devices => {
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      setHasMultipleCameras(videoDevices.length > 1);
    }).catch(console.error);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setPermissionError(null);
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      setPermissionError(t('cameraPermissionError', "Camera access denied. Please enable camera permissions."));
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video stream
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Flash effect logic could go here
        
        if (facingMode === 'user') {
            // Mirror image for selfie mode
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `capture-${Date.now()}.png`, { type: 'image/png' });
            onCapture(file);
            onClose();
          }
        }, 'image/png', 1.0);
      }
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in">
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
            <div className="flex items-center gap-2">
                <LuminescenceIcon className="w-6 h-6 text-white" />
                <span className="font-bold text-white tracking-wider">CAMERA</span>
            </div>
            <button onClick={onClose} className="p-2 text-white hover:bg-white/20 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        {/* Viewfinder */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black">
            {permissionError ? (
                <div className="text-center p-8 max-w-md">
                    <p className="text-red-400 text-lg font-bold mb-2">Access Denied</p>
                    <p className="text-gray-400">{permissionError}</p>
                </div>
            ) : (
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} 
                />
            )}
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-8 flex items-center justify-center gap-12 bg-gradient-to-t from-black/80 to-transparent pb-12">
            <div className="flex-1 flex justify-end">
                 {/* Placeholder for future gallery shortcut */}
            </div>

            <button 
                onClick={handleCapture}
                disabled={!!permissionError}
                className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center group active:scale-95 transition-transform"
                aria-label="Take Photo"
            >
                <div className="w-16 h-16 bg-white rounded-full group-active:bg-gray-200 transition-colors" />
            </button>

            <div className="flex-1 flex justify-start">
                {hasMultipleCameras && (
                    <button 
                        onClick={toggleCamera} 
                        className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
                    >
                        <CameraFlipIcon className="w-6 h-6" />
                    </button>
                )}
            </div>
        </div>
    </div>
  );
};

export default CameraModal;