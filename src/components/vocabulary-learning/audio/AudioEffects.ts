// Audio effects module for vocabulary learning
export type IntensityPhase = 'low' | 'medium' | 'high';

export class AudioEffectsManager {
  private audioContextRef: AudioContext | null = null;

  // Initialize Audio Context for background sounds
  initAudioContext() {
    if (!this.audioContextRef && 'AudioContext' in window) {
      this.audioContextRef = new AudioContext();
    }
  }

  // Create rhythmic background beats with different wave types
  playBackgroundBeat(frequency: number, duration: number, volume: number = 0.1, type: OscillatorType = 'sine') {
    if (!this.audioContextRef) return;

    const oscillator = this.audioContextRef.createOscillator();
    const gainNode = this.audioContextRef.createGain();
    const filter = this.audioContextRef.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContextRef.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContextRef.currentTime);
    oscillator.type = type;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(frequency * 2, this.audioContextRef.currentTime);

    gainNode.gain.setValueAtTime(0, this.audioContextRef.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContextRef.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContextRef.currentTime + duration);

    oscillator.start();
    oscillator.stop(this.audioContextRef.currentTime + duration);
  }

  // Dynamic drilling beat that scales with intensity
  playDrillingBeat(phase: IntensityPhase) {
    if (!this.audioContextRef) return;

    const configs = {
      low: {
        mainFreq: 220, mainVol: 0.08, mainDur: 0.2,
        bassFreq: 110, bassVol: 0.05, bassDur: 0.25,
        hihatFreq: 800, hihatVol: 0.04, hihatDur: 0.08,
        layers: 1
      },
      medium: {
        mainFreq: 330, mainVol: 0.12, mainDur: 0.15,
        bassFreq: 165, bassVol: 0.08, bassDur: 0.2,
        hihatFreq: 1200, hihatVol: 0.06, hihatDur: 0.06,
        layers: 2
      },
      high: {
        mainFreq: 440, mainVol: 0.16, mainDur: 0.1,
        bassFreq: 220, bassVol: 0.12, bassDur: 0.15,
        hihatFreq: 1600, hihatVol: 0.08, hihatDur: 0.04,
        layers: 3
      }
    };

    const config = configs[phase];

    // Main beat
    this.playBackgroundBeat(config.mainFreq, config.mainDur, config.mainVol, 'square');

    // Sub bass
    this.playBackgroundBeat(config.bassFreq, config.bassDur, config.bassVol, 'sawtooth');

    // High hat
    setTimeout(() =>
      this.playBackgroundBeat(config.hihatFreq, config.hihatDur, config.hihatVol, 'triangle'), 30
    );

    // Additional layers for higher intensity
    if (config.layers >= 2) {
      setTimeout(() =>
        this.playBackgroundBeat(config.mainFreq * 1.5, config.mainDur * 0.8, config.mainVol * 0.7, 'triangle'), 60
      );
    }

    if (config.layers >= 3) {
      setTimeout(() =>
        this.playBackgroundBeat(config.bassFreq * 0.5, config.bassDur * 1.2, config.bassVol * 0.8, 'sawtooth'), 90
      );
      setTimeout(() =>
        this.playBackgroundBeat(config.hihatFreq * 1.5, config.hihatDur * 0.6, config.hihatVol * 0.9, 'square'), 120
      );
    }
  }

  // Bass drop effect
  playBassDrop() {
    if (!this.audioContextRef) return;

    const oscillator = this.audioContextRef.createOscillator();
    const gainNode = this.audioContextRef.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContextRef.destination);

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(80, this.audioContextRef.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(40, this.audioContextRef.currentTime + 0.8);

    gainNode.gain.setValueAtTime(0, this.audioContextRef.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, this.audioContextRef.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContextRef.currentTime + 0.8);

    oscillator.start();
    oscillator.stop(this.audioContextRef.currentTime + 0.8);
  }

  // Create epic success chord progression
  playSuccessSound() {
    if (!this.audioContextRef) return;

    // Major chord progression: C - E - G - C (higher)
    const chordProgression = [
      [523.25, 659.25, 783.99], // C Major
      [659.25, 830.61, 987.77], // E Major
      [783.99, 987.77, 1174.66] // G Major
    ];

    chordProgression.forEach((chord, chordIndex) => {
      chord.forEach((freq, noteIndex) => {
        setTimeout(() => {
          this.playBackgroundBeat(freq, 0.6, 0.1, 'triangle');
        }, chordIndex * 200 + noteIndex * 50);
      });
    });
  }

  // Victory fanfare
  playVictoryFanfare() {
    if (!this.audioContextRef) return;

    const melody = [523.25, 659.25, 783.99, 1046.5]; // C, E, G, C
    melody.forEach((freq, index) => {
      setTimeout(() => {
        this.playBackgroundBeat(freq, 0.4, 0.12, 'triangle');
      }, index * 150);
    });

    // Add bass line
    setTimeout(() => {
      this.playBackgroundBeat(130.81, 1.5, 0.1, 'sawtooth'); // C bass
    }, 300);
  }

  // Speech synthesis for pronunciation with dynamic rate
  speakText(text: string, rate: number = 0.8) {
    if ('speechSynthesis' in window) {
      const cleanText = text.replace(/\s*\([^)]*\)/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'en-US';
      utterance.rate = rate;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  }
}