import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SplashScreen() {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/welcome');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="mobile-screen bg-[hsl(var(--bg))] items-center justify-center">
      <video
        ref={videoRef}
        src="/assets/logo-animation.mp4"
        autoPlay
        muted
        playsInline
        className="w-40 h-40 object-contain"
      />
    </div>
  );
}
