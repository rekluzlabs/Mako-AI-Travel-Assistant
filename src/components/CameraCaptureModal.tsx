import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  SwitchCamera, 
  X, 
  RotateCcw, 
  Check, 
  Image as ImageIcon, 
  Upload, 
  Sparkles, 
  AlertCircle, 
  FileText, 
  Pill, 
  Users, 
  Briefcase,
  ShieldCheck
} from 'lucide-react';

export type PhotoCategory = 'document' | 'medication' | 'companion' | 'gear' | 'general';

export interface CapturedPhotoPayload {
  dataUrl: string;
  title: string;
  category: PhotoCategory;
  notes?: string;
  referenceCode?: string;
  targetId?: string; // Optional ID if updating an existing companion, item, or doc
}

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoSaved: (payload: CapturedPhotoPayload) => void;
  defaultCategory?: PhotoCategory;
  defaultTitle?: string;
  targetId?: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onPhotoSaved,
  defaultCategory = 'document',
  defaultTitle = '',
  targetId
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [title, setTitle] = useState(defaultTitle);
  const [category, setCategory] = useState<PhotoCategory>(defaultCategory);
  const [notes, setNotes] = useState('');
  const [referenceCode, setReferenceCode] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isShutterFlashing, setIsShutterFlashing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize camera when opened
  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera(facingMode);
      setTitle(defaultTitle || '');
      setCategory(defaultCategory);
      setNotes('');
      setReferenceCode('');
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async (mode: 'environment' | 'user') => {
    stopCamera();
    setCameraError(null);
    setIsCameraActive(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported on this browser/device. Please use file upload below.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      setStream(mediaStream);
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError(err.message || 'Unable to access device camera. Please check camera permissions or upload an image file.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Trigger visual shutter flash
    setIsShutterFlashing(true);
    setTimeout(() => setIsShutterFlashing(false), 200);

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // If front-facing, mirror horizontally
      if (facingMode === 'user') {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setCapturedImage(dataUrl);
      stopCamera();

      // Suggest clean default title if blank
      if (!title) {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (category === 'document') setTitle(`Document Photo - ${timeStr}`);
        else if (category === 'medication') setTitle(`Medication Label - ${timeStr}`);
        else if (category === 'companion') setTitle(`Companion Photo - ${timeStr}`);
        else if (category === 'gear') setTitle(`Gear Item Photo - ${timeStr}`);
        else setTitle(`Photo Snapshot - ${timeStr}`);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedImage(event.target.result as string);
          stopCamera();
          if (!title) {
            const clean = selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
            setTitle(clean.charAt(0).toUpperCase() + clean.slice(1));
          }
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  const handleSave = () => {
    if (!capturedImage) return;

    onPhotoSaved({
      dataUrl: capturedImage,
      title: title.trim() || 'Untitled Photo',
      category,
      notes: notes.trim() || undefined,
      referenceCode: referenceCode.trim() || undefined,
      targetId
    });

    handleClose();
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 text-white rounded-3xl max-w-2xl w-full max-h-[92vh] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800/80 flex items-center justify-between bg-stone-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                <span>Camera & Photo Capture</span>
              </h3>
              <p className="text-xs text-stone-400">
                Snap documents, prescription labels, travel companions, and gear
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Main Viewfinder or Photo Preview */}
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 sm:aspect-16/10 flex items-center justify-center border border-stone-800 shadow-inner">
            
            {/* Shutter Flash Effect */}
            {isShutterFlashing && (
              <div className="absolute inset-0 bg-white z-30 animate-out fade-out duration-200" />
            )}

            {capturedImage ? (
              // Captured Photo Preview
              <img 
                src={capturedImage} 
                alt="Captured Snapshot" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            ) : isCameraActive ? (
              // Live Camera Viewfinder
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                />

                {/* Viewfinder Target Guidelines */}
                <div className="absolute inset-8 border border-white/30 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-t-2 border-l-2 border-amber-400" />
                    <span className="w-4 h-4 border-t-2 border-r-2 border-amber-400" />
                  </div>
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-b-2 border-l-2 border-amber-400" />
                    <span className="w-4 h-4 border-b-2 border-r-2 border-amber-400" />
                  </div>
                </div>

                {/* Camera Control Overlays */}
                <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
                  <button
                    type="button"
                    onClick={toggleFacingMode}
                    className="p-2.5 rounded-full bg-stone-900/80 hover:bg-stone-800 text-white border border-stone-700 shadow-md backdrop-blur-xs transition-transform active:rotate-180 cursor-pointer"
                    title="Switch between front and rear cameras"
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              // Camera Error / Permission Request / Fallback
              <div className="text-center p-6 space-y-3 max-w-sm">
                <div className="w-14 h-14 rounded-2xl bg-stone-800 border border-stone-700 text-amber-400 flex items-center justify-center mx-auto">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-200">Device Camera Offline or Blocked</h4>
                  <p className="text-xs text-stone-400 mt-1">
                    {cameraError || 'Allow camera permissions or choose an image directly from your photo gallery / camera roll.'}
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => startCamera(facingMode)}
                    className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-600 transition-colors cursor-pointer"
                  >
                    Retry Camera
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                  </button>
                </div>
              </div>
            )}

            {/* Hidden Canvas for Frame Capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Hidden File Input for Gallery / Camera Roll */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Viewfinder Bottom Bar: Shutter & Upload Buttons */}
          {!capturedImage ? (
            <div className="flex items-center justify-between px-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium border border-stone-700 transition-colors cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span>Choose from Gallery</span>
              </button>

              {/* Big Shutter Trigger */}
              <button
                type="button"
                id="camera-shutter-button"
                onClick={takeSnapshot}
                disabled={!isCameraActive}
                className="w-14 h-14 rounded-full bg-white hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed border-4 border-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                title="Take Photo"
              >
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-stone-950">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </button>

              <div className="w-28 text-right">
                <span className="text-[11px] text-stone-500">
                  {facingMode === 'environment' ? 'Rear Camera' : 'Front Camera'}
                </span>
              </div>
            </div>
          ) : (
            // Photo Metadata & Tagging Form (When photo is taken)
            <div className="space-y-4 pt-2 animate-in fade-in duration-150">
              
              <div className="flex items-center justify-between bg-stone-800/80 p-3 rounded-2xl border border-stone-700/80">
                <span className="text-xs text-stone-300 font-medium">Photo captured successfully</span>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-700 hover:bg-stone-600 text-stone-200 text-xs font-medium transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Photo</span>
                </button>
              </div>

              {/* Tag Category Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                  What is this photo for?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'document', label: 'Document / ID', icon: FileText, desc: 'Passports, boarding passes, tickets' },
                    { id: 'medication', label: 'Medication', icon: Pill, desc: 'Pill bottle, Rx label, medical notes' },
                    { id: 'companion', label: 'Companion / ICE', icon: Users, desc: 'Travel buddy, emergency contact' },
                    { id: 'gear', label: 'Packing Gear', icon: Briefcase, desc: 'Clothing, gadgets, bags' },
                  ].map(cat => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setCategory(cat.id as PhotoCategory);
                          if (!title || title.startsWith('Photo') || title.startsWith('Document') || title.startsWith('Medication') || title.startsWith('Companion') || title.startsWith('Gear')) {
                            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            if (cat.id === 'document') setTitle(`Document Photo - ${timeStr}`);
                            else if (cat.id === 'medication') setTitle(`Medication Label - ${timeStr}`);
                            else if (cat.id === 'companion') setTitle(`Companion Photo - ${timeStr}`);
                            else if (cat.id === 'gear') setTitle(`Gear Item Photo - ${timeStr}`);
                          }
                        }}
                        className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 text-white ring-1 ring-amber-400/50'
                            : 'bg-stone-800/60 border-stone-700/80 text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-stone-400'}`} />
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <div>
                          <span className="font-bold text-xs block text-stone-200">{cat.label}</span>
                          <span className="text-[10px] text-stone-500 line-clamp-1">{cat.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Photo Title */}
              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                  Photo Title / Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Passport Photo Page, Blood Pressure Rx Label, Marcus Travel ID"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-700 bg-stone-800 text-white text-xs sm:text-sm focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                />
              </div>

              {/* Category-specific extra fields */}
              {category === 'document' && (
                <div>
                  <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                    Confirmation / Booking Code (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PNR-882194, Pass #99238"
                    value={referenceCode}
                    onChange={(e) => setReferenceCode(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-700 bg-stone-800 text-white text-xs sm:text-sm font-mono focus:outline-hidden focus:border-amber-400 transition-all"
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                  Important Notes & Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder={
                    category === 'medication' 
                      ? 'e.g. Take 1 tablet daily with food. Doctor: Dr. Hayes (Phone: 555-0192)' 
                      : category === 'companion'
                      ? 'e.g. Blood type O+, allergic to shellfish. Passport exp: 2029.'
                      : 'e.g. Gate opens at 8:00 AM, seat 14B.'
                  }
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-700 bg-stone-800 text-white text-xs sm:text-sm focus:outline-hidden focus:border-amber-400 transition-all resize-none"
                />
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-900/90 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl border border-stone-700 hover:bg-stone-800 text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {capturedImage && (
            <button
              type="button"
              id="confirm-save-photo-button"
              onClick={handleSave}
              disabled={!title.trim()}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save to {category.charAt(0).toUpperCase() + category.slice(1)}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
