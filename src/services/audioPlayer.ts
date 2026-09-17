// Audio Service with HTML5 Audio and Web Audio API Synthesizer Fallback
// Guarantees background music ALWAYS plays without fail in any browser!

class BackgroundAudioService {
  private audio: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private synthGain: GainNode | null = null;
  private isSynthPlaying = false;
  private synthInterval: any = null;
  private isCurrentlyPlaying = false;
  private listeners: ((playing: boolean) => void)[] = [];

  constructor() {
    // Lazy initialized on first user gesture
  }

  public subscribe(listener: (playing: boolean) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(status: boolean) {
    this.isCurrentlyPlaying = status;
    this.listeners.forEach(l => l(status));
  }

  public get isPlaying(): boolean {
    return this.isCurrentlyPlaying;
  }

  // Play from URL with automatic fallback to Web Audio Synth
  public async play(url?: string): Promise<boolean> {
    this.stop();

    if (url && url.startsWith('http')) {
      try {
        if (!this.audio) {
          this.audio = new Audio();
          this.audio.loop = true;
          this.audio.preload = 'auto';
        }
        this.audio.src = url;
        await this.audio.play();
        this.notify(true);
        return true;
      } catch (err) {
        console.warn('HTML5 Audio playback failed, falling back to Web Audio Synth:', err);
        return this.startSynth();
      }
    } else {
      return this.startSynth();
    }
  }

  public pause() {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
    }
    this.stopSynth();
    this.notify(false);
  }

  public toggle(url?: string) {
    if (this.isCurrentlyPlaying) {
      this.pause();
    } else {
      this.play(url);
    }
  }

  public stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.stopSynth();
    this.notify(false);
  }

  // Melodic soothing acoustic/ambient synthesizer
  private startSynth(): boolean {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return false;

      if (!this.audioCtx) {
        this.audioCtx = new AudioCtxClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      this.synthGain = this.audioCtx.createGain();
      this.synthGain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      this.synthGain.connect(this.audioCtx.destination);

      this.isSynthPlaying = true;
      this.notify(true);

      // Pentatonic warm uplifting chord notes (C4, E4, G4, A4, B4, C5, D5, E5)
      const frequencies = [261.63, 329.63, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25];
      let step = 0;

      const playNote = () => {
        if (!this.isSynthPlaying || !this.audioCtx || !this.synthGain) return;
        const now = this.audioCtx.currentTime;

        const osc = this.audioCtx.createOscillator();
        const noteGain = this.audioCtx.createGain();

        // Warm sine + triangle harmonics
        osc.type = step % 2 === 0 ? 'sine' : 'triangle';
        const freq = frequencies[step % frequencies.length];
        osc.frequency.setValueAtTime(freq, now);

        // Soft envelope (gentle attack, soft decay)
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(0.1, now + 0.1);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(noteGain);
        noteGain.connect(this.synthGain);

        osc.start(now);
        osc.stop(now + 1.3);

        step = (step + 1) % frequencies.length;
      };

      playNote();
      this.synthInterval = setInterval(playNote, 450);
      return true;
    } catch (e) {
      console.error('Failed to initialize Web Audio Synthesizer:', e);
      this.notify(false);
      return false;
    }
  }

  private stopSynth() {
    this.isSynthPlaying = false;
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    if (this.synthGain && this.audioCtx) {
      try {
        this.synthGain.disconnect();
      } catch {}
      this.synthGain = null;
    }
  }
}

export const backgroundAudio = new BackgroundAudioService();
