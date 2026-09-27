/**
 * STUDY GAME - Interactive Game-Based Learning Platform
 * Core Game Engine, Adaptive AI Brain, Procedural Audio & State Management
 */

// =============================================================================
// 1. PROCEDURAL SOUND SYNTHESIZER (Web Audio API - Zero External Dependencies)
// =============================================================================
class SoundFX {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    const btn = document.getElementById('audio-icon');
    if (btn) btn.textContent = this.enabled ? '🔊' : '🔇';
    const check = document.getElementById('setting-sound-toggle');
    if (check) check.checked = this.enabled;
    game.showToast(this.enabled ? 'Suara Diaktifkan' : 'Suara Dimatikan');
  }

  setSoundEnabled(val) {
    this.enabled = !!val;
    const btn = document.getElementById('audio-icon');
    if (btn) btn.textContent = this.enabled ? '🔊' : '🔇';
  }

  playCorrect() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Pleasant two-tone chime (E5 -> B5)
    this.playTone(659.25, now, 0.12, 'sine', 0.15);
    this.playTone(987.77, now + 0.1, 0.25, 'sine', 0.2);
  }

  playWrong() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Low buzz
    this.playTone(180, now, 0.15, 'sawtooth', 0.15);
    this.playTone(130, now + 0.15, 0.25, 'sawtooth', 0.15);
  }

  playLevelUp() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Ascending celebratory fanfare: C5, E5, G5, C6
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      this.playTone(freq, now + idx * 0.1, 0.25, 'triangle', 0.2);
    });
  }

  playBossVictory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Epic fanfare
    const arpeggio = [440, 554.37, 659.25, 880, 1108.73];
    arpeggio.forEach((freq, idx) => {
      this.playTone(freq, now + idx * 0.12, 0.35, 'triangle', 0.25);
    });
  }

  playTone(freq, startTime, duration, type = 'sine', volume = 0.2) {
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(volume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }
}

const soundFx = new SoundFX();

// =============================================================================
// 2. CONFETTI & CELEBRATION ENGINE
// =============================================================================
class ConfettiEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.animating = false;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(count = 60) {
    if (!this.canvas || !this.ctx) return;
    this.resize();
    const colors = ['#388bfd', '#2ea043', '#8957e5', '#f0883e', '#e3b341', '#f85149'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: this.canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: this.canvas.height / 3 + (Math.random() - 0.5) * 100,
        w: Math.random() * 9 + 4,
        h: Math.random() * 5 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 14,
        vy: Math.random() * -12 - 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    if (!this.animating) {
      this.animating = true;
      this.loop();
    }
  }

  loop() {
    if (!this.animating) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4; // gravity
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.012;

      if (p.opacity <= 0 || p.y > this.canvas.height) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.loop());
    } else {
      this.animating = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// =============================================================================
// 3. MASTER QUESTION BANK (Structured across Multiple Subjects & Difficulty Tiers)
// =============================================================================
const SUBJECTS_DATA = [
  {
    id: 'math',
    name: 'Matematika',
    icon: '📐',
    topics: [
      {
        id: 'math_algebra',
        title: 'Aljabar & Persamaan',
        desc: 'Operasi variabel, persamaan linier satu variabel, pemfaktoran, dan relasi fungsi.',
        bossName: 'Algebraic Archdemon',
        bossAvatar: '👹'
      },
      {
        id: 'math_geometry',
        title: 'Geometri & Teorema Pythagoras',
        desc: 'Sudut, bangun datar, luas permukaan, keliling, dan perhitungan sisi segitiga siku-siku.',
        bossName: 'Pythagorean Colossus',
        bossAvatar: '🗿'
      },
      {
        id: 'math_logic',
        title: 'Logika & Peluang Statistik',
        desc: 'Permutasi, kombinasi, ruang sampel, mean, median, dan kesimpulan probabilitas.',
        bossName: 'Lord of Probability',
        bossAvatar: '🎲'
      }
    ]
  },
  {
    id: 'science',
    name: 'Sains & Alam',
    icon: '🔬',
    topics: [
      {
        id: 'science_physics',
        title: 'Fisika: Gaya & Energi',
        desc: 'Hukum Newton, usaha, energi kinetik & potensial, serta kekekalan energi mekanik.',
        bossName: 'Titan of Kinetic Force',
        bossAvatar: '⚡'
      },
      {
        id: 'science_biology',
        title: 'Biologi: Sel & Genetika',
        desc: 'Struktur organel sel, fotosintesis, respirasi seluler, DNA, dan persilangan Mendel.',
        bossName: 'Bio-Matrix Overlord',
        bossAvatar: '🧬'
      }
    ]
  },
  {
    id: 'english',
    name: 'Bahasa Inggris',
    icon: '🇬🇧',
    topics: [
      {
        id: 'english_grammar',
        title: 'Grammar & Tenses Master',
        desc: 'Past tense, present perfect, conditional sentences, dan passive voice.',
        bossName: 'Grammar Overlord',
        bossAvatar: '📜'
      },
      {
        id: 'english_vocab',
        title: 'Idioms & Advanced Vocabulary',
        desc: 'Kontekstual frasa idiomatik, sinonim tingkat lanjut, dan pembacaan kritis.',
        bossName: 'Lexicon Dragon',
        bossAvatar: '🐉'
      }
    ]
  },
  {
    id: 'informatics',
    name: 'Informatika & Komputasi',
    icon: '💻',
    topics: [
      {
        id: 'informatics_web',
        title: 'Dasar Pemrograman Web',
        desc: 'Struktur HTML semantik, CSS Flexbox/Grid, dan logika manipulasi DOM JavaScript.',
        bossName: 'Full-Stack Dreadnought',
        bossAvatar: '🤖'
      },
      {
        id: 'informatics_algo',
        title: 'Algoritma & Struktur Data',
        desc: 'Analisis kompleksitas Big-O, array, stack, queue, pencarian biner, dan rekursi.',
        bossName: 'Algorithmic Leviathan',
        bossAvatar: '👾'
      }
    ]
  }
];

const QUESTIONS_DATABASE = [
  // --- MATH: ALGEBRA ---
  {
    id: 'math_alg_e1',
    subjectId: 'math',
    topicId: 'math_algebra',
    difficulty: 'Easy',
    concept: 'Persamaan Linier Sederhana',
    question: 'Jika 3x + 7 = 22, berapakah nilai dari x?',
    options: ['x = 4', 'x = 5', 'x = 6', 'x = 7'],
    correctIndex: 1,
    hint: 'Kurangkan kedua ruas dengan 7 terlebih dahulu, kemudian bagi hasilnya dengan 3.',
    explanation: 'Langkah 1: 3x + 7 - 7 = 22 - 7 => 3x = 15. Langkah 2: Bagi kedua ruas dengan 3: x = 15 / 3 = 5.',
    keyTakeaway: 'Pada persamaan linier, isolasi variabel x dengan membalik operasi hitung secara berimbang.'
  },
  {
    id: 'math_alg_m1',
    subjectId: 'math',
    topicId: 'math_algebra',
    difficulty: 'Medium',
    concept: 'Pertidaksamaan Linier',
    question: 'Berapakah himpunan penyelesaian dari 4x - 5 > 2x + 9 ?',
    options: ['x > 7', 'x < 7', 'x > 14', 'x < 2'],
    correctIndex: 0,
    hint: 'Pindahkan variabel x ke sisi kiri dan konstanta ke sisi kanan.',
    explanation: '4x - 2x > 9 + 5 => 2x > 14 => x > 7.',
    keyTakeaway: 'Ketika membagi dengan bilangan positif, tanda pertidaksamaan tetap sama.'
  },
  {
    id: 'math_alg_h1',
    subjectId: 'math',
    topicId: 'math_algebra',
    difficulty: 'Hard',
    concept: 'Pemfaktoran Persamaan Kuadrat',
    question: 'Akar-akar dari persamaan kuadrat x² - 5x + 6 = 0 adalah...',
    options: ['x = -2 atau x = -3', 'x = 2 atau x = 3', 'x = 1 atau x = 6', 'x = -1 atau x = -6'],
    correctIndex: 1,
    hint: 'Cari dua bilangan yang jika dijumlahkan menghasilkan -5 dan jika dikalikan menghasilkan 6.',
    explanation: 'Faktorkan x² - 5x + 6 menjadi (x - 2)(x - 3) = 0. Maka x - 2 = 0 => x = 2 atau x - 3 = 0 => x = 3.',
    keyTakeaway: 'Bentuk x² + bx + c dapat difaktorkan menjadi (x + p)(x + q) dengan p+q=b dan p*q=c.'
  },
  {
    id: 'math_alg_ch1',
    subjectId: 'math',
    topicId: 'math_algebra',
    difficulty: 'Challenge',
    concept: 'Sistem Persamaan Linier Dua Variabel',
    question: 'Jika 2a + 3b = 19 dan 3a - b = 12, berapakah nilai dari (a + b)?',
    options: ['6', '7', '8', '9'],
    correctIndex: 2,
    hint: 'Gunakan metode eliminasi atau substitusi untuk mencari nilai a dan b terlebih dahulu.',
    explanation: 'Dari persamaan 2: b = 3a - 12. Substitusi ke pers 1: 2a + 3(3a - 12) = 19 => 2a + 9a - 36 = 19 => 11a = 55 => a = 5. Nilai b = 3(5) - 12 = 3. Maka a + b = 5 + 3 = 8.',
    keyTakeaway: 'Eliminasi variabel yang memiliki koefisien terkecil untuk mempercepat komputasi.'
  },
  {
    id: 'math_alg_boss',
    subjectId: 'math',
    topicId: 'math_algebra',
    difficulty: 'Boss',
    concept: 'Fungsi Kuadrat Tingkat Lanjut & Diskriminan',
    question: '[BOSS] Diketahui kurva parabola f(x) = px² - (p+2)x + 2 menyinggung sumbu-X (hanya memiliki tepat satu titik potong real). Berapakah nilai p positif yang memenuhi?',
    options: ['p = 1', 'p = 2', 'p = 4', 'p = 6'],
    correctIndex: 1,
    hint: 'Kurva menyinggung sumbu-X jika dan hanya jika Diskriminan D = b² - 4ac bernilai nol.',
    explanation: 'D = b² - 4ac = [-(p+2)]² - 4(p)(2) = p² + 4p + 4 - 8p = p² - 4p + 4 = (p - 2)². Agar D = 0, maka (p - 2)² = 0 => p = 2.',
    keyTakeaway: 'D = 0 menandakan kurva menyinggung sumbu-X dengan tepat 1 akar kembar.'
  },
  {
    id: 'math_alg_rem',
    subjectId: 'math',
    topicId: 'math_algebra',
    difficulty: 'Remedial',
    concept: 'Konsep Dasar Nilai Variabel',
    question: '[REMEDIAL REVIEW] Jika sebuah apel dihargai x rupiah dan 2 apel harganya Rp 8.000, berapakah harga 1 apel (nilai x)?',
    options: ['Rp 2.000', 'Rp 4.000', 'Rp 6.000', 'Rp 8.000'],
    correctIndex: 1,
    hint: 'Bagi harga total Rp 8.000 dengan jumlah apel (2).',
    explanation: '2x = 8.000 => x = 8.000 / 2 = 4.000.',
    keyTakeaway: 'Variabel adalah lambang pengganti suatu bilangan yang belum diketahui nilainya secara pasti.'
  },

  // --- MATH: GEOMETRY ---
  {
    id: 'math_geo_e1',
    subjectId: 'math',
    topicId: 'math_geometry',
    difficulty: 'Easy',
    concept: 'Keliling Persegi Panjang',
    question: 'Sebuah persegi panjang memiliki panjang 10 cm dan lebar 6 cm. Berapakah kelilingnya?',
    options: ['16 cm', '32 cm', '60 cm', '26 cm'],
    correctIndex: 1,
    hint: 'Keliling persegi panjang dihitung dengan formula 2 × (panjang + lebar).',
    explanation: 'Keliling = 2 × (10 + 6) = 2 × 16 = 32 cm.',
    keyTakeaway: 'Keliling adalah total panjang lintasan yang mengelilingi batas suatu bidang.'
  },
  {
    id: 'math_geo_m1',
    subjectId: 'math',
    topicId: 'math_geometry',
    difficulty: 'Medium',
    concept: 'Teorema Pythagoras',
    question: 'Sebuah segitiga siku-siku memiliki sisi alas 9 cm dan tinggi 12 cm. Berapakah panjang sisi miring (hipotenusa)?',
    options: ['15 cm', '18 cm', '21 cm', '14 cm'],
    correctIndex: 0,
    hint: 'c² = a² + b² = 9² + 12².',
    explanation: 'c = √(9² + 12²) = √(81 + 144) = √225 = 15 cm.',
    keyTakeaway: 'Triple Pythagoras dasar (3, 4, 5) dengan kelipatan 3 menghasilkan (9, 12, 15).'
  },
  {
    id: 'math_geo_boss',
    subjectId: 'math',
    topicId: 'math_geometry',
    difficulty: 'Boss',
    concept: 'Geometri Ruang & Luas Permukaan Bola',
    question: '[BOSS] Sebuah tabung memiliki jari-jari alas r dan tinggi h = 2r. Jika di dalam tabung dimasukkan sebuah bola tepat menyentuh dinding alas, atas, dan selimut tabung, berapakah perbandingan luas permukaan bola terhadap luas seluruh permukaan tabung?',
    options: ['1 : 2', '2 : 3', '3 : 4', '4 : 5'],
    correctIndex: 1,
    hint: 'Luas bola = 4πr², Luas total tabung = 2πr(r + h) dengan h = 2r.',
    explanation: 'Luas Bola = 4πr². Luas Tabung = 2πr(r + 2r) = 2πr(3r) = 6πr². Perbandingan = 4πr² / 6πr² = 4/6 = 2 : 3.',
    keyTakeaway: 'Prinsip terkenal Archimedes: Luas bola setara dengan 2/3 dari luas total tabung yang melingkupinya.'
  },

  // --- SCIENCE: PHYSICS ---
  {
    id: 'sci_phy_e1',
    subjectId: 'science',
    topicId: 'science_physics',
    difficulty: 'Easy',
    concept: 'Hukum II Newton',
    question: 'Sebuah benda bermassa 4 kg diberi gaya dorong sebesar 20 Newton. Berapakah percepatan yang dialami benda tersebut?',
    options: ['2 m/s²', '5 m/s²', '10 m/s²', '80 m/s²'],
    correctIndex: 1,
    hint: 'Gunakan rumus F = m × a, sehingga a = F / m.',
    explanation: 'a = F / m = 20 N / 4 kg = 5 m/s².',
    keyTakeaway: 'Percepatan berbanding lurus dengan gaya resultan dan berbanding terbalik dengan massa.'
  },
  {
    id: 'sci_phy_m1',
    subjectId: 'science',
    topicId: 'science_physics',
    difficulty: 'Medium',
    concept: 'Energi Kinetik',
    question: 'Sebuah mobil mainan bermassa 2 kg bergerak dengan kecepatan tetap 6 m/s. Berapakah energi kinetik yang dimiliki mobil tersebut?',
    options: ['12 Joule', '24 Joule', '36 Joule', '72 Joule'],
    correctIndex: 2,
    hint: 'Rumus energi kinetik adalah Ek = 1/2 × m × v².',
    explanation: 'Ek = 1/2 × 2 kg × (6 m/s)² = 1 × 36 = 36 Joule.',
    keyTakeaway: 'Energi kinetik meningkat secara kuadratik terhadap peningkatan kecepatan benda.'
  },
  {
    id: 'sci_phy_boss',
    subjectId: 'science',
    topicId: 'science_physics',
    difficulty: 'Boss',
    concept: 'Kekekalan Energi Mekanik',
    question: '[BOSS] Sebuah benda jatuh bebas dari ketinggian h = 45 meter di atas tanah (g = 10 m/s²). Pada ketinggian berapakah energi kinetik benda bernilai tepat dua kali dari energi potensialnya?',
    options: ['h = 10 meter', 'h = 15 meter', 'h = 20 meter', 'h = 30 meter'],
    correctIndex: 1,
    hint: 'Energi Mekanik total konstan (Em = Ep_awal = mgh). Saat Ek = 2 Ep, maka Em = Ep + 2Ep = 3Ep.',
    explanation: 'Em = m * g * 45. Pada titik yang dicari, Em = Ep + Ek = Ep + 2Ep = 3Ep => m * g * 45 = 3 * (m * g * h_akhir) => 45 = 3 * h_akhir => h_akhir = 15 meter.',
    keyTakeaway: 'Hukum Kekekalan Energi Mekanik menyatakan Em = Ep + Ek selalu bernilai konstan jika gaya gesek diabaikan.'
  },

  // --- ENGLISH: GRAMMAR ---
  {
    id: 'eng_gram_e1',
    subjectId: 'english',
    topicId: 'english_grammar',
    difficulty: 'Easy',
    concept: 'Simple Past Tense',
    question: 'Choose the correct form: "Yesterday, Sarah and Tom _______ to the national library to borrow some books."',
    options: ['go', 'goes', 'went', 'gone'],
    correctIndex: 2,
    hint: 'The time marker "Yesterday" indicates that the event occurred in the past (V2).',
    explanation: '"Went" is the past tense (V2) of the irregular verb "go".',
    keyTakeaway: 'Simple Past Tense uses verb form 2 (V2) for completed actions in past specific times.'
  },
  {
    id: 'eng_gram_m1',
    subjectId: 'english',
    topicId: 'english_grammar',
    difficulty: 'Medium',
    concept: 'Present Perfect vs Past Simple',
    question: 'Complete the sentence: "I cannot unlock the door because I _______ my keys somewhere in the car."',
    options: ['have lost', 'lost', 'losing', 'had lost'],
    correctIndex: 0,
    hint: 'The action happened in the past but has a direct consequence in the present right now.',
    explanation: 'Present perfect tense ("have lost") is used when a past action has an immediate connection or result in the present.',
    keyTakeaway: 'Present Perfect focuses on the result in the present, while Simple Past focuses on the specific past time.'
  },
  {
    id: 'eng_gram_boss',
    subjectId: 'english',
    topicId: 'english_grammar',
    difficulty: 'Boss',
    concept: 'Subjunctive & Conditional Type 3',
    question: '[BOSS] "Had we known the flight schedule earlier, we _______ our travel itinerary accordingly."',
    options: ['would reschedule', 'will have rescheduled', 'would have rescheduled', 'had rescheduled'],
    correctIndex: 2,
    hint: 'This is an inverted Third Conditional ("Had we known..." = "If we had known...").',
    explanation: 'Conditional Type 3 expresses unreal situations in the past: If + Past Perfect, Subject + would have + V3. The inversion form replaces "If we had known" with "Had we known".',
    keyTakeaway: 'Inversion of conditional sentence type 3 omits "if" and starts with "Had + Subject + V3".'
  },

  // --- INFORMATICS: WEB DEV ---
  {
    id: 'info_web_e1',
    subjectId: 'informatics',
    topicId: 'informatics_web',
    difficulty: 'Easy',
    concept: 'HTML Semantic Elements',
    question: 'Tag HTML mana yang paling tepat dan semantik untuk membungkus navigasi utama pada sebuah website?',
    options: ['<div class="nav">', '<navigation>', '<nav>', '<section>'],
    correctIndex: 2,
    hint: 'HTML5 memperkenalkan tag semantik standar khusus untuk link navigasi.',
    explanation: 'Tag <nav> adalah elemen semantik standar HTML5 yang dirancang khusus untuk memuat tautan navigasi.',
    keyTakeaway: 'Elemen semantik membantu mesin pencari (SEO) dan screen reader memahami struktur halaman secara akurat.'
  },
  {
    id: 'info_web_m1',
    subjectId: 'informatics',
    topicId: 'informatics_web',
    difficulty: 'Medium',
    concept: 'JavaScript Array Manipulation',
    codeSnippet: 'const numbers = [1, 2, 3, 4, 5];\nconst result = numbers.filter(n => n % 2 === 0).map(n => n * 10);',
    question: 'Berdasarkan kode JavaScript di atas, berapakah isi dari variabel `result`?',
    options: ['[10, 30, 50]', '[20, 40]', '[2, 4]', '[10, 20, 30, 40, 50]'],
    correctIndex: 1,
    hint: 'Filter menyaring bilangan genap saja (2 dan 4), kemudian map mengalikan masing-masing dengan 10.',
    explanation: 'numbers.filter() menghasilkan [2, 4]. Lalu .map(n => n * 10) menghasilkan [20, 40].',
    keyTakeaway: 'Method chaining pada array JavaScript memungkinkan pengolahan data fungsional yang bersih.'
  },
  {
    id: 'info_web_boss',
    subjectId: 'informatics',
    topicId: 'informatics_web',
    difficulty: 'Boss',
    concept: 'JavaScript Event Loop & Microtasks',
    codeSnippet: 'console.log("A");\nsetTimeout(() => console.log("B"), 0);\nPromise.resolve().then(() => console.log("C"));\nconsole.log("D");',
    question: '[BOSS] Berapakah urutan output yang dicetak pada console browser saat kode di atas dieksekusi?',
    options: ['A -> B -> C -> D', 'A -> D -> B -> C', 'A -> D -> C -> B', 'A -> C -> D -> B'],
    correctIndex: 2,
    hint: 'Ingat urutan eksekusi: Synchronous Call Stack -> Microtask Queue (Promises) -> Macrotask Queue (setTimeout).',
    explanation: '1. "A" dan "D" dieksekusi sinkron di call stack utama. 2. Promise callback masuk ke Microtask Queue dan dieksekusi sebelum macrotask => "C". 3. setTimeout callback masuk ke Macrotask/Task Queue => "B". Maka urutan: A -> D -> C -> B.',
    keyTakeaway: 'Microtasks (Promises, queueMicrotask) selalu diproses tuntas sebelum antrean macrotask (setTimeout, setInterval).'
  },

  // --- INFORMATICS: ALGORITHMS ---
  {
    id: 'info_algo_m1',
    subjectId: 'informatics',
    topicId: 'informatics_algo',
    difficulty: 'Medium',
    concept: 'Kompleksitas Binary Search',
    question: 'Berapakah kompleksitas waktu (time complexity) kasus terburuk (worst-case) dari algoritma Binary Search pada array terurut berukuran N?',
    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N²)'],
    correctIndex: 1,
    hint: 'Pada setiap langkah perbandingan, ruang pencarian selalu dipotong menjadi setengah (dibagi 2).',
    explanation: 'Karena Binary Search membagi ruang pencarian menjadi setengah di setiap iterasi, jumlah langkah maksimal adalah log₂(N) atau O(log N).',
    keyTakeaway: 'Algoritma logaritmik O(log N) sangat efisien untuk dataset masif dibanding pencarian linier O(N).'
  }
];

// XP Definition Map
const XP_MAP = {
  Easy: 10,
  Medium: 20,
  Hard: 30,
  Challenge: 40,
  Boss: 100,
  Remedial: 10
};

// =============================================================================
// 4. MAIN GAME STATE & PERSISTENCE CONTROLLER
// =============================================================================
class StudyGameApp {
  constructor() {
    this.confetti = new ConfettiEngine('confetti-canvas');
    this.activeScreen = 'home';
    this.activeSubjectFilter = 'all';

    // Active Quiz Session State
    this.currentSession = null;
    this.selectedOptionIndex = null;
    this.sessionTimer = null;
    this.timerSecondsRemaining = 30;

    // Load persisted state or defaults
    this.loadState();
    this.initUI();
  }

  loadState() {
    const defaultProfile = { name: 'Pelajar Tangguh', avatar: '🧙‍♂️' };
    const defaultStats = {
      totalXp: 0,
      level: 1,
      streak: 0,
      bestStreak: 0,
      totalAnswered: 0,
      correctCount: 0,
      bossesDefeated: 0,
      dailyXpToday: 0
    };

    // Default mastery mapping: 0% for all topics
    const defaultMastery = {};
    SUBJECTS_DATA.forEach(sub => {
      sub.topics.forEach(top => {
        defaultMastery[top.id] = 10; // start with 10% introductory mastery
      });
    });

    try {
      this.profile = JSON.parse(localStorage.getItem('studyGame_profile')) || defaultProfile;
      this.stats = JSON.parse(localStorage.getItem('studyGame_stats')) || defaultStats;
      this.mastery = JSON.parse(localStorage.getItem('studyGame_mastery')) || defaultMastery;
      this.history = JSON.parse(localStorage.getItem('studyGame_history')) || [];
      this.weaknesses = JSON.parse(localStorage.getItem('studyGame_weaknesses')) || {};
    } catch (e) {
      console.error('Failed reading localStorage, using defaults', e);
      this.profile = defaultProfile;
      this.stats = defaultStats;
      this.mastery = defaultMastery;
      this.history = [];
      this.weaknesses = {};
    }
  }

  saveState() {
    try {
      localStorage.setItem('studyGame_profile', JSON.stringify(this.profile));
      localStorage.setItem('studyGame_stats', JSON.stringify(this.stats));
      localStorage.setItem('studyGame_mastery', JSON.stringify(this.mastery));
      localStorage.setItem('studyGame_history', JSON.stringify(this.history));
      localStorage.setItem('studyGame_weaknesses', JSON.stringify(this.weaknesses));
    } catch (e) {
      console.error('Failed saving to localStorage', e);
    }
    this.updateHeaderAndHomeDisplays();
  }

  // Calculate Level Progression Curves
  // Level 1: 0 - 100 XP
  // Level 2: 100 - 250 XP
  // Level 3: 250 - 450 XP, etc.
  calculateLevelInfo(xp) {
    let level = 1;
    let xpFloor = 0;
    let xpCeiling = 100;

    while (xp >= xpCeiling) {
      level++;
      xpFloor = xpCeiling;
      xpCeiling = xpFloor + level * 100;
    }

    const currentLevelProgress = xp - xpFloor;
    const currentLevelSpan = xpCeiling - xpFloor;
    const progressPercent = Math.min(100, Math.floor((currentLevelProgress / currentLevelSpan) * 100));
    const xpNeeded = xpCeiling - xp;

    return {
      level,
      xpFloor,
      xpCeiling,
      progressPercent,
      xpNeeded
    };
  }

  initUI() {
    this.updateHeaderAndHomeDisplays();
    this.renderTopicsGrid();
    this.renderProgressScreen();
    this.updateAIAdvisorRecommendation();
  }

  // ===========================================================================
  // Navigation Controller
  // ===========================================================================
  navigateTo(screenId) {
    document.querySelectorAll('.screen-view').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    const targetScreen = document.getElementById(`screen-${screenId}`);
    if (targetScreen) targetScreen.classList.add('active');

    const activeNavBtn = document.querySelector(`.nav-btn[data-screen="${screenId}"]`);
    if (activeNavBtn) activeNavBtn.classList.add('active');

    this.activeScreen = screenId;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (screenId === 'progress') {
      this.renderProgressScreen();
    } else if (screenId === 'subjects') {
      this.renderTopicsGrid();
    } else if (screenId === 'home') {
      this.updateHeaderAndHomeDisplays();
      this.updateAIAdvisorRecommendation();
    }
  }

  updateHeaderAndHomeDisplays() {
    const lvlInfo = this.calculateLevelInfo(this.stats.totalXp);
    this.stats.level = lvlInfo.level;

    // Nav Bar
    const navStreakVal = document.getElementById('nav-streak-val');
    const navLevelBadge = document.getElementById('nav-level-badge');
    const navXpBar = document.getElementById('nav-xp-bar');
    const navXpVal = document.getElementById('nav-xp-val');
    const navUserAvatar = document.getElementById('nav-user-avatar');

    if (navStreakVal) navStreakVal.textContent = this.stats.streak;
    if (navLevelBadge) navLevelBadge.textContent = `Lv. ${this.stats.level}`;
    if (navXpBar) navXpBar.style.width = `${lvlInfo.progressPercent}%`;
    if (navXpVal) navXpVal.textContent = `${this.stats.totalXp} XP`;
    if (navUserAvatar) navUserAvatar.textContent = this.profile.avatar;

    // Home Screen
    const homeAvatar = document.getElementById('home-avatar');
    const homeUsername = document.getElementById('home-username');
    const homeLevel = document.getElementById('home-level');
    const homeCurrentXp = document.getElementById('home-current-xp');
    const homeNextXp = document.getElementById('home-next-xp');
    const homeXpProgress = document.getElementById('home-xp-progress');
    const homeXpNeeded = document.getElementById('home-xp-needed');
    const homeStreakVal = document.getElementById('home-streak-val');
    const homeBestStreak = document.getElementById('home-best-streak');
    const homeAccuracy = document.getElementById('home-accuracy');
    const homeRank = document.getElementById('home-rank');

    if (homeAvatar) homeAvatar.textContent = this.profile.avatar;
    if (homeUsername) homeUsername.textContent = this.profile.name;
    if (homeLevel) homeLevel.textContent = this.stats.level;
    if (homeCurrentXp) homeCurrentXp.textContent = this.stats.totalXp;
    if (homeNextXp) homeNextXp.textContent = lvlInfo.xpCeiling;
    if (homeXpProgress) homeXpProgress.style.width = `${lvlInfo.progressPercent}%`;
    if (homeXpNeeded) homeXpNeeded.textContent = lvlInfo.xpNeeded;
    if (homeStreakVal) homeStreakVal.textContent = this.stats.streak;
    if (homeBestStreak) homeBestStreak.textContent = this.stats.bestStreak;

    const acc = this.stats.totalAnswered > 0
      ? Math.round((this.stats.correctCount / this.stats.totalAnswered) * 100)
      : 0;
    if (homeAccuracy) homeAccuracy.textContent = `${acc}%`;

    // Dynamic Rank Title
    if (homeRank) {
      if (this.stats.level >= 10) homeRank.textContent = 'Grandmaster Scholar 👑';
      else if (this.stats.level >= 6) homeRank.textContent = 'Senior Adept ⚔️';
      else if (this.stats.level >= 3) homeRank.textContent = 'Journeyman Apprentice 📖';
      else homeRank.textContent = 'Novice Adventurer 🎒';
    }

    // Daily Quests
    const q1Bar = document.getElementById('quest-1-bar');
    const q1Status = document.getElementById('quest-1-status');
    const xpProgress = Math.min(50, this.stats.dailyXpToday || 0);
    if (q1Bar) q1Bar.style.width = `${(xpProgress / 50) * 100}%`;
    if (q1Status) q1Status.textContent = `${xpProgress}/50`;

    const q2Bar = document.getElementById('quest-2-bar');
    const q2Status = document.getElementById('quest-2-status');
    const streakProg = Math.min(5, this.stats.streak);
    if (q2Bar) q2Bar.style.width = `${(streakProg / 5) * 100}%`;
    if (q2Status) q2Status.textContent = `${streakProg}/5`;

    const q3Bar = document.getElementById('quest-3-bar');
    const q3Status = document.getElementById('quest-3-status');
    const bossProg = Math.min(1, this.stats.bossesDefeated || 0);
    if (q3Bar) q3Bar.style.width = `${bossProg * 100}%`;
    if (q3Status) q3Status.textContent = `${bossProg}/1`;
  }

  // ===========================================================================
  // AI Advisor & Recommendation Engine
  // ===========================================================================
  updateAIAdvisorRecommendation() {
    const el = document.getElementById('home-ai-recommendation');
    if (!el) return;

    // Detect weakest topic (lowest mastery or highest error count)
    let weakestTopic = null;
    let minMastery = 101;

    for (const [topicId, score] of Object.entries(this.mastery)) {
      if (score < minMastery) {
        minMastery = score;
        weakestTopic = topicId;
      }
    }

    // Look for error history
    let mostFrequentErrorTopic = null;
    let maxErrors = 0;
    for (const [topicId, count] of Object.entries(this.weaknesses)) {
      if (count > maxErrors) {
        maxErrors = count;
        mostFrequentErrorTopic = topicId;
      }
    }

    const targetTopicId = (maxErrors >= 2 && mostFrequentErrorTopic) ? mostFrequentErrorTopic : weakestTopic;
    const topicObj = this.findTopicById(targetTopicId) || SUBJECTS_DATA[0].topics[0];
    const targetMastery = this.mastery[topicObj.id] || 0;

    let adviceHtml = '';
    if (maxErrors >= 2) {
      adviceHtml = `
        <div class="advisor-highlight">⚠️ Peringatan Remedial Diterima: ${topicObj.title}</div>
        <p>AI mendeteksi Anda mengalami kesulitan berulang pada topik ini (Mastery: ${targetMastery}%). Dianjurkan mengambil sesi review konseptual agar fondasi semakin kokoh.</p>
        <button class="btn btn-secondary btn-sm advisor-action-btn" onclick="game.startQuizSession('${topicObj.id}', 'remedial')">
          ⚡ Mulai Sesi Remedial
        </button>
      `;
    } else if (targetMastery >= 80) {
      adviceHtml = `
        <div class="advisor-highlight">🔥 Topik Siap Boss: ${topicObj.title}</div>
        <p>Penguasaan materi Anda telah mencapai <strong>${targetMastery}%</strong>! Anda telah membuka izin menantang Boss Question untuk memperebutkan 100 XP.</p>
        <button class="btn btn-boss btn-sm advisor-action-btn" onclick="game.startQuizSession('${topicObj.id}', 'boss')">
          ⚔️ Tantang Boss Question
        </button>
      `;
    } else {
      adviceHtml = `
        <div class="advisor-highlight">🎯 Rekomendasi Adaptif: ${topicObj.title}</div>
        <p>Penguasaan saat ini: <strong>${targetMastery}%</strong>. Tingkatkan dengan latihan adaptif agar kesulitan soal dapat disesuaikan otomatis dengan ritme Anda.</p>
        <button class="btn btn-primary btn-sm advisor-action-btn" onclick="game.startQuizSession('${topicObj.id}', 'adaptive')">
          🚀 Lanjutkan Belajar
        </button>
      `;
    }

    el.innerHTML = adviceHtml;
  }

  findTopicById(topicId) {
    for (const sub of SUBJECTS_DATA) {
      const found = sub.topics.find(t => t.id === topicId);
      if (found) return { ...found, subjectName: sub.name, subjectIcon: sub.icon };
    }
    return null;
  }

  // ===========================================================================
  // SCREEN 2: Subject & Topic Filter & Grid
  // ===========================================================================
  filterSubjects(subjectId) {
    this.activeSubjectFilter = subjectId;
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-subject') === subjectId);
    });
    this.renderTopicsGrid();
  }

  renderTopicsGrid() {
    const container = document.getElementById('topics-cards-container');
    if (!container) return;

    let topicsList = [];
    SUBJECTS_DATA.forEach(sub => {
      if (this.activeSubjectFilter === 'all' || this.activeSubjectFilter === sub.id) {
        sub.topics.forEach(top => {
          topicsList.push({ ...top, subjectName: sub.name, subjectIcon: sub.icon });
        });
      }
    });

    container.innerHTML = topicsList.map(topic => {
      const masteryScore = this.mastery[topic.id] || 0;
      const isBossReady = masteryScore >= 80;
      const errorCount = this.weaknesses[topic.id] || 0;
      const needsReview = errorCount >= 2;

      let badgeHtml = '';
      if (isBossReady) {
        badgeHtml = `<span class="badge-status boss-unlocked">⚔️ Boss Ready</span>`;
      } else if (needsReview) {
        badgeHtml = `<span class="badge-status review">⚠️ Perlu Review</span>`;
      } else {
        badgeHtml = `<span class="badge-status novice">${masteryScore}% Mastery</span>`;
      }

      return `
        <div class="topic-card ${isBossReady ? 'boss-ready' : ''} ${needsReview ? 'needs-review' : ''}">
          <div class="topic-card-header">
            <div class="topic-icon">${topic.subjectIcon}</div>
            <div class="topic-badges">${badgeHtml}</div>
          </div>

          <h3 class="topic-title">${topic.title}</h3>
          <p class="topic-desc">${topic.desc}</p>

          <div class="topic-mastery-block">
            <div class="mastery-labels">
              <span>Penguasaan Konsep</span>
              <strong>${masteryScore}%</strong>
            </div>
            <div class="mastery-track">
              <div class="mastery-fill" style="width: ${masteryScore}%;"></div>
            </div>
          </div>

          <div class="topic-actions">
            <button class="btn btn-primary" onclick="game.startQuizSession('${topic.id}', 'adaptive')">
              Latihan Soal
            </button>
            ${isBossReady ? `
              <button class="btn btn-boss" onclick="game.startQuizSession('${topic.id}', 'boss')">
                ⚔️ Boss
              </button>
            ` : needsReview ? `
              <button class="btn btn-secondary" onclick="game.startQuizSession('${topic.id}', 'remedial')">
                Review
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  startQuickLearning() {
    // Pick the most relevant topic or first topic
    const firstTopic = SUBJECTS_DATA[0].topics[0];
    this.startQuizSession(firstTopic.id, 'adaptive');
  }

  // ===========================================================================
  // SCREEN 3: QUIZ & ADAPTIVE DIFFICULTY ENGINE
  // ===========================================================================
  startQuizSession(topicId, mode = 'adaptive') {
    const topic = this.findTopicById(topicId);
    if (!topic) return;

    // Filter questions belonging to this topic
    let pool = QUESTIONS_DATABASE.filter(q => q.topicId === topicId);
    if (pool.length === 0) {
      // Fallback: use all questions from this subject
      pool = QUESTIONS_DATABASE.filter(q => q.subjectId === topic.id.split('_')[0]);
    }

    // Determine initial difficulty based on mode & current mastery
    let initialDifficulty = 'Easy';
    const currentMastery = this.mastery[topicId] || 0;

    if (mode === 'boss') {
      initialDifficulty = 'Boss';
    } else if (mode === 'remedial') {
      initialDifficulty = 'Remedial';
    } else {
      // Adaptive starting point
      if (currentMastery >= 60) initialDifficulty = 'Hard';
      else if (currentMastery >= 30) initialDifficulty = 'Medium';
      else initialDifficulty = 'Easy';
    }

    this.currentSession = {
      topicId: topicId,
      topic: topic,
      mode: mode,
      questionIndex: 0,
      totalQuestions: (mode === 'boss') ? 1 : 5, // Boss is 1 epic decisive battle
      currentDifficulty: initialDifficulty,
      consecutiveCorrect: 0,
      consecutiveWrong: 0,
      sessionXpEarned: 0,
      bossHp: 100,
      currentQuestion: null
    };

    this.navigateTo('quiz');
    this.loadNextQuestionInSession();
  }

  loadNextQuestionInSession() {
    if (!this.currentSession) return;

    const s = this.currentSession;
    if (s.questionIndex >= s.totalQuestions) {
      // Session finished
      this.finishSession();
      return;
    }

    s.questionIndex++;
    this.selectedOptionIndex = null;

    // Select candidate question from database matching difficulty
    let candidate = QUESTIONS_DATABASE.find(q => 
      q.topicId === s.topicId && q.difficulty === s.currentDifficulty
    );

    // If exact match not found, find nearest question in subject
    if (!candidate) {
      candidate = QUESTIONS_DATABASE.find(q => q.topicId === s.topicId) || QUESTIONS_DATABASE[0];
    }

    s.currentQuestion = candidate;
    this.renderQuizQuestion(candidate);
    this.startTimer(30);
  }

  renderQuizQuestion(q) {
    const s = this.currentSession;

    // Top Bar Meta
    const subLabel = document.getElementById('quiz-subject-label');
    const topicLabel = document.getElementById('quiz-topic-label');
    const diffBadge = document.getElementById('quiz-difficulty-badge');
    const streakVal = document.getElementById('quiz-streak-val');
    const qNum = document.getElementById('quiz-question-number');
    const xpPotential = document.getElementById('quiz-xp-potential');
    const progressFill = document.getElementById('quiz-progress-fill');

    if (subLabel) subLabel.textContent = s.topic.subjectName;
    if (topicLabel) topicLabel.textContent = s.topic.title;
    if (streakVal) streakVal.textContent = this.stats.streak;

    if (diffBadge) {
      diffBadge.textContent = q.difficulty;
      diffBadge.className = `meta-difficulty-badge ${q.difficulty.toLowerCase()}`;
    }

    if (qNum) qNum.textContent = `Soal ${s.questionIndex} dari ${s.totalQuestions}`;
    if (progressFill) progressFill.style.width = `${(s.questionIndex / s.totalQuestions) * 100}%`;

    const potentialXp = XP_MAP[q.difficulty] || 20;
    if (xpPotential) xpPotential.textContent = `+${potentialXp} XP`;

    // Boss Banner handling
    const bossBanner = document.getElementById('boss-arena-banner');
    if (bossBanner) {
      if (q.difficulty === 'Boss' || s.mode === 'boss') {
        bossBanner.style.display = 'flex';
        const bossName = document.getElementById('boss-name-text');
        const bossAvatar = document.getElementById('boss-avatar-icon');
        const bossHpBar = document.getElementById('boss-hp-bar');
        const bossHpVal = document.getElementById('boss-hp-val');

        if (bossName) bossName.textContent = s.topic.bossName || 'Overlord Guardian';
        if (bossAvatar) bossAvatar.textContent = s.topic.bossAvatar || '👹';
        if (bossHpBar) bossHpBar.style.width = `${s.bossHp}%`;
        if (bossHpVal) bossHpVal.textContent = `${s.bossHp} / 100`;
      } else {
        bossBanner.style.display = 'none';
      }
    }

    // Question content
    const conceptTag = document.getElementById('quiz-concept-tag');
    const qText = document.getElementById('quiz-question-text');
    const codeBox = document.getElementById('quiz-code-box');
    const codeContent = document.getElementById('quiz-code-content');
    const adaptiveTag = document.getElementById('quiz-adaptive-tag');

    if (conceptTag) conceptTag.textContent = `Konsep: ${q.concept}`;
    if (qText) qText.textContent = q.question;

    if (codeBox && codeContent) {
      if (q.codeSnippet) {
        codeBox.style.display = 'block';
        codeContent.textContent = q.codeSnippet;
      } else {
        codeBox.style.display = 'none';
      }
    }

    if (adaptiveTag) {
      if (s.mode === 'remedial') {
        adaptiveTag.textContent = '🔄 Mode Remedial & Penguatan';
      } else if (s.mode === 'boss') {
        adaptiveTag.textContent = '⚔️ Boss Challenge Arena';
      } else {
        adaptiveTag.textContent = `🎯 Kesulitan Adaptif: ${s.currentDifficulty}`;
      }
    }

    // Render Options
    const optContainer = document.getElementById('quiz-options-container');
    const keys = ['A', 'B', 'C', 'D'];
    if (optContainer) {
      optContainer.innerHTML = q.options.map((optText, idx) => `
        <button class="option-btn" data-index="${idx}" onclick="game.selectOption(${idx})">
          <span class="option-key-badge">${keys[idx]}</span>
          <span class="option-text">${optText}</span>
        </button>
      `).join('');
    }

    // Hint element
    const hintText = document.getElementById('hint-text');
    if (hintText) hintText.textContent = q.hint || 'Perhatikan prinsip dasar konsep soal ini.';
    const hintPopup = document.getElementById('hint-popup');
    if (hintPopup) hintPopup.style.display = 'none';

    // Submit button reset
    const submitBtn = document.getElementById('btn-submit-answer');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Jawab Soal →';
    }
  }

  selectOption(idx) {
    this.selectedOptionIndex = idx;
    document.querySelectorAll('.option-btn').forEach((btn, i) => {
      btn.classList.toggle('selected', i === idx);
    });

    const submitBtn = document.getElementById('btn-submit-answer');
    if (submitBtn) submitBtn.disabled = false;
  }

  toggleHint() {
    const hintPopup = document.getElementById('hint-popup');
    if (hintPopup) {
      hintPopup.style.display = (hintPopup.style.display === 'none' || !hintPopup.style.display) ? 'block' : 'none';
    }
  }

  startTimer(seconds = 30) {
    this.stopTimer();
    this.timerSecondsRemaining = seconds;
    const timerText = document.getElementById('quiz-timer-text');
    if (timerText) timerText.textContent = `${this.timerSecondsRemaining}s`;

    this.sessionTimer = setInterval(() => {
      this.timerSecondsRemaining--;
      if (timerText) timerText.textContent = `${this.timerSecondsRemaining}s`;

      if (this.timerSecondsRemaining <= 0) {
        this.stopTimer();
        // Auto submit if time runs out
        this.submitAnswer(true);
      }
    }, 1000);
  }

  stopTimer() {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  // ===========================================================================
  // SUBMIT & AI GRADING LOGIC
  // ===========================================================================
  submitAnswer(isTimeout = false) {
    this.stopTimer();
    if (!this.currentSession || !this.currentSession.currentQuestion) return;

    const s = this.currentSession;
    const q = s.currentQuestion;
    const isCorrect = (this.selectedOptionIndex === q.correctIndex) && !isTimeout;

    // Visual feedback on options
    document.querySelectorAll('.option-btn').forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.correctIndex) {
        btn.classList.add('correct-reveal');
      } else if (idx === this.selectedOptionIndex && !isCorrect) {
        btn.classList.add('wrong-reveal');
      }
    });

    // XP calculation
    const baseRewardXp = XP_MAP[q.difficulty] || 10;
    let earnedXp = 0;
    let masteryDelta = 0;

    if (isCorrect) {
      soundFx.playCorrect();
      this.confetti.burst(35);
      s.consecutiveCorrect++;
      s.consecutiveWrong = 0;

      // Streak logic
      this.stats.streak++;
      if (this.stats.streak > this.stats.bestStreak) {
        this.stats.bestStreak = this.stats.streak;
      }

      earnedXp = baseRewardXp;
      // Streak multiplier bonus: +10% per 3 streaks
      if (this.stats.streak >= 3) {
        earnedXp += 5;
      }

      // Mastery Progression based on difficulty
      if (q.difficulty === 'Easy') masteryDelta = 6;
      else if (q.difficulty === 'Medium') masteryDelta = 10;
      else if (q.difficulty === 'Hard') masteryDelta = 15;
      else if (q.difficulty === 'Challenge') masteryDelta = 20;
      else if (q.difficulty === 'Boss') masteryDelta = 25;
      else masteryDelta = 8; // Remedial

      // Reset weakness count for this topic on success
      if (this.weaknesses[s.topicId]) {
        this.weaknesses[s.topicId] = Math.max(0, this.weaknesses[s.topicId] - 1);
      }

      if (q.difficulty === 'Boss') {
        s.bossHp = 0;
        this.stats.bossesDefeated = (this.stats.bossesDefeated || 0) + 1;
      }
    } else {
      soundFx.playWrong();
      s.consecutiveCorrect = 0;
      s.consecutiveWrong++;
      this.stats.streak = 0; // streak resets to 0 on incorrect
      earnedXp = 0;
      masteryDelta = -5; // Penalty

      // Register weakness counter
      this.weaknesses[s.topicId] = (this.weaknesses[s.topicId] || 0) + 1;
    }

    // Apply stats updates
    this.stats.totalXp += earnedXp;
    this.stats.dailyXpToday = (this.stats.dailyXpToday || 0) + earnedXp;
    this.stats.totalAnswered++;
    if (isCorrect) this.stats.correctCount++;
    s.sessionXpEarned += earnedXp;

    // Apply mastery update (clamped 0 to 100)
    const oldMastery = this.mastery[s.topicId] || 0;
    const newMastery = Math.min(100, Math.max(0, oldMastery + masteryDelta));
    this.mastery[s.topicId] = newMastery;

    // Record History
    this.history.unshift({
      timestamp: Date.now(),
      topicId: s.topicId,
      topicName: s.topic.title,
      subjectName: s.topic.subjectName,
      difficulty: q.difficulty,
      questionText: q.question,
      isCorrect: isCorrect,
      xpEarned: earnedXp
    });

    // Check level up
    const prevLevel = this.stats.level;
    const newLevelInfo = this.calculateLevelInfo(this.stats.totalXp);
    if (newLevelInfo.level > prevLevel) {
      soundFx.playLevelUp();
      this.showToast(`🎉 Naik Level! Kamu sekarang Level ${newLevelInfo.level}!`, 'level-up');
    }

    // Check streak milestones
    if (this.stats.streak > 0 && this.stats.streak % 3 === 0) {
      this.showToast(`🔥 Hebat! ${this.stats.streak} Streak berturut-turut!`, 'streak-up');
    }

    this.saveState();

    // AI Adaptive Adjustment for the NEXT question in this session:
    let nextTierAnnouncement = '';
    if (s.mode !== 'boss') {
      if (s.consecutiveCorrect >= 2) {
        if (s.currentDifficulty === 'Easy') s.currentDifficulty = 'Medium';
        else if (s.currentDifficulty === 'Medium') s.currentDifficulty = 'Hard';
        else if (s.currentDifficulty === 'Hard') s.currentDifficulty = 'Challenge';
        nextTierAnnouncement = `AI Meningkatkan Kesulitan ke: ${s.currentDifficulty} 🔥`;
      } else if (s.consecutiveWrong >= 1) {
        if (s.currentDifficulty === 'Challenge') s.currentDifficulty = 'Hard';
        else if (s.currentDifficulty === 'Hard') s.currentDifficulty = 'Medium';
        else if (s.currentDifficulty === 'Medium') s.currentDifficulty = 'Easy';
        else if (s.consecutiveWrong >= 2) s.currentDifficulty = 'Remedial';
        nextTierAnnouncement = `AI Menyesuaikan Kesulitan ke: ${s.currentDifficulty} (Remedial)`;
      } else {
        nextTierAnnouncement = `Tingkat Kesulitan: ${s.currentDifficulty}`;
      }
    }

    // Delay 700ms before popping result modal for smooth visual comprehension
    setTimeout(() => {
      if (q.difficulty === 'Boss' && isCorrect) {
        this.openBossVictoryModal();
      } else {
        this.openResultModal({
          isCorrect,
          isTimeout,
          earnedXp,
          streak: this.stats.streak,
          masteryDelta,
          q,
          nextTierAnnouncement
        });
      }
    }, 700);
  }

  // ===========================================================================
  // RESULT MODAL & PRESENTATION
  // ===========================================================================
  openResultModal(data) {
    const modal = document.getElementById('result-modal');
    if (!modal) return;

    const bannerIcon = document.getElementById('result-icon');
    const heading = document.getElementById('result-heading');
    const subheading = document.getElementById('result-subheading');
    const xpVal = document.getElementById('result-xp-val');
    const streakVal = document.getElementById('result-streak-val');
    const masteryVal = document.getElementById('result-mastery-val');
    const explanationText = document.getElementById('result-explanation-text');
    const takeaway = document.getElementById('result-concept-takeaway');
    const nextTierBadge = document.getElementById('result-next-tier-badge');
    const nextBtn = document.getElementById('btn-next-question');

    if (data.isCorrect) {
      bannerIcon.textContent = '🎉';
      heading.textContent = 'Jawaban Tepat Sekali!';
      heading.className = 'result-heading correct';
      subheading.textContent = 'Pemahaman konsepmu berjalan dengan sangat baik!';
    } else {
      bannerIcon.textContent = data.isTimeout ? '⏱️' : '💡';
      heading.textContent = data.isTimeout ? 'Waktu Habis!' : 'Ups, Masih Kurang Tepat!';
      heading.className = 'result-heading wrong';
      subheading.textContent = 'Jangan berkecil hati! Pelajari pembahasan di bawah ini.';
    }

    xpVal.textContent = data.earnedXp > 0 ? `+${data.earnedXp} XP` : '0 XP';
    streakVal.textContent = `${data.streak} Streak`;
    masteryVal.textContent = data.masteryDelta > 0 ? `+${data.masteryDelta}%` : `${data.masteryDelta}%`;
    explanationText.textContent = data.q.explanation;
    takeaway.innerHTML = `<strong>Kunci Konsep:</strong> ${data.q.keyTakeaway}`;
    nextTierBadge.textContent = data.nextTierAnnouncement;

    if (this.currentSession.questionIndex >= this.currentSession.totalQuestions) {
      nextBtn.textContent = 'Selesaikan Sesi 🏁';
    } else {
      nextBtn.textContent = 'Soal Berikutnya →';
    }

    modal.classList.add('active');
  }

  closeResultModal(shouldContinue = true) {
    const modal = document.getElementById('result-modal');
    if (modal) modal.classList.remove('active');

    if (shouldContinue) {
      this.loadNextQuestionInSession();
    } else {
      this.navigateTo('subjects');
    }
  }

  // Boss Victory Overlay
  openBossVictoryModal() {
    soundFx.playBossVictory();
    this.confetti.burst(100);
    const modal = document.getElementById('boss-victory-modal');
    if (modal) modal.classList.add('active');
  }

  closeBossVictoryModal() {
    const modal = document.getElementById('boss-victory-modal');
    if (modal) modal.classList.remove('active');
    this.navigateTo('subjects');
  }

  finishSession() {
    this.showToast(`🎉 Sesi Selesai! Kamu mengumpulkan ${this.currentSession.sessionXpEarned} XP!`);
    this.currentSession = null;
    this.navigateTo('progress');
  }

  confirmExitQuiz() {
    if (confirm('Apakah kamu yakin ingin keluar dari sesi latihan ini?')) {
      this.stopTimer();
      this.currentSession = null;
      this.navigateTo('subjects');
    }
  }

  // ===========================================================================
  // SCREEN 4: PROGRESS & DETAILED ANALYTICS
  // ===========================================================================
  renderProgressScreen() {
    const totalXp = document.getElementById('stats-total-xp');
    const level = document.getElementById('stats-level');
    const bestStreak = document.getElementById('stats-best-streak');
    const accuracy = document.getElementById('stats-accuracy');

    if (totalXp) totalXp.textContent = `${this.stats.totalXp} XP`;
    if (level) level.textContent = `Level ${this.stats.level}`;
    if (bestStreak) bestStreak.textContent = `${this.stats.bestStreak} Streak`;

    const acc = this.stats.totalAnswered > 0
      ? Math.round((this.stats.correctCount / this.stats.totalAnswered) * 100)
      : 0;
    if (accuracy) accuracy.textContent = `${acc}%`;

    // AI Diagnosis Box
    const diagnosisEl = document.getElementById('progress-ai-diagnosis');
    if (diagnosisEl) {
      let highRiskTopics = [];
      for (const [topicId, count] of Object.entries(this.weaknesses)) {
        if (count >= 1) {
          const t = this.findTopicById(topicId);
          if (t) highRiskTopics.push({ ...t, errors: count, score: this.mastery[topicId] || 0 });
        }
      }

      if (highRiskTopics.length > 0) {
        diagnosisEl.innerHTML = `
          <div class="advisor-highlight">⚠️ Perhatian Khusus Dibutuhkan:</div>
          <p>AI mencatat Anda mengalami kesulitan pada materi berikut: <strong>${highRiskTopics.map(h => `${h.title} (${h.score}% mastery)`).join(', ')}</strong>.</p>
          <p style="margin-top:0.4rem; color: var(--text-muted);">Saran AI: Ambil sesi Remedial atau pelajari kembali rangkuman konsep sebelum mencoba tingkat kesulitan yang lebih tinggi.</p>
        `;
      } else {
        diagnosisEl.innerHTML = `
          <div class="advisor-highlight">🌟 Pola Belajar Sangat Prima!</div>
          <p>Tidak ada kelemahan kritis yang terdeteksi saat ini. Akurasi Anda mencapai ${acc}%. Terus pertahankan streak jawaban benar untuk meraih peringkat Scholar berikutnya!</p>
        `;
      }
    }

    // Topic Mastery List
    const masteryList = document.getElementById('progress-mastery-list');
    if (masteryList) {
      let itemsHtml = '';
      SUBJECTS_DATA.forEach(sub => {
        sub.topics.forEach(top => {
          const score = this.mastery[top.id] || 0;
          const isBoss = score >= 80;
          itemsHtml += `
            <div class="mastery-row">
              <div class="mastery-row-info">
                <div class="mastery-row-title">
                  <span>${sub.icon}</span>
                  <strong>${top.title}</strong>
                  ${isBoss ? '<span class="badge-status boss-unlocked">Boss Unlocked</span>' : ''}
                </div>
                <div class="mastery-track">
                  <div class="mastery-fill" style="width: ${score}%;"></div>
                </div>
              </div>
              <div class="mastery-row-pct">${score}%</div>
              <button class="btn btn-secondary btn-sm" onclick="game.startQuizSession('${top.id}', 'adaptive')">
                Latih
              </button>
            </div>
          `;
        });
      });
      masteryList.innerHTML = itemsHtml;
    }

    // Performance History Table
    const tableBody = document.getElementById('history-table-body');
    const historyCount = document.getElementById('history-total-count');
    if (historyCount) historyCount.textContent = `${this.history.length} Soal Tercatat`;

    if (tableBody) {
      if (this.history.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
              Belum ada riwayat pengerjaan soal. Mulailah sesi kuis sekarang!
            </td>
          </tr>
        `;
      } else {
        tableBody.innerHTML = this.history.slice(0, 15).map(item => {
          const dateStr = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return `
            <tr>
              <td>${dateStr}</td>
              <td>${item.subjectName} - ${item.topicName}</td>
              <td><span class="meta-difficulty-badge ${item.difficulty.toLowerCase()}">${item.difficulty}</span></td>
              <td>
                <span class="badge-tag-result ${item.isCorrect ? 'correct' : 'wrong'}">
                  ${item.isCorrect ? 'Benar' : 'Salah'}
                </span>
              </td>
              <td><strong>+${item.xpEarned} XP</strong></td>
            </tr>
          `;
        }).join('');
      }
    }
  }

  // ===========================================================================
  // PROFILE & SETTINGS MODALS
  // ===========================================================================
  openProfileModal() {
    const modal = document.getElementById('profile-modal');
    const inputName = document.getElementById('input-username');
    if (inputName) inputName.value = this.profile.name;

    // Highlight current avatar
    document.querySelectorAll('.avatar-opt').forEach(btn => {
      btn.classList.toggle('selected', btn.textContent.trim() === this.profile.avatar);
    });

    if (modal) modal.classList.add('active');
  }

  closeProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.classList.remove('active');
  }

  selectAvatar(emoji) {
    this.profile.avatar = emoji;
    document.querySelectorAll('.avatar-opt').forEach(btn => {
      btn.classList.toggle('selected', btn.textContent.trim() === emoji);
    });
  }

  saveProfile() {
    const inputName = document.getElementById('input-username');
    if (inputName && inputName.value.trim()) {
      this.profile.name = inputName.value.trim();
    }
    this.saveState();
    this.closeProfileModal();
    this.showToast('Profil berhasil diperbarui!');
  }

  resetAllDataConfirmation() {
    if (confirm('Peringatan: Apakah Anda yakin ingin menghapus semua progres (XP, Level, Streak, Mastery, dan Riwayat)? Tindakan ini tidak dapat dibatalkan.')) {
      localStorage.clear();
      this.loadState();
      this.initUI();
      this.showToast('Data progres telah direset ke kondisi awal.');
    }
  }

  // Toast System
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>⚡</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      setTimeout(() => toast.remove(), 350);
    }, 3200);
  }
}

// Global Game Instance
let game;
document.addEventListener('DOMContentLoaded', () => {
  game = new StudyGameApp();
});
