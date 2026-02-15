// C Diatonic Harmonica Note Layout with Bends
interface HarmonicaNote {
    hole: number;
    type: 'blow' | 'draw';
    note: string;
    frequency: number;
    bend?: string; // bend notation like '1/2', '1', '1.5'
    interval?: string; // interval relative to C (e.g., 'Root', 'M3', 'P5')
    inScale?: boolean; // whether this note is in the current scale
}

// Base harmonica layout for C key (to be transposed)
const baseHarmonicaLayout: HarmonicaNote[] = [
    // Hole 1
    { hole: 1, type: 'blow', note: 'C4', frequency: 261.63 },
    { hole: 1, type: 'draw', note: 'D4', frequency: 293.66 },
    { hole: 1, type: 'draw', note: 'D♭4', frequency: 277.18, bend: '1/2' },

    // Hole 2
    { hole: 2, type: 'blow', note: 'E4', frequency: 329.63 },
    { hole: 2, type: 'draw', note: 'G4', frequency: 392.00 },
    { hole: 2, type: 'draw', note: 'G♭4', frequency: 369.99, bend: '1/2' },
    { hole: 2, type: 'draw', note: 'F4', frequency: 349.23, bend: '1' },

    // Hole 3
    { hole: 3, type: 'blow', note: 'G4', frequency: 392.00 },
    { hole: 3, type: 'draw', note: 'B4', frequency: 493.88 },
    { hole: 3, type: 'draw', note: 'B♭4', frequency: 466.16, bend: '1/2' },
    { hole: 3, type: 'draw', note: 'A4', frequency: 440.00, bend: '1' },
    { hole: 3, type: 'draw', note: 'A♭4', frequency: 415.30, bend: '1.5' },

    // Hole 4
    { hole: 4, type: 'blow', note: 'C5', frequency: 523.25 },
    { hole: 4, type: 'draw', note: 'D5', frequency: 587.33 },
    { hole: 4, type: 'draw', note: 'D♭5', frequency: 554.37, bend: '1/2' },

    // Hole 5
    { hole: 5, type: 'blow', note: 'E5', frequency: 659.25 },
    { hole: 5, type: 'draw', note: 'F5', frequency: 698.46 },

    // Hole 6
    { hole: 6, type: 'blow', note: 'G5', frequency: 783.99 },
    { hole: 6, type: 'draw', note: 'A5', frequency: 880.00 },
    { hole: 6, type: 'draw', note: 'A♭5', frequency: 830.61, bend: '1/2' },

    // Hole 7
    { hole: 7, type: 'blow', note: 'C6', frequency: 1046.50 },
    { hole: 7, type: 'draw', note: 'B5', frequency: 987.77 },

    // Hole 8
    { hole: 8, type: 'blow', note: 'E6', frequency: 1318.51 },
    { hole: 8, type: 'blow', note: 'E♭6', frequency: 1244.51, bend: '1/2' },
    { hole: 8, type: 'draw', note: 'D6', frequency: 1174.66 },

    // Hole 9
    { hole: 9, type: 'blow', note: 'G6', frequency: 1567.98 },
    { hole: 9, type: 'blow', note: 'G♭6', frequency: 1479.98, bend: '1/2' },
    { hole: 9, type: 'draw', note: 'F6', frequency: 1396.91 },

    // Hole 10
    { hole: 10, type: 'blow', note: 'C7', frequency: 2093.00 },
    { hole: 10, type: 'blow', note: 'B6', frequency: 1975.53, bend: '1/2' },
    { hole: 10, type: 'blow', note: 'B♭6', frequency: 1864.66, bend: '1' },
    { hole: 10, type: 'draw', note: 'A6', frequency: 1760.00 },
];

// Chromatic scale for interval calculation (must be defined before transposeNote)
const chromaticScale = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const enharmonicMap: { [key: string]: string } = {
    'D♭': 'C♯',
    'E♭': 'D♯',
    'G♭': 'F♯',
    'A♭': 'G♯',
    'B♭': 'A♯'
};

// Harmonica key to semitone offset mapping (from C)
const harmonicaKeyOffsets: { [key: string]: number } = {
    'LF': -7,  // Low F (F is 7 semitones below C, but one octave lower)
    'LD': -10, // Low D (D is 10 semitones below C in same octave, 2 above)
    'C': 0,
    'Db': 1,
    'D': 2,
    'Eb': 3,
    'E': 4,
    'F': 5,
    'Gb': 6,
    'G': 7,
    'Ab': 8,
    'A': 9,
    'Bb': 10,
    'B': 11
};

// Position root notes for C harmonica (will be transposed based on key)
const basePositionRoots: { [key: number]: string } = {
    1: 'C',   // 1st position - Straight Harp
    2: 'G',   // 2nd position - Cross Harp
    3: 'D',   // 3rd position - Dorian
    4: 'D',   // 4th position - Major
    5: 'A',   // 5th position - Minor
    6: 'E',   // 6th position - Minor
    7: 'B',   // 7th position - Locrian
    8: 'F♯',  // 8th position - Lydian
    9: 'D♭',  // 9th position - Phrygian
    10: 'A♭', // 10th position
    11: 'E♭', // 11th position
    12: 'B♭'  // 12th position
};

// Function to transpose a note by semitones
function transposeNote(note: string, semitones: number): string {
    const noteWithoutOctave = note.replace(/[0-9]/g, '');
    const octaveMatch = note.match(/[0-9]/);
    let octave = octaveMatch ? parseInt(octaveMatch[0]) : 4;

    // Normalize the note
    const normalizedNote = enharmonicMap[noteWithoutOctave] || noteWithoutOctave;
    const noteIndex = chromaticScale.indexOf(normalizedNote);

    if (noteIndex === -1) return note;

    // Calculate new note index and octave
    let newIndex = noteIndex + semitones;
    while (newIndex < 0) {
        newIndex += 12;
        octave--;
    }
    while (newIndex >= 12) {
        newIndex -= 12;
        octave++;
    }

    return chromaticScale[newIndex] + octave;
}

// Function to get position roots for a given harmonica key
function getPositionRootsForKey(harmonicaKey: string): { [key: number]: string } {
    const offset = harmonicaKeyOffsets[harmonicaKey] || 0;
    const transposedRoots: { [key: number]: string } = {};

    for (const position in basePositionRoots) {
        transposedRoots[position] = transposeNote(basePositionRoots[position], offset);
    }

    return transposedRoots;
}

// Scale patterns: array of semitone intervals from root
const scalePatterns: { [key: string]: number[] } = {
    'chromatic': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    'major': [0, 2, 4, 5, 7, 9, 11],                    // Major/Ionian: 1, 2, 3, 4, 5, 6, 7
    'dorian': [0, 2, 3, 5, 7, 9, 10],                   // Dorian: 1, 2, ♭3, 4, 5, 6, ♭7
    'phrygian': [0, 1, 3, 5, 7, 8, 10],                 // Phrygian: 1, ♭2, ♭3, 4, 5, ♭6, ♭7
    'lydian': [0, 2, 4, 6, 7, 9, 11],                   // Lydian: 1, 2, 3, ♯4, 5, 6, 7
    'mixolydian': [0, 2, 4, 5, 7, 9, 10],               // Mixolydian: 1, 2, 3, 4, 5, 6, ♭7
    'minor': [0, 2, 3, 5, 7, 8, 10],                    // Natural Minor/Aeolian: 1, 2, ♭3, 4, 5, ♭6, ♭7
    'locrian': [0, 1, 3, 5, 6, 8, 10],                  // Locrian: 1, ♭2, ♭3, 4, ♭5, ♭6, ♭7
    'harmonic-minor': [0, 2, 3, 5, 7, 8, 11],           // Harmonic Minor: 1, 2, ♭3, 4, 5, ♭6, 7
    'melodic-minor-asc': [0, 2, 3, 5, 7, 9, 11],        // Melodic Minor (ascending): 1, 2, ♭3, 4, 5, 6, 7
    'melodic-minor-desc': [0, 2, 3, 5, 7, 8, 10],       // Melodic Minor (descending): same as natural minor
    'blues': [0, 3, 5, 6, 7, 10],                       // Blues: 1, ♭3, 4, ♯4/♭5, 5, ♭7
    'gypsy-minor': [0, 2, 3, 6, 7, 8, 11],              // Gypsy Minor: 1, 2, ♭3, ♯4, 5, ♭6, 7
    'whole-tone': [0, 2, 4, 6, 8, 10],                  // Whole-Tone: 1, 2, 3, ♯4, ♯5, ♯6
    'major-pentatonic': [0, 2, 4, 7, 9],                // Major Pentatonic: 1, 2, 3, 5, 6
    'minor-pentatonic': [0, 3, 5, 7, 10]                // Minor Pentatonic: 1, ♭3, 4, 5, ♭7
};

// Scale degree names for each scale type
const scaleDegreesNames: { [key: string]: string[] } = {
    'chromatic': ['1', '♭2', '2', '♭3', '3', '4', '♯4', '5', '♭6', '6', '♭7', '7'],
    'major': ['1', '2', '3', '4', '5', '6', '7'],
    'dorian': ['1', '2', '♭3', '4', '5', '6', '♭7'],
    'phrygian': ['1', '♭2', '♭3', '4', '5', '♭6', '♭7'],
    'lydian': ['1', '2', '3', '♯4', '5', '6', '7'],
    'mixolydian': ['1', '2', '3', '4', '5', '6', '♭7'],
    'minor': ['1', '2', '♭3', '4', '5', '♭6', '♭7'],
    'locrian': ['1', '♭2', '♭3', '4', '♭5', '♭6', '♭7'],
    'harmonic-minor': ['1', '2', '♭3', '4', '5', '♭6', '7'],
    'melodic-minor-asc': ['1', '2', '♭3', '4', '5', '6', '7'],
    'melodic-minor-desc': ['1', '2', '♭3', '4', '5', '♭6', '♭7'],
    'blues': ['1', '♭3', '4', '♯4', '5', '♭7'],
    'gypsy-minor': ['1', '2', '♭3', '♯4', '5', '♭6', '7'],
    'whole-tone': ['1', '2', '3', '♯4', '♯5', '♯6'],
    'major-pentatonic': ['1', '2', '3', '5', '6'],
    'minor-pentatonic': ['1', '♭3', '4', '5', '♭7']
};

// Helper function to get semitone distance between two notes
function getSemitoneDistance(fromNote: string, toNote: string): number {
    const normalizeNote = (note: string): string => {
        const noteWithoutOctave = note.replace(/[0-9]/g, '');
        return enharmonicMap[noteWithoutOctave] || noteWithoutOctave;
    };

    const fromNormalized = normalizeNote(fromNote);
    const toNormalized = normalizeNote(toNote);

    const fromIndex = chromaticScale.indexOf(fromNormalized);
    const toIndex = chromaticScale.indexOf(toNormalized);

    if (fromIndex === -1 || toIndex === -1) return 0;

    let distance = toIndex - fromIndex;
    if (distance < 0) distance += 12;
    return distance;
}

// Helper function to get interval name from semitone distance for chromatic scale
function getIntervalFromSemitones(semitones: number): string {
    const intervals = ['1', '♭2', '2', '♭3', '3', '4', '♯4', '5', '♭6', '6', '♭7', '7'];
    return intervals[semitones % 12];
}

// Helper function to get scale degree from note relative to a root and scale type
// Returns the interval name and whether the note is in the scale
function getNoteInterval(note: string, rootNote: string = 'C', scaleType: string = 'chromatic'): { interval: string, inScale: boolean } {
    const noteWithoutOctave = note.replace(/[0-9]/g, '');
    const semitones = getSemitoneDistance(rootNote, noteWithoutOctave);

    const pattern = scalePatterns[scaleType] || scalePatterns['chromatic'];
    const degreeNames = scaleDegreesNames[scaleType] || scaleDegreesNames['chromatic'];

    // Find if this semitone is in the scale
    const scaleIndex = pattern.indexOf(semitones);

    if (scaleIndex !== -1) {
        // Note is in the scale, return the scale degree
        return { interval: degreeNames[scaleIndex], inScale: true };
    } else {
        // Note is not in the scale, return chromatic interval
        return { interval: getIntervalFromSemitones(semitones), inScale: false };
    }
}

// Working harmonica layout (will be transposed based on key)
let harmonicaLayout: HarmonicaNote[] = JSON.parse(JSON.stringify(baseHarmonicaLayout));

// Current harmonica key offset (used for octave correction logic)
let currentKeyOffset: number = 0;

// Function to transpose frequency by semitones
function transposeFrequency(frequency: number, semitones: number): number {
    return frequency * Math.pow(2, semitones / 12);
}

// Function to create transposed harmonica layout for a given key
function createTransposedLayout(harmonicaKey: string): HarmonicaNote[] {
    const offset = harmonicaKeyOffsets[harmonicaKey] || 0;
    return baseHarmonicaLayout.map(note => ({
        ...note,
        note: transposeNote(note.note, offset),
        frequency: transposeFrequency(note.frequency, offset)
    }));
}

// Add default intervals to harmonica layout (1st position, chromatic scale)
harmonicaLayout.forEach(note => {
    const result = getNoteInterval(note.note, 'C', 'chromatic');
    note.interval = result.interval;
    note.inScale = result.inScale;
});

class PitchDetector {
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private dataArray: Float32Array | null = null;
    private mediaStream: MediaStream | null = null;
    private rafId: number | null = null;
    private pitchHistory: number[] = [];
    private readonly HISTORY_SIZE = 3; // Reduced for lower latency

    constructor(
        private onPitchDetected: (frequency: number, note: string, deviation: number) => void,
        private onNoSound: () => void
    ) {}

    async start(): Promise<void> {
        try {
            this.audioContext = new AudioContext();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 4096; // Balanced for accuracy and latency

            const bufferLength = this.analyser.fftSize;
            this.dataArray = new Float32Array(bufferLength);

            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                }
            });
            const source = this.audioContext.createMediaStreamSource(this.mediaStream);
            source.connect(this.analyser);

            this.detectPitch();
        } catch (error) {
            console.error('Error accessing microphone:', error);
            throw error;
        }
    }

    stop(): void {
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
        }
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
    }

    private detectPitch(): void {
        if (!this.analyser || !this.dataArray || !this.audioContext) return;

        this.analyser.getFloatTimeDomainData(this.dataArray);

        const pitch = this.yinPitchDetection(this.dataArray, this.audioContext.sampleRate);

        if (pitch > 0) {
            // Add to history for smoothing
            this.pitchHistory.push(pitch);
            if (this.pitchHistory.length > this.HISTORY_SIZE) {
                this.pitchHistory.shift();
            }

            // Use median for smoothing (more robust than average)
            const smoothedPitch = this.getMedian(this.pitchHistory);
            const { note, deviation } = this.findClosestNote(smoothedPitch);
            this.onPitchDetected(smoothedPitch, note, deviation);
        } else {
            this.pitchHistory = []; // Clear history when no sound
            this.onNoSound();
        }

        this.rafId = requestAnimationFrame(() => this.detectPitch());
    }

    /**
     * YIN Algorithm - more accurate pitch detection
     * Based on "YIN, a fundamental frequency estimator for speech and music" (de Cheveigné & Kawahara, 2002)
     */
    private yinPitchDetection(buffer: Float32Array, sampleRate: number): number {
        // Calculate RMS to check if there's enough sound
        let rms = 0;
        for (let i = 0; i < buffer.length; i++) {
            rms += buffer[i] * buffer[i];
        }
        rms = Math.sqrt(rms / buffer.length);

        // Threshold for minimum sound level
        if (rms < 0.01) return -1;

        const bufferSize = buffer.length / 2;
        const yinBuffer = new Float32Array(bufferSize);

        // Step 1: Calculate difference function
        for (let tau = 0; tau < bufferSize; tau++) {
            let sum = 0;
            for (let i = 0; i < bufferSize; i++) {
                const delta = buffer[i] - buffer[i + tau];
                sum += delta * delta;
            }
            yinBuffer[tau] = sum;
        }

        // Step 2: Calculate cumulative mean normalized difference
        yinBuffer[0] = 1;
        let runningSum = 0;
        for (let tau = 1; tau < bufferSize; tau++) {
            runningSum += yinBuffer[tau];
            yinBuffer[tau] *= tau / runningSum;
        }

        // Step 3: Absolute threshold
        const threshold = 0.15; // Lower threshold = more sensitive but may pick up noise
        let tau = 2; // Start from 2 to avoid spurious results

        // Find first minimum below threshold
        while (tau < bufferSize) {
            if (yinBuffer[tau] < threshold) {
                while (tau + 1 < bufferSize && yinBuffer[tau + 1] < yinBuffer[tau]) {
                    tau++;
                }
                break;
            }
            tau++;
        }

        // Step 4: Parabolic interpolation for better precision
        if (tau >= bufferSize || yinBuffer[tau] >= threshold) {
            return -1;
        }

        let betterTau = tau;
        if (tau > 0 && tau < bufferSize - 1) {
            const s0 = yinBuffer[tau - 1];
            const s1 = yinBuffer[tau];
            const s2 = yinBuffer[tau + 1];
            betterTau = tau + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
        }

        return sampleRate / betterTau;
    }

    private getMedian(values: number[]): number {
        if (values.length === 0) return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
    }

    private findClosestNote(frequency: number): { note: string; deviation: number } {
        // Always try both the detected frequency and doubled frequency, pick the best match
        let closestNote = harmonicaLayout[0];
        let minDiff = Math.abs(frequency - closestNote.frequency);

        for (const note of harmonicaLayout) {
            const diff = Math.abs(frequency - note.frequency);
            if (diff < minDiff) {
                minDiff = diff;
                closestNote = note;
            }
        }

        // Calculate deviation in cents
        let deviation = 1200 * Math.log2(frequency / closestNote.frequency);

        // Always try doubling the frequency and see if it gives a better match
        const doubledFreq = frequency * 2;
        let closestNote2 = harmonicaLayout[0];
        let minDiff2 = Math.abs(doubledFreq - closestNote2.frequency);

        for (const note of harmonicaLayout) {
            const diff = Math.abs(doubledFreq - note.frequency);
            if (diff < minDiff2) {
                minDiff2 = diff;
                closestNote2 = note;
            }
        }

        const deviation2 = 1200 * Math.log2(doubledFreq / closestNote2.frequency);

        // Pick whichever has smaller absolute deviation
        // For high-pitched harmonicas (G, Ab, A, Bb, B with offset >= 7), prefer doubled version when close
        const diff = Math.abs(deviation2) - Math.abs(deviation);
        const shouldPreferDoubled = currentKeyOffset >= 7;

        if (diff < -5 || (shouldPreferDoubled && diff >= -5 && diff <= 20 && Math.abs(deviation2) < 100)) {
            closestNote = closestNote2;
            deviation = deviation2;
        }

        return { note: closestNote.note, deviation };
    }
}

class HarmonicaUI {
    private pitchDetector: PitchDetector;
    private activeNotes: Set<string> = new Set();
    private showIntervals: boolean = false;
    private currentPosition: number = 1;
    private currentScale: string = 'chromatic';
    private currentKey: string = 'C';
    private playbackAudioContext: AudioContext | null = null;
    private currentOscillator: OscillatorNode | null = null;
    private currentGain: GainNode | null = null;

    constructor() {
        this.pitchDetector = new PitchDetector(
            this.onPitchDetected.bind(this),
            this.onNoSound.bind(this)
        );

        this.loadSettings();

        // If a non-C key was loaded, transpose the layout before initializing
        if (this.currentKey !== 'C') {
            harmonicaLayout = createTransposedLayout(this.currentKey);
            currentKeyOffset = harmonicaKeyOffsets[this.currentKey] || 0;
        }

        // Update intervals based on loaded position and scale
        this.updateIntervalsForPosition();

        this.initializeHarmonica();
        this.setupEventListeners();
    }

    private initializeHarmonica(): void {
        const container = document.getElementById('harmonicaHoles');
        if (!container) return;

        const holes = Array.from({ length: 10 }, (_, i) => i + 1);

        holes.forEach(holeNum => {
            const holeDiv = document.createElement('div');
            holeDiv.className = 'hole';

            // Get all notes for this hole
            const blowNotes = harmonicaLayout.filter(n => n.hole === holeNum && n.type === 'blow');
            const drawNotes = harmonicaLayout.filter(n => n.hole === holeNum && n.type === 'draw');

            // Blow notes (including bends)
            if (blowNotes.length > 0) {
                const blowContainer = document.createElement('div');
                blowContainer.className = 'note-group';

                // Sort: for holes 7-10 (higher octave), place bends above main note
                // For other holes, main note first then bends
                const sortedBlowNotes = [...blowNotes].sort((a, b) => {
                    if (holeNum >= 7) {
                        // Higher octave: bends above main note
                        if (a.bend && !b.bend) return -1; // a (bend) comes first
                        if (!a.bend && b.bend) return 1;  // b (bend) comes first
                        return b.frequency - a.frequency; // same type: sort by frequency
                    } else {
                        // Lower octave: main note above bends
                        if (!a.bend && b.bend) return -1; // a (main) comes first
                        if (a.bend && !b.bend) return 1;  // b (main) comes first
                        return b.frequency - a.frequency; // same type: sort by frequency
                    }
                });

                // Add spacers to align all main notes horizontally (max 2 bends above any main)
                const bendsBeforeMain = sortedBlowNotes.findIndex(n => !n.bend);
                const spacersNeeded = 2 - (bendsBeforeMain === -1 ? 0 : bendsBeforeMain);
                for (let i = 0; i < spacersNeeded; i++) {
                    const spacer = document.createElement('div');
                    spacer.className = 'note-spacer';
                    blowContainer.appendChild(spacer);
                }

                sortedBlowNotes.forEach(blowNote => {
                    const blowDiv = document.createElement('div');
                    blowDiv.className = `note blow ${blowNote.bend ? 'bend' : 'main'}`;
                    blowDiv.id = `note-${blowNote.note}-blow${blowNote.bend ? '-bend' : ''}`;
                    blowDiv.textContent = this.showIntervals ? (blowNote.interval || blowNote.note) : blowNote.note;
                    if (blowNote.bend) {
                        blowDiv.title = `Blow bend ${blowNote.bend} step`;
                    }

                    // Add playback functionality
                    this.addNotePlayback(blowDiv, blowNote.frequency);

                    // Add deviation display bar
                    const deviationBar = document.createElement('div');
                    deviationBar.className = 'deviation-display';
                    deviationBar.id = `deviation-${blowNote.note}-blow${blowNote.bend ? '-bend' : ''}`;

                    blowDiv.appendChild(deviationBar);

                    blowContainer.appendChild(blowDiv);
                });

                holeDiv.appendChild(blowContainer);
            }

            const holeNumber = document.createElement('div');
            holeNumber.className = 'hole-number';
            holeNumber.textContent = holeNum.toString();
            holeDiv.appendChild(holeNumber);

            // Draw notes (including bends)
            if (drawNotes.length > 0) {
                const drawContainer = document.createElement('div');
                drawContainer.className = 'note-group';

                // Sort: highest pitch first (main note usually highest, then bends descending)
                const sortedDrawNotes = [...drawNotes].sort((a, b) => b.frequency - a.frequency);

                sortedDrawNotes.forEach(drawNote => {
                    const drawDiv = document.createElement('div');
                    drawDiv.className = `note draw ${drawNote.bend ? 'bend' : 'main'}`;
                    drawDiv.id = `note-${drawNote.note}-draw${drawNote.bend ? '-bend' : ''}`;
                    drawDiv.textContent = this.showIntervals ? (drawNote.interval || drawNote.note) : drawNote.note;
                    if (drawNote.bend) {
                        drawDiv.title = `Draw bend ${drawNote.bend} step`;
                    }

                    // Add playback functionality
                    this.addNotePlayback(drawDiv, drawNote.frequency);

                    // Add deviation display bar
                    const deviationBar = document.createElement('div');
                    deviationBar.className = 'deviation-display';
                    deviationBar.id = `deviation-${drawNote.note}-draw${drawNote.bend ? '-bend' : ''}`;

                    drawDiv.appendChild(deviationBar);

                    drawContainer.appendChild(drawDiv);
                });

                holeDiv.appendChild(drawContainer);
            }

            container.appendChild(holeDiv);
        });
    }

    private setupEventListeners(): void {
        const startBtn = document.getElementById('startBtn') as HTMLButtonElement;
        if (startBtn) {
            startBtn.addEventListener('click', async () => {
                try {
                    await this.pitchDetector.start();
                    startBtn.disabled = true;
                    startBtn.textContent = 'Listening...';
                    this.updateStatus('Microphone active - play some notes!');
                } catch (error) {
                    this.updateStatus('Error: Could not access microphone');
                }
            });
        }

        const intervalToggle = document.getElementById('intervalToggle') as HTMLInputElement;
        if (intervalToggle) {
            // Restore saved state
            intervalToggle.checked = this.showIntervals;

            intervalToggle.addEventListener('change', () => {
                this.showIntervals = intervalToggle.checked;
                this.updateNoteLabels();
                this.saveSettings();
            });
        }

        const keySelect = document.getElementById('keySelect') as HTMLSelectElement;
        if (keySelect) {
            // Restore saved state
            keySelect.value = this.currentKey;

            keySelect.addEventListener('change', () => {
                this.currentKey = keySelect.value;
                this.transposeHarmonica();
                this.updateIntervalsForPosition();
                this.updateNoteLabels();
                this.saveSettings();
            });
        }

        const positionSelect = document.getElementById('positionSelect') as HTMLSelectElement;
        if (positionSelect) {
            // Restore saved state
            positionSelect.value = this.currentPosition.toString();

            positionSelect.addEventListener('change', () => {
                this.currentPosition = parseInt(positionSelect.value);
                this.updateIntervalsForPosition();
                this.updateNoteLabels();
                this.saveSettings();
            });
        }

        const scaleSelect = document.getElementById('scaleSelect') as HTMLSelectElement;
        if (scaleSelect) {
            // Restore saved state
            scaleSelect.value = this.currentScale;

            scaleSelect.addEventListener('change', () => {
                this.currentScale = scaleSelect.value;
                this.updateIntervalsForPosition();
                this.updateNoteLabels();
                this.saveSettings();
            });
        }

        // Apply initial color coding and position labels
        this.updatePositionLabels();
        this.updateNoteLabels();
    }

    private onPitchDetected(frequency: number, note: string, deviation: number): void {
        // Update displays
        const noteDisplay = document.getElementById('noteDisplay');
        const frequencyDisplay = document.getElementById('frequencyDisplay');
        const deviationText = document.getElementById('deviationText');
        const deviationIndicator = document.getElementById('deviationIndicator');

        if (noteDisplay) noteDisplay.textContent = note;
        if (frequencyDisplay) frequencyDisplay.textContent = `${frequency.toFixed(2)} Hz`;
        if (deviationText) {
            const sign = deviation > 0 ? '+' : '';
            deviationText.textContent = `Deviation: ${sign}${deviation.toFixed(1)} cents`;
        }

        // Update deviation indicator (clamped to ±50 cents)
        if (deviationIndicator) {
            const clampedDeviation = Math.max(-50, Math.min(50, deviation));
            const percentage = 50 + (clampedDeviation / 50) * 50; // 0-100%
            deviationIndicator.style.left = `${percentage}%`;

            // Color based on deviation
            if (Math.abs(deviation) < 10) {
                deviationIndicator.style.background = '#4CAF50'; // Green - in tune
            } else if (Math.abs(deviation) < 25) {
                deviationIndicator.style.background = '#FFC107'; // Yellow - slightly off
            } else {
                deviationIndicator.style.background = '#ff6b6b'; // Red - off tune
            }
        }

        // Highlight matching notes on harmonica and show deviation
        this.clearActiveNotes();
        harmonicaLayout.forEach(harmonicaNote => {
            if (harmonicaNote.note === note) {
                const bendSuffix = harmonicaNote.bend ? '-bend' : '';
                const noteElement = document.getElementById(`note-${harmonicaNote.note}-${harmonicaNote.type}${bendSuffix}`);
                const deviationElement = document.getElementById(`deviation-${harmonicaNote.note}-${harmonicaNote.type}${bendSuffix}`);

                if (noteElement) {
                    noteElement.classList.add('active');
                    this.activeNotes.add(noteElement.id);

                    // Display deviation as vertical bar movement
                    if (deviationElement) {
                        // Map deviation (-50 to +50 cents) to vertical position
                        // Negative deviation (flat) = move down, Positive (sharp) = move up
                        const clampedDeviation = Math.max(-50, Math.min(50, deviation));
                        const percentage = 50 - (clampedDeviation / 50) * 30; // 20% to 80% range
                        deviationElement.style.top = `${percentage}%`;

                        // Color based on deviation
                        if (Math.abs(deviation) < 10) {
                            deviationElement.style.background = '#4CAF50'; // Green - in tune
                        } else if (Math.abs(deviation) < 25) {
                            deviationElement.style.background = '#FFC107'; // Yellow - slightly off
                        } else {
                            deviationElement.style.background = '#ff6b6b'; // Red - off tune
                        }
                    }
                }
            }
        });
    }

    private onNoSound(): void {
        this.clearActiveNotes();
    }

    private clearActiveNotes(): void {
        this.activeNotes.forEach(noteId => {
            const element = document.getElementById(noteId);
            if (element) {
                element.classList.remove('active');
            }
        });
        this.activeNotes.clear();
    }

    private transposeHarmonica(): void {
        // Create transposed layout for the new key
        harmonicaLayout = createTransposedLayout(this.currentKey);

        // Update current key offset for octave correction logic
        currentKeyOffset = harmonicaKeyOffsets[this.currentKey] || 0;

        // Update position menu labels
        this.updatePositionLabels();

        // Re-initialize the harmonica display
        const container = document.getElementById('harmonicaHoles');
        if (container) {
            container.innerHTML = ''; // Clear existing harmonica
            this.initializeHarmonica(); // Rebuild with new notes
        }
    }

    private updatePositionLabels(): void {
        const positionSelect = document.getElementById('positionSelect') as HTMLSelectElement;
        if (!positionSelect) return;

        const positionRoots = getPositionRootsForKey(this.currentKey);
        const positionNames: { [key: number]: string } = {
            1: 'Straight',
            2: 'Cross',
            3: 'Dorian',
            4: 'Major',
            5: 'Minor',
            6: 'Minor',
            7: 'Locrian',
            8: 'Lydian',
            9: 'Phrygian',
            10: '',
            11: '',
            12: ''
        };

        // Update each option label
        for (let i = 1; i <= 12; i++) {
            const option = positionSelect.options[i - 1];
            if (option) {
                const rootNote = positionRoots[i];
                const positionName = positionNames[i];
                option.text = positionName
                    ? `${i}${this.getOrdinalSuffix(i)} (${rootNote} - ${positionName})`
                    : `${i}${this.getOrdinalSuffix(i)} (${rootNote})`;
            }
        }
    }

    private getOrdinalSuffix(n: number): string {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    }

    private updateIntervalsForPosition(): void {
        const positionRoots = getPositionRootsForKey(this.currentKey);
        const rootNote = positionRoots[this.currentPosition];
        harmonicaLayout.forEach(note => {
            const result = getNoteInterval(note.note, rootNote, this.currentScale);
            note.interval = result.interval;
            note.inScale = result.inScale;
        });
    }

    private updateNoteLabels(): void {
        harmonicaLayout.forEach(harmonicaNote => {
            const bendSuffix = harmonicaNote.bend ? '-bend' : '';
            const noteElement = document.getElementById(`note-${harmonicaNote.note}-${harmonicaNote.type}${bendSuffix}`);

            if (noteElement) {
                // Find the text node (excluding the deviation-display child)
                const displayText = this.showIntervals ? harmonicaNote.interval : harmonicaNote.note;

                // Remove existing degree classes
                noteElement.classList.remove('out-of-scale', 'degree-1', 'degree-2', 'degree-b2', 'degree-3', 'degree-b3',
                    'degree-4', 'degree-s4', 'degree-b5', 'degree-5', 'degree-6', 'degree-b6', 'degree-7', 'degree-b7',
                    'degree-s5', 'degree-s6');

                // Always apply color coding based on scale and position
                if (harmonicaNote.interval) {
                    if (harmonicaNote.inScale) {
                        // Convert interval to CSS class name (e.g., '♭3' -> 'degree-b3', '♯4' -> 'degree-s4')
                        const cssInterval = harmonicaNote.interval.replace('♭', 'b').replace('♯', 's');
                        noteElement.classList.add(`degree-${cssInterval}`);
                    } else {
                        // Note is not in scale, dim it
                        noteElement.classList.add('out-of-scale');
                    }
                }

                // Update only the text content, preserving the deviation-display element
                const deviationElement = noteElement.querySelector('.deviation-display');
                noteElement.textContent = displayText || '';

                // Re-append the deviation element
                if (deviationElement) {
                    noteElement.appendChild(deviationElement);
                }
            }
        });
    }

    private updateStatus(message: string): void {
        const status = document.getElementById('status');
        if (status) status.textContent = message;
    }

    private loadSettings(): void {
        try {
            const savedSettings = localStorage.getItem('harmonicaSettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                this.showIntervals = settings.showIntervals ?? false;
                this.currentKey = settings.currentKey ?? 'C';
                this.currentPosition = settings.currentPosition ?? 1;
                this.currentScale = settings.currentScale ?? 'chromatic';
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    private saveSettings(): void {
        try {
            const settings = {
                showIntervals: this.showIntervals,
                currentKey: this.currentKey,
                currentPosition: this.currentPosition,
                currentScale: this.currentScale
            };
            localStorage.setItem('harmonicaSettings', JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    private addNotePlayback(noteElement: HTMLElement, frequency: number): void {
        // Make element appear clickable
        noteElement.style.cursor = 'pointer';
        noteElement.style.userSelect = 'none';

        // Mouse events
        noteElement.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.playNote(frequency);
        });

        noteElement.addEventListener('mouseup', () => {
            this.stopNote();
        });

        noteElement.addEventListener('mouseleave', () => {
            this.stopNote();
        });

        // Touch events
        noteElement.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.playNote(frequency);
        });

        noteElement.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopNote();
        });

        noteElement.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            this.stopNote();
        });
    }

    private playNote(frequency: number): void {
        // Stop any currently playing note
        this.stopNote();

        // Create audio context if it doesn't exist
        if (!this.playbackAudioContext) {
            this.playbackAudioContext = new AudioContext();
        }

        // Create oscillator and gain nodes
        this.currentOscillator = this.playbackAudioContext.createOscillator();
        this.currentGain = this.playbackAudioContext.createGain();

        // Set up oscillator for harmonica-like sound
        this.currentOscillator.type = 'square'; // Square wave for harmonica-like timbre
        this.currentOscillator.frequency.value = frequency;

        // Connect nodes: Oscillator -> Gain -> Destination
        this.currentOscillator.connect(this.currentGain);
        this.currentGain.connect(this.playbackAudioContext.destination);

        // Set up envelope (attack and sustain)
        const now = this.playbackAudioContext.currentTime;
        this.currentGain.gain.setValueAtTime(0, now);
        this.currentGain.gain.linearRampToValueAtTime(0.15, now + 0.05); // Quick attack

        // Start the oscillator
        this.currentOscillator.start();
    }

    private stopNote(): void {
        if (this.currentOscillator && this.currentGain && this.playbackAudioContext) {
            const now = this.playbackAudioContext.currentTime;

            // Fade out to avoid clicking
            this.currentGain.gain.cancelScheduledValues(now);
            this.currentGain.gain.setValueAtTime(this.currentGain.gain.value, now);
            this.currentGain.gain.linearRampToValueAtTime(0, now + 0.05);

            // Stop and cleanup
            this.currentOscillator.stop(now + 0.05);
            this.currentOscillator = null;
            this.currentGain = null;
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new HarmonicaUI();
});
