// Procedural audio system using Web Audio API
export class AudioSystem {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private currentMusic: OscillatorNode | null = null;
  private musicInterval: number | null = null;
  private musicVolume = 0.5;
  private sfxVolume = 0.7;
  private initialized = false;

  init(): void {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicVolume;
      this.musicGain.connect(this.masterGain);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.masterGain);
      this.initialized = true;
    } catch (e) {
      console.warn('Audio not available:', e);
    }
  }

  resume(): void {
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMusicVolume(v: number): void {
    this.musicVolume = v;
    if (this.musicGain) this.musicGain.gain.value = v;
  }

  setSfxVolume(v: number): void {
    this.sfxVolume = v;
    if (this.sfxGain) this.sfxGain.gain.value = v;
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'square', volume = 0.3, detune = 0): void {
    if (!this.ctx || !this.sfxGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      osc.detune.value = detune;
      gain.gain.value = volume;
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) { /* silent fail */ }
  }

  private playNoise(duration: number, volume = 0.2): void {
    if (!this.ctx || !this.sfxGain) return;
    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      const gain = this.ctx.createGain();
      gain.gain.value = volume;
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      source.connect(gain);
      gain.connect(this.sfxGain);
      source.start();
    } catch (e) { /* silent fail */ }
  }

  playSword(): void { this.playTone(200, 0.15, 'sawtooth', 0.3); this.playNoise(0.1, 0.15); }
  playJump(): void { this.playTone(300, 0.1, 'square', 0.2); this.playTone(450, 0.1, 'square', 0.15); }
  playHit(): void { this.playNoise(0.2, 0.3); this.playTone(100, 0.15, 'sawtooth', 0.2); }
  playFireball(): void { this.playTone(600, 0.2, 'sine', 0.2); this.playTone(800, 0.15, 'sine', 0.15); }
  playEnemyDeath(): void { this.playTone(150, 0.3, 'sawtooth', 0.25); this.playNoise(0.15, 0.2); }
  playLevelUp(): void {
    this.playTone(440, 0.15, 'square', 0.2);
    setTimeout(() => this.playTone(554, 0.15, 'square', 0.2), 100);
    setTimeout(() => this.playTone(659, 0.2, 'square', 0.25), 200);
  }
  playCheckpoint(): void { this.playTone(523, 0.2, 'sine', 0.2); setTimeout(() => this.playTone(659, 0.3, 'sine', 0.25), 150); }
  playUI(): void { this.playTone(800, 0.05, 'square', 0.1); }
  playDamage(): void { this.playTone(80, 0.2, 'sawtooth', 0.3); this.playNoise(0.1, 0.2); }
  playBossHit(): void { this.playTone(60, 0.3, 'sawtooth', 0.4); this.playNoise(0.2, 0.3); }

  playMusic(level: number): void {
    this.stopMusic();
    if (!this.ctx || !this.musicGain) return;
    const melodies: number[][] = [
      [262, 294, 330, 262, 330, 294, 262, 247],
      [220, 247, 262, 294, 262, 247, 220, 196],
      [196, 220, 247, 262, 247, 220, 196, 175],
      [294, 330, 370, 330, 294, 262, 294, 330],
      [330, 370, 392, 440, 392, 370, 330, 294]
    ];
    const melody = melodies[Math.min(level - 1, 4)] || melodies[0];
    let noteIndex = 0;
    const playNote = () => {
      if (!this.ctx || !this.musicGain) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = melody[noteIndex % melody.length];
        gain.gain.value = 0.08;
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(this.musicGain!);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.45);
        noteIndex++;
      } catch (e) { /* silent */ }
    };
    playNote();
    this.musicInterval = window.setInterval(playNote, 500);
  }

  stopMusic(): void {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const audio = new AudioSystem();
