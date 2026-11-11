import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause, RotateCcw, Flame, Sparkles } from "lucide-react";
import type { Bike } from "./data";
import { sound } from "./engineSound";

interface BikeAudioPlayerProps {
  bike: Bike;
}

export function BikeAudioPlayer({ bike }: BikeAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [isRevving, setIsRevving] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    // Reset player when bike changes
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.load();
    }
  }, [bike.slug]);

  useEffect(() => {
    const unsub = sound.subscribe((playing, src) => {
      if (playing && src !== bike.audioSrc) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setIsPlaying(false);
      }
    });
    return () => {
      unsub();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [bike.audioSrc]);

  const togglePlay = () => {
    sound.playMechanicalClick();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      sound.stopAllAudio();
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          sound.playRealEngineSound(bike.audioSrc, 1.0);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
      setHasLoaded(true);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
    }
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    sound.playMechanicalClick();
    if (audioRef.current) {
      const nextMute = !isMuted;
      audioRef.current.muted = nextMute;
      setIsMuted(nextMute);
    }
  };

  const handleRevBurst = () => {
    sound.playMechanicalClick();
    setIsRevving(true);
    // Play real engine audio surge
    sound.playRealEngineSound(bike.audioSrc, 1.0);

    if (audioRef.current) {
      audioRef.current.volume = Math.min(1.0, volume * 1.25);
      if (!isPlaying) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }

    setTimeout(() => {
      setIsRevving(false);
      if (audioRef.current) {
        audioRef.current.volume = volume;
      }
    }, 1200);
  };

  const handleRestart = () => {
    sound.playMechanicalClick();
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      if (!isPlaying) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-primary/40 bg-card/90 backdrop-blur-md p-6 shadow-xl">
      {/* Decorative Cyber Accent */}
      <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-primary/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

      {/* Hidden Native Audio Element */}
      <audio
        ref={audioRef}
        src={bike.audioSrc}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/30">
              <Sparkles size={12} /> Sonido Real de Fábrica
            </span>
            <span className="text-xs font-mono text-muted-foreground uppercase">
              {bike.cat} Series
            </span>
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-black text-foreground mt-1 tracking-tight">
            Rugido de Motor: {bike.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            {bike.soundNote}
          </p>
        </div>

        {/* Rev Burst Button */}
        <button
          type="button"
          onClick={handleRevBurst}
          className={`clip-cyber inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider text-white transition-all cursor-pointer shadow-lg select-none shrink-0 ${
            isRevving
              ? "bg-primary-deep scale-95 shadow-primary/50"
              : "bg-primary hover:bg-primary-deep hover:shadow-primary/30"
          }`}
        >
          <Flame size={16} className={isRevving ? "animate-bounce text-amber-300" : ""} />
          {isRevving ? "¡ACELERANDO A FONDO!" : "Acelerar a fondo (Rev)"}
        </button>
      </div>

      {/* Animated Equalizer Visualizer */}
      <div className="my-5 p-4 rounded-xl bg-background/80 border border-border/80 flex items-center justify-between gap-1 sm:gap-2 h-20">
        {Array.from({ length: 28 }).map((_, idx) => {
          // Generate varying heights when playing
          const baseHeight = 12;
          const activeHeight = isPlaying
            ? Math.max(16, Math.sin(idx * 0.4 + currentTime * 8) * 38 + 45)
            : baseHeight;
          const isHighlight = idx % 4 === 0;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col justify-end items-center h-full"
            >
              <div
                style={{
                  height: `${isRevving ? Math.min(100, activeHeight * 1.35) : activeHeight}%`,
                  transition: isPlaying ? "height 0.12s ease" : "height 0.4s ease",
                }}
                className={`w-full max-w-[6px] rounded-t-sm transition-all ${
                  isRevving
                    ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                    : isPlaying
                    ? isHighlight
                      ? "bg-primary shadow-[0_0_6px_rgba(229,23,62,0.6)]"
                      : "bg-primary/70"
                    : "bg-muted-foreground/30"
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Timeline Scrubber */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span className="text-primary font-black">
            {isPlaying ? "EN REPRODUCCIÓN (HIGH AUDIO)" : "EN ESPERA (STANDBY)"}
          </span>
          <span>{duration ? formatTime(duration) : "--:--"}</span>
        </div>
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
        />
      </div>

      {/* Controls Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/40">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-primary text-white hover:bg-primary-deep shadow-md transition-transform active:scale-95 cursor-pointer"
            title={isPlaying ? "Pausar sonido" : "Reproducir sonido"}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={handleRestart}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-card border border-border text-foreground hover:border-primary transition-colors cursor-pointer"
            title="Reiniciar sonido"
          >
            <RotateCcw size={15} />
          </button>

          <div className="hidden sm:block text-xs font-medium text-muted-foreground">
            {isPlaying ? "Rugido activo" : "Presiona reproducir"}
          </div>
        </div>

        {/* Volume Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-1"
            title={isMuted ? "Activar sonido" : "Silenciar"}
          >
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 sm:w-28 h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            title="Volumen"
          />
        </div>
      </div>
    </div>
  );
}
