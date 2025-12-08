'use client';

import { useState, useRef, useEffect } from 'react';

interface ScratchCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  productTitle: string;
  productValue?: string;
  orderId: string;
}

export default function ScratchCardModal({
  isOpen,
  onClose,
  code,
  productTitle,
  productValue,
  orderId,
}: ScratchCardModalProps) {
  const [isScratched, setIsScratched] = useState(false);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchPercentage, setScratchPercentage] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      initCanvas();
    }
  }, [isOpen]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 150;

    // Create scratch area gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#9333ea');
    gradient.addColorStop(0.5, '#7c3aed');
    gradient.addColorStop(1, '#6366f1');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add scratch instruction text
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('Scratch Here! 👆', canvas.width / 2, canvas.height / 2 - 10);
    
    ctx.font = '16px Arial';
    ctx.fillText('Reveal your code', canvas.width / 2, canvas.height / 2 + 20);
  };

  const scratch = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || isScratched) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsScratching(true);

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    // Scale for device pixel ratio
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    x *= scaleX;
    y *= scaleY;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Check scratch percentage
    checkScratchPercentage();
  };

  const checkScratchPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] < 128) {
        transparent++;
      }
    }

    const percentage = (transparent / (pixels.length / 4)) * 100;
    setScratchPercentage(percentage);

    if (percentage > 50 && !isScratched) {
      setIsScratched(true);
      markAsRevealed();
    }
  };

  const markAsRevealed = async () => {
    try {
      await fetch('/api/store/reveal-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
    } catch (error) {
      console.error('Failed to mark code as revealed:', error);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const revealAll = () => {
    setIsScratched(true);
    markAsRevealed();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border-2 border-purple-500 shadow-2xl max-w-lg w-full p-8 relative animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Celebration Icon */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-3 animate-bounce">🎉</div>
          <h2 className="text-3xl font-bold text-white mb-2">Congratulations!</h2>
          <p className="text-slate-300">You've purchased: <span className="text-purple-400 font-semibold">{productTitle}</span></p>
          {productValue && (
            <p className="text-yellow-400 font-bold text-xl mt-1">{productValue}</p>
          )}
        </div>

        {/* Scratch Card */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6">
          <p className="text-slate-400 text-center mb-4">
            {!isScratched ? 'Scratch to reveal your code!' : 'Your redemption code:'}
          </p>

          <div className="relative">
            {/* Code Behind Canvas */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl px-6 py-8 w-full max-w-md">
                <div className="text-center">
                  <p className="text-white text-sm mb-2">Your Code:</p>
                  <p className="text-white text-2xl font-mono font-bold tracking-wider break-all">
                    {code}
                  </p>
                </div>
              </div>
            </div>

            {/* Scratch Canvas */}
            {!isScratched && (
              <canvas
                ref={canvasRef}
                onMouseDown={() => setIsScratching(true)}
                onMouseUp={() => setIsScratching(false)}
                onMouseMove={(e) => isScratching && scratch(e)}
                onTouchStart={() => setIsScratching(true)}
                onTouchEnd={() => setIsScratching(false)}
                onTouchMove={(e) => scratch(e)}
                className="cursor-pointer touch-none w-full h-[150px] rounded-xl"
                style={{ maxWidth: '400px', margin: '0 auto', display: 'block' }}
              />
            )}

            {isScratched && (
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl px-6 py-8">
                <div className="text-center">
                  <p className="text-white text-sm mb-2">Your Code:</p>
                  <p className="text-white text-2xl font-mono font-bold tracking-wider break-all">
                    {code}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {!isScratched && scratchPercentage > 0 && (
            <div className="mt-4">
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-full transition-all duration-300"
                  style={{ width: `${Math.min(scratchPercentage, 100)}%` }}
                />
              </div>
              <p className="text-center text-slate-400 text-xs mt-2">
                {Math.floor(scratchPercentage)}% revealed
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!isScratched && (
            <button
              onClick={revealAll}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all"
            >
              Skip Scratch
            </button>
          )}
          
          <button
            onClick={handleCopyCode}
            disabled={!isScratched}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              isScratched
                ? copied
                  ? 'bg-green-600 text-white'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            {copied ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Code
              </>
            )}
          </button>
        </div>

        {/* Info */}
        <p className="text-slate-400 text-xs text-center mt-4">
          💡 Save this code! You can find it later in your purchase history.
        </p>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
