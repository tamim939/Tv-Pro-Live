import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import * as dashjs from "dashjs";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize, PictureInPicture, Settings, SkipBack, SkipForward, Monitor } from "lucide-react";
import { Channel } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface PlayerProps {
  channel: Channel | null;
  onPrev: () => void;
  onNext: () => void;
}

export default function Player({ channel, onPrev, onNext }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState("Auto");
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const dashRef = useRef<dashjs.MediaPlayerClass | null>(null);

  useEffect(() => {
    if (!channel || !videoRef.current) return;

    setIsLoading(true);
    setError(null);
    setQuality("Auto");

    // Cleanup previous instances
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (dashRef.current) {
      dashRef.current.reset();
      dashRef.current = null;
    }

    const video = videoRef.current;
    const url = channel.url;
    const lower = url.toLowerCase();

    if (lower.includes(".mpd")) {
      const player = dashjs.MediaPlayer().create();
      player.initialize(video, url, true);
      player.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, () => {
        setIsLoading(false);
        setIsPlaying(true);
        setQuality("DASH");
      });
      player.on(dashjs.MediaPlayer.events.ERROR, () => {
        setIsLoading(false);
        setError("Failed to load DASH stream");
      });
      dashRef.current = player;
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
        setIsLoading(false);
        setIsPlaying(true);
        
        const levels = hls.levels;
        if (levels && levels.length) {
          const maxH = Math.max(...levels.map(l => l.height || 0));
          if (maxH >= 1080) setQuality("FHD");
          else if (maxH >= 720) setQuality("HD");
          else setQuality("SD");
        }
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setIsLoading(false);
          setError("Failed to load HLS stream");
        }
      });
      hlsRef.current = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch(() => {});
        setIsLoading(false);
        setIsPlaying(true);
        setQuality("LIVE");
      }, { once: true });
      video.addEventListener("error", () => {
        setIsLoading(false);
        setError("Browser doesn't support this stream");
      }, { once: true });
    } else {
      video.src = url;
      video.addEventListener("loadeddata", () => {
        video.play().catch(() => {});
        setIsLoading(false);
        setIsPlaying(true);
        setQuality("LIVE");
      }, { once: true });
      video.addEventListener("error", () => {
        setIsLoading(false);
        setError("Failed to load direct stream");
      }, { once: true });
    }

    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
      if (dashRef.current) dashRef.current.reset();
    };
  }, [channel]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val / 100;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleFullscreen = () => {
    const wrapper = videoRef.current?.parentElement;
    if (!wrapper) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      wrapper.requestFullscreen().catch(() => {});
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      console.error("PiP error", e);
    }
  };

  const handleInteraction = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  return (
    <div 
      className="relative w-full aspect-video bg-black overflow-hidden group cursor-pointer"
      onMouseMove={handleInteraction}
      onClick={handleInteraction}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
      />

      {/* Overlays */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm gap-4"
          >
            <div className="w-12 h-12 border-4 border-white/10 border-t-green-500 rounded-full animate-spin" />
            <span className="text-xs font-bold text-white/60 tracking-widest uppercase">Connecting...</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-6 text-center gap-4"
          >
            <RotateCcw className="w-12 h-12 text-green-500 mb-2" />
            <h3 className="text-xl font-bold text-white">Stream Unavailable</h3>
            <p className="text-sm text-gray-400 max-w-xs">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-500 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-green-900/20 active:scale-95 transition-transform"
            >
              RETRY CONNECTION
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <motion.div
        animate={{ opacity: showControls ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 z-20 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none"
      >
        <div className="p-4 md:p-6 flex flex-col gap-4 pointer-events-auto">
          {/* Top Info */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg md:text-xl font-black text-white tracking-tight uppercase line-clamp-1">
                {channel?.name || "Select a Channel"}
              </h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  {channel?.group || "Offline"} • LIVE
                </span>
              </div>
            </div>
            <div className="px-2.5 py-1 bg-white/10 border border-white/10 rounded-md backdrop-blur-md">
              <span className="text-[10px] font-black text-white/60 tracking-widest uppercase">{quality}</span>
            </div>
          </div>

          {/* Player Buttons */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={onPrev} className="p-2 text-white/60 hover:text-white transition-colors active:scale-90">
                <SkipBack className="w-5 h-5 fill-current" />
              </button>
              
              <button 
                onClick={togglePlay}
                className="w-12 h-12 flex items-center justify-center bg-green-500 rounded-full text-white shadow-xl shadow-green-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current translate-x-0.5" />}
              </button>

              <button onClick={onNext} className="p-2 text-white/60 hover:text-white transition-colors active:scale-90">
                <SkipForward className="w-5 h-5 fill-current" />
              </button>

              <div className="hidden md:flex items-center gap-3 ml-4 group/vol">
                <button onClick={toggleMute} className="text-white/60 hover:text-white transition-colors">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-green-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={togglePiP} className="p-2 text-white/60 hover:text-white transition-colors active:scale-90" title="Picture-in-Picture">
                <PictureInPicture className="w-5 h-5" />
              </button>
              <button onClick={toggleFullscreen} className="p-2 text-white/60 hover:text-white transition-colors active:scale-90" title="Fullscreen">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
