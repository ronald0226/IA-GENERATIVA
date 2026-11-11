/**
 * Akira Motors Sound System
 * Uses authentic recorded motorcycle engine audio files for each model.
 */

type SoundStateListener = (isPlaying: boolean, currentSrc: string | null) => void;

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private currentAudio: HTMLAudioElement | null = null;
  private currentAudioSrc: string | null = null;
  private isAudioPlaying: boolean = false;
  private listeners: Set<SoundStateListener> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("akira_audio_muted");
      this.isMuted = saved === "true";
    }
  }

  public subscribe(cb: SoundStateListener): () => void {
    this.listeners.add(cb);
    // Initial emit
    cb(this.isAudioPlaying, this.currentAudioSrc);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb(this.isAudioPlaying, this.currentAudioSrc);
      } catch (err) {
        console.warn("Sound listener error:", err);
      }
    });
  }

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (typeof window !== "undefined") {
      localStorage.setItem("akira_audio_muted", String(muted));
      if (this.currentAudio) {
        this.currentAudio.muted = muted;
        if (muted) {
          this.stopAllAudio();
        }
      }
    }
  }

  public toggleMute(): boolean {
    const next = !this.isMuted;
    this.setMuted(next);
    if (!next) {
      this.playMechanicalClick();
    } else {
      this.stopAllAudio();
    }
    return next;
  }

  /**
   * Sharp tactile click for buttons and tabs
   */
  public playMechanicalClick(): void {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.045);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /**
   * Authoritatively stops any engine audio currently playing
   */
  public stopAllAudio(): void {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {
        // Safe ignore
      }
    }
    this.isAudioPlaying = false;
    this.currentAudioSrc = null;
    this.notify();
  }

  /**
   * Toggles the real engine sound for a specific bike:
   * - If it's already playing the SAME sound, pause it.
   * - If another engine sound was playing, stop it first.
   * - Returns true if playing, false if paused/stopped.
   */
  public toggleRealEngineSound(audioSrc: string, volume: number = 0.85): boolean {
    if (this.isMuted || typeof window === "undefined" || !audioSrc) {
      return false;
    }

    // If currently playing this exact sound -> PAUSE
    if (this.isAudioPlaying && this.currentAudio && this.currentAudioSrc === audioSrc) {
      try {
        this.currentAudio.pause();
      } catch {
        // ignore
      }
      this.isAudioPlaying = false;
      this.notify();
      return false;
    }

    // Stop whatever was previously playing
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {
        // ignore
      }
    }

    try {
      const audio = new Audio(audioSrc);
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.muted = this.isMuted;
      this.currentAudio = audio;
      this.currentAudioSrc = audioSrc;

      audio.onended = () => {
        this.isAudioPlaying = false;
        this.notify();
      };

      audio.onpause = () => {
        this.isAudioPlaying = false;
        this.notify();
      };

      audio.onplay = () => {
        this.isAudioPlaying = true;
        this.notify();
      };

      const promise = audio.play();
      if (promise !== undefined) {
        promise
          .then(() => {
            this.isAudioPlaying = true;
            this.notify();
          })
          .catch(() => {
            this.isAudioPlaying = false;
            this.notify();
          });
      }
      return true;
    } catch {
      this.isAudioPlaying = false;
      this.notify();
      return false;
    }
  }

  /**
   * Plays the engine sound from start (stopping any previous sound)
   */
  public playRealEngineSound(audioSrc: string, volume: number = 0.85): void {
    if (this.isMuted || typeof window === "undefined" || !audioSrc) return;
    this.stopAllAudio();
    this.toggleRealEngineSound(audioSrc, volume);
  }

  public isPlaying(src?: string): boolean {
    if (!this.isAudioPlaying) return false;
    if (src) return this.currentAudioSrc === src;
    return true;
  }

  public getCurrentSrc(): string | null {
    return this.currentAudioSrc;
  }

  public getCurrentAudio(): HTMLAudioElement | null {
    return this.currentAudio;
  }

  /**
   * Legacy alias
   */
  public playEngineRev(audioSrc?: string): void {
    if (audioSrc) {
      this.playRealEngineSound(audioSrc, 0.95);
    }
  }

  /**
   * Subtle hover cue
   */
  public playHoverRumble(): void {
    if (this.isMuted) return;
    this.playMechanicalClick();
  }
}

export const sound = new SoundEngine();
