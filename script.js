document.addEventListener('DOMContentLoaded', () => {
    // Elementi DOM
    const phraseContainer = document.querySelector('.phrase-container');
    const keyboard = document.querySelector('.keyboard');
    const wrongAnswer = document.querySelector('.wrong-answer');
    const modal = document.querySelector('.modal');
    const overlay = document.querySelector('.overlay');
    const closeModalBtn = document.querySelector('.close-modal');
    const confettiContainer = document.querySelector('.confetti-container');
    const startMusicBtn = document.getElementById('start-music');
    
    // Aggiungi un elemento per il testo guida
    const selectionGuide = document.createElement('div');
    selectionGuide.classList.add('selection-guide');
    selectionGuide.style.textAlign = 'center';
    selectionGuide.style.fontSize = '2rem';
    selectionGuide.style.marginBottom = '20px';
    selectionGuide.style.fontWeight = 'bold';
    selectionGuide.style.color = 'var(--color-dark-green)';
    
    // Stato per il controllo delle consonanti/vocali
    let selectionMode = 'consonant'; // 'consonant' o 'vowel'
    let consonantsSelected = 0;
    let correctConsonantsInARow = 0; // Contatore per consonanti corrette consecutive
    const maxConsonantsBeforeVowel = 3;
    
    // Stato del gioco
    let gameStarted = false; // Flag per verificare se il gioco è iniziato
    
    // Vocali e consonanti
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    const consonants = ['b', 'c', 'd', 'f', 'g', 'h', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'z'];
    
    // Crea suoni direttamente nel JavaScript
    const correctSound = new Audio();
    const wrongSound = new Audio();
    const letterRevealSound = new Audio('assets/audio/Mario Coin Sound - Sound Effect (HD).mp3');
    const winSound = new Audio();
    
    // Array di URL alternativi per la musica di sottofondo
    const musicUrls = [
        // File audio locale (principale)
        'assets/audio/The Price is Right, Extended Theme.mp3',
        // URL di fallback (musica divertente e leggera)
        'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1cde.mp3?filename=fun-life-112188.mp3',
        'https://cdn.pixabay.com/download/audio/2022/03/15/audio_e8b6e9ac0a.mp3?filename=happy-ukulele-fun-positive-background-music-57026.mp3',
        'https://cdn.pixabay.com/download/audio/2022/10/25/audio_c1c2b13a9c.mp3?filename=happy-fun-kids-positive-game-music-57026.mp3',
        'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=game-music-loop-3-144252.mp3'
    ];
    
    // Inizializza la musica di sottofondo con il primo URL
    let backgroundMusic = new Audio(musicUrls[0]);
    let currentMusicIndex = 0;
    
    // Configura la musica di sottofondo
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.3;
    
    // Configura i suoni
    const setupSounds = () => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Suono corretto (beep acuto)
        const createCorrectSound = () => {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // La nota A5
            
            // Riduzione del volume del 50%
            gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime); // Ridotto da 0.3 a 0.15
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.3);
            
            return { play: () => {} }; // Dummy play method
        };
        
        // Suono sbagliato (beep grave)
        const createWrongSound = () => {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(110, audioCtx.currentTime); // La nota A2
            
            // Riduzione del volume del 50%
            gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime); // Ridotto da 0.3 a 0.15
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.5);
            
            return { play: () => {} }; // Dummy play method
        };
        
        // Suono vittoria (fanfara stile videogioco)
        const createWinSound = () => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Sequenza di note per una fanfara di vittoria stile videogioco
            const notes = [
                { freq: 523.25, duration: 0.1, time: 0 },    // C5
                { freq: 659.25, duration: 0.1, time: 0.1 },  // E5
                { freq: 783.99, duration: 0.1, time: 0.2 },  // G5
                { freq: 1046.50, duration: 0.4, time: 0.3 }, // C6
                { freq: 1046.50, duration: 0.1, time: 0.8 }, // C6
                { freq: 1174.66, duration: 0.1, time: 0.9 }, // D6
                { freq: 1318.51, duration: 0.6, time: 1.0 }, // E6
            ];
            
            // Suona le note principali
            notes.forEach(note => {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    // Utilizziamo un'onda quadra per un suono più "8-bit" stile videogioco
                    oscillator.type = 'square';
                    oscillator.frequency.setValueAtTime(note.freq, audioContext.currentTime);
                    
                    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
                    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + note.duration);
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + note.duration + 0.01);
                }, note.time * 1000);
            });
            
            // Aggiungi effetti di arpeggios ascendenti alla fine
            setTimeout(() => {
                const arpeggioNotes = [
                    { freq: 523.25, duration: 0.08, delay: 0 },     // C5
                    { freq: 659.25, duration: 0.08, delay: 0.08 },  // E5
                    { freq: 783.99, duration: 0.08, delay: 0.16 },  // G5
                    { freq: 1046.50, duration: 0.08, delay: 0.24 }, // C6
                    { freq: 1318.51, duration: 0.08, delay: 0.32 }, // E6
                    { freq: 1567.98, duration: 0.08, delay: 0.40 }, // G6
                    { freq: 2093.00, duration: 0.3, delay: 0.48 }   // C7
                ];
                
                arpeggioNotes.forEach(note => {
                    setTimeout(() => {
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();
                        
                        oscillator.type = 'square';
                        oscillator.frequency.setValueAtTime(note.freq, audioContext.currentTime);
                        
                        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                        gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
                        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + note.duration);
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        
                        oscillator.start();
                        oscillator.stop(audioContext.currentTime + note.duration);
                    }, note.delay * 1000);
                });
            }, 1700);
        };
        
        // Sostituisci le funzioni di riproduzione
        correctSound.play = createCorrectSound;
        wrongSound.play = createWrongSound;
        // Non sovrascriviamo letterRevealSound.play perché ora usiamo un file audio
        winSound.play = createWinSound;
    };
    
    // Frase da indovinare (modificabile)
    const phrase = "questo oggetto ti solleverà da tanta fatica";
    
    // Stato del gioco
    let lettersRevealed = 0;
    let totalLettersToReveal = 0;
    
    // Funzione per normalizzare le lettere (rimuovere accenti)
    const normalizeChar = (char) => {
        return char.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };
    
    // Aggiorna il testo guida in base alla modalità di selezione
    const updateSelectionGuide = () => {
        if (selectionMode === 'consonant') {
            selectionGuide.textContent = `Seleziona una consonante (${correctConsonantsInARow}/${maxConsonantsBeforeVowel} corrette)`;
        } else {
            selectionGuide.textContent = 'Seleziona una vocale';
        }
    };
    
    // Cambia la modalità di selezione
    const toggleSelectionMode = () => {
        if (selectionMode === 'consonant' && correctConsonantsInARow >= maxConsonantsBeforeVowel) {
            selectionMode = 'vowel';
            correctConsonantsInARow = 0;
        } else if (selectionMode === 'vowel') {
            selectionMode = 'consonant';
        }
        updateSelectionGuide();
        updateKeyboardState();
    };
    
    // Funzione per controllare quali lettere rimangono da indovinare nella frase
    const checkRemainingLetters = () => {
        const letterBoxes = document.querySelectorAll('.letter-box');
        let remainingVowels = new Set();
        let remainingConsonants = new Set();
        
        // Controlla solo le caselle non ancora rivelate
        letterBoxes.forEach(box => {
            if (!box.classList.contains('revealed') && !box.classList.contains('space')) {
                const letter = box.dataset.normalizedChar;
                // Aggiungi la lettera al set appropriato solo se non è stata ancora rivelata
                if (vowels.includes(letter)) {
                    remainingVowels.add(letter);
                } else if (consonants.includes(letter)) {
                    remainingConsonants.add(letter);
                }
            }
        });
        
        // Se nella frase rimangono solo vocali da indovinare, forza la modalità vocale
        if (remainingVowels.size > 0 && remainingConsonants.size === 0) {
            selectionMode = 'vowel';
            correctConsonantsInARow = maxConsonantsBeforeVowel; // Forza il passaggio alle vocali
        }
        // Se nella frase rimangono solo consonanti da indovinare, forza la modalità consonante
        else if (remainingConsonants.size > 0 && remainingVowels.size === 0) {
            selectionMode = 'consonant';
        }
        
        updateSelectionGuide();
        return { vowels: remainingVowels, consonants: remainingConsonants };
    };
    
    // Aggiorna lo stato della tastiera in base alla modalità di selezione
    const updateKeyboardState = () => {
        const keys = document.querySelectorAll('.key');
        const remaining = checkRemainingLetters();
        
        keys.forEach(key => {
            const letter = key.dataset.letter;
            
            // Se il gioco non è ancora iniziato, disabilita tutti i tasti
            if (!gameStarted) {
                key.disabled = true;
                key.style.opacity = '0.3';
                return;
            }
            
            // Se il tasto è già stato usato, nascondilo
            if (key.classList.contains('used')) {
                key.style.display = 'none';
                return;
            }
            
            // Se nella frase rimangono solo vocali da indovinare, mostra solo quelle vocali
            if (remaining.vowels.size > 0 && remaining.consonants.size === 0) {
                const isRemainingVowel = remaining.vowels.has(letter);
                key.disabled = !isRemainingVowel;
                key.style.opacity = isRemainingVowel ? '1' : '0.3';
                if (!isRemainingVowel) {
                    key.style.display = 'none';
                }
            }
            // Se nella frase rimangono solo consonanti da indovinare, mostra solo quelle consonanti
            else if (remaining.consonants.size > 0 && remaining.vowels.size === 0) {
                const isRemainingConsonant = remaining.consonants.has(letter);
                key.disabled = !isRemainingConsonant;
                key.style.opacity = isRemainingConsonant ? '1' : '0.3';
                if (!isRemainingConsonant) {
                    key.style.display = 'none';
                }
            }
            // Altrimenti, segui la modalità normale
            else {
                if (selectionMode === 'consonant') {
                    key.disabled = vowels.includes(letter);
                    key.style.opacity = vowels.includes(letter) ? '0.3' : '1';
                } else { // vowel mode
                    key.disabled = consonants.includes(letter);
                    key.style.opacity = consonants.includes(letter) ? '0.3' : '1';
                }
            }
        });
    };
    
    // Funzione per rivelare tutte le lettere immediatamente
    const revealAllLetters = () => {
        const letterBoxes = document.querySelectorAll('.letter-box');
        letterBoxes.forEach(box => {
            if (!box.classList.contains('revealed') && !box.classList.contains('space')) {
                box.textContent = box.dataset.char;
                box.classList.add('revealed');
                lettersRevealed++;
            }
        });
        
        // Disabilita tutti i tasti della tastiera
        const keys = document.querySelectorAll('.key');
        keys.forEach(key => {
            key.style.display = 'none';
        });
        
        // Nascondi il testo guida
        selectionGuide.style.display = 'none';
        
        // Celebra la vittoria dopo un breve ritardo
        setTimeout(() => {
            celebrateWin();
        }, 500);
    };
    
    // Inizializza il gioco
    const initGame = () => {
        setupSounds();
        createPhraseBoxes();
        createKeyboard();
        
        // Aggiungi il testo guida prima della tastiera
        const main = document.querySelector('main');
        main.insertBefore(selectionGuide, keyboard);
        
        // Nascondi il testo guida finché il gioco non inizia
        selectionGuide.style.display = 'none';
        
        // Inizializza lo stato della tastiera (disabilitata all'inizio)
        updateKeyboardState();
        
        // Aggiungi l'evento per rivelare tutte le lettere quando si tiene premuto il titolo
        const title = document.querySelector('header h1');
        let pressTimer;
        
        title.addEventListener('mousedown', () => {
            pressTimer = setTimeout(() => {
                if (gameStarted) {
                    revealAllLetters();
                }
            }, 1000); // Rivela dopo 1 secondo di pressione
        });
        
        title.addEventListener('mouseup', () => {
            clearTimeout(pressTimer);
        });
        
        title.addEventListener('mouseleave', () => {
            clearTimeout(pressTimer);
        });
        
        // Gestisci il pulsante di avvio della musica
        startMusicBtn.addEventListener('click', () => {
            // Avvia la musica
            startBackgroundMusic();
            
            // Nascondi il pulsante
            startMusicBtn.style.display = 'none';
            
            // Riproduci un suono per confermare l'avvio
            playSound(correctSound);
            
            // Imposta il flag di gioco iniziato
            gameStarted = true;
            
            // Mostra il testo guida
            selectionGuide.style.display = 'block';
            
            // Aggiorna il testo guida e lo stato della tastiera
            updateSelectionGuide();
            updateKeyboardState();
        });
    };
    
    // Avvia la musica di sottofondo
    const startBackgroundMusic = () => {
        // Crea un nuovo AudioContext per sbloccare l'audio
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Aggiorna il testo del pulsante
        startMusicBtn.textContent = "Caricamento musica...";
        startMusicBtn.disabled = true;
        
        // Aggiungi un messaggio di log per confermare l'utilizzo del file locale
        console.log('Tentativo di riproduzione del file audio locale: "The Price is Right, Extended Theme.mp3"');
        
        // Funzione per provare il prossimo URL in caso di errore
        const tryNextMusicUrl = () => {
            currentMusicIndex = (currentMusicIndex + 1) % musicUrls.length;
            backgroundMusic = new Audio(musicUrls[currentMusicIndex]);
            backgroundMusic.loop = true;
            backgroundMusic.volume = 0.3;
            
            console.log(`Tentativo con URL alternativo: ${musicUrls[currentMusicIndex]}`);
            startMusicBtn.textContent = `Tentativo ${currentMusicIndex + 1}/${musicUrls.length}...`;
            
            // Aggiungi un event listener per gestire gli errori di caricamento
            backgroundMusic.addEventListener('error', function(e) {
                console.log(`Errore di caricamento per URL ${currentMusicIndex}:`, e);
                
                // Se abbiamo provato tutti gli URL, creiamo un suono di fallback
                if ((currentMusicIndex + 1) % musicUrls.length === 0) {
                    console.log('Tutti gli URL sono stati provati senza successo, utilizzo AudioContext');
                    createFallbackMusic();
                    startMusicBtn.textContent = "Musica generata localmente";
                    startMusicBtn.disabled = true;
                    startMusicBtn.style.display = 'none';
                } else {
                    // Prova con il prossimo URL
                    setTimeout(tryNextMusicUrl, 500);
                }
            });
            
            // Aggiungi un event listener per quando la musica è pronta
            backgroundMusic.addEventListener('canplaythrough', function() {
                console.log(`Musica pronta da URL ${currentMusicIndex}`);
                startMusicBtn.textContent = "Musica pronta!";
                startMusicBtn.disabled = true;
                startMusicBtn.style.display = 'none';
            });
            
            backgroundMusic.play().catch(err => {
                console.log(`Errore di riproduzione per URL ${currentMusicIndex}:`, err);
                
                // Se abbiamo provato tutti gli URL, creiamo un suono di fallback
                if ((currentMusicIndex + 1) % musicUrls.length === 0) {
                    console.log('Tutti gli URL sono stati provati senza successo, utilizzo AudioContext');
                    createFallbackMusic();
                    startMusicBtn.textContent = "Musica generata localmente";
                    startMusicBtn.disabled = true;
                    startMusicBtn.style.display = 'none';
                } else {
                    // Prova con il prossimo URL
                    setTimeout(tryNextMusicUrl, 500);
                }
            });
        };
        
        // Crea musica di fallback utilizzando l'API Web Audio
        const createFallbackMusic = () => {
            console.log('Creazione musica di fallback con Web Audio API');
            
            // Crea un oscillatore per la musica di sottofondo
            let isPlaying = true;
            let currentNote = 0;
            let currentBar = 0;
            
            // Sequenza di note per la musica di sottofondo (melodia allegra in Do maggiore)
            const melodyBars = [
                // Prima battuta
                [
                    { freq: 523.25, duration: 0.2 }, // C5
                    { freq: 587.33, duration: 0.2 }, // D5
                    { freq: 659.25, duration: 0.2 }, // E5
                    { freq: 698.46, duration: 0.2 }  // F5
                ],
                // Seconda battuta
                [
                    { freq: 783.99, duration: 0.4 }, // G5
                    { freq: 783.99, duration: 0.2 }, // G5
                    { freq: 880.00, duration: 0.2 }  // A5
                ],
                // Terza battuta
                [
                    { freq: 783.99, duration: 0.4 }, // G5
                    { freq: 659.25, duration: 0.2 }, // E5
                    { freq: 523.25, duration: 0.2 }  // C5
                ],
                // Quarta battuta
                [
                    { freq: 659.25, duration: 0.4 }, // E5
                    { freq: 587.33, duration: 0.2 }, // D5
                    { freq: 523.25, duration: 0.2 }  // C5
                ]
            ];
            
            // Funzione per suonare una nota
            const playNote = () => {
                if (!isPlaying) return;
                
                const currentMelody = melodyBars[currentBar];
                const note = currentMelody[currentNote];
                
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                // Utilizziamo un'onda quadra per un suono più "8-bit" stile videogioco
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(note.freq, audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.05);
                gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + note.duration - 0.05);
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.start();
                oscillator.stop(audioContext.currentTime + note.duration);
                
                // Passa alla nota successiva
                currentNote = (currentNote + 1) % currentMelody.length;
                
                // Se abbiamo finito la battuta corrente, passa alla prossima
                if (currentNote === 0) {
                    currentBar = (currentBar + 1) % melodyBars.length;
                }
                
                // Programma la prossima nota
                setTimeout(playNote, note.duration * 1000);
            };
            
            // Inizia a suonare
            playNote();
            
            // Sostituisci la funzione play della musica di sottofondo
            backgroundMusic.play = function() {
                console.log('Riprendo la musica di fallback');
                isPlaying = true;
                playNote();
                return Promise.resolve();
            };
            
            backgroundMusic.pause = function() {
                console.log('Metto in pausa la musica di fallback');
                isPlaying = false;
                return Promise.resolve();
            };
        };
        
        // Aggiungi event listener per il primo tentativo
        backgroundMusic.addEventListener('canplaythrough', function() {
            console.log('Musica pronta al primo tentativo');
            startMusicBtn.textContent = "Musica pronta!";
            startMusicBtn.disabled = true;
            startMusicBtn.style.display = 'none';
        });
        
        backgroundMusic.addEventListener('error', function(e) {
            console.log('Errore di caricamento al primo tentativo:', e);
            startMusicBtn.textContent = "Errore, tentativo alternativo...";
            
            // Prova con un URL alternativo
            setTimeout(tryNextMusicUrl, 500);
        });
        
        // Riproduci la musica di sottofondo
        backgroundMusic.play().catch(e => {
            console.log('Errore nella riproduzione della musica:', e);
            startMusicBtn.textContent = "Errore, tentativo alternativo...";
            
            // Prova con un URL alternativo
            setTimeout(tryNextMusicUrl, 500);
        });
    };
    
    // Crea i box per ogni carattere della frase
    const createPhraseBoxes = () => {
        phraseContainer.innerHTML = '';
        
        // Dividi la frase in parole
        const words = phrase.split(' ');
        
        // Per ogni parola, crea un contenitore
        words.forEach((word, wordIndex) => {
            const wordContainer = document.createElement('div');
            wordContainer.classList.add('word-container');
            
            // Per ogni carattere nella parola, crea un box
            for (let i = 0; i < word.length; i++) {
                const char = word[i];
                const letterBox = document.createElement('div');
                
                letterBox.classList.add('letter-box');
                letterBox.dataset.char = char.toLowerCase();
                letterBox.dataset.normalizedChar = normalizeChar(char);
                totalLettersToReveal++;
                
                wordContainer.appendChild(letterBox);
            }
            
            phraseContainer.appendChild(wordContainer);
            
            // Aggiungi uno spazio dopo ogni parola tranne l'ultima
            if (wordIndex < words.length - 1) {
                const spaceBox = document.createElement('div');
                spaceBox.classList.add('letter-box', 'space');
                phraseContainer.appendChild(spaceBox);
            }
        });
    };
    
    // Crea la tastiera virtuale
    const createKeyboard = () => {
        keyboard.innerHTML = '';
        // Alfabeto italiano (senza j, k, w, x, y)
        const letters = 'abcdefghilmnopqrstuvz';
        
        for (let i = 0; i < letters.length; i++) {
            const letter = letters[i];
            const key = document.createElement('button');
            key.classList.add('key');
            key.textContent = letter;
            key.dataset.letter = letter;
            
            key.addEventListener('click', () => handleKeyClick(key, letter));
            
            keyboard.appendChild(key);
        }
    };
    
    // Gestisce il click su un tasto della tastiera
    const handleKeyClick = (key, letter) => {
        // Se il tasto è già stato usato o è disabilitato, non fare nulla
        if (key.classList.contains('used') || key.disabled) {
            return;
        }
        
        // Segna il tasto come usato
        key.classList.add('used');
        
        // Controlla se la lettera è presente nella frase
        const letterBoxes = document.querySelectorAll('.letter-box');
        let letterFound = false;
        let matchingBoxes = [];
        
        letterBoxes.forEach(box => {
            if (box.dataset.normalizedChar === letter) {
                letterFound = true;
                matchingBoxes.push(box);
            }
        });
        
        // Controlla se rimangono solo vocali o solo consonanti prima di procedere
        const remaining = checkRemainingLetters();
        const onlyVowelsRemain = remaining.vowels.size > 0 && remaining.consonants.size === 0;
        const onlyConsonantsRemain = remaining.consonants.size > 0 && remaining.vowels.size === 0;
        
        if (letterFound) {
            // La lettera è presente nella frase
            key.classList.add('correct');
            
            // Riduci il volume del suono corretto
            const originalVolume = correctSound.volume;
            if (originalVolume !== undefined) {
                correctSound.volume = originalVolume * 0.5;
            }
            
            playSound(correctSound);
            
            // Ripristina il volume originale
            if (originalVolume !== undefined) {
                correctSound.volume = originalVolume;
            }
            
            // Aggiorna il contatore di consonanti corrette consecutive se necessario
            // Solo se non siamo in una situazione speciale (solo vocali o solo consonanti)
            if (!onlyVowelsRemain && !onlyConsonantsRemain) {
                if (selectionMode === 'consonant' && consonants.includes(letter)) {
                    correctConsonantsInARow++;
                    consonantsSelected++;
                }
            }
            
            // Rivela le lettere una alla volta con un ritardo
            revealLetters(matchingBoxes);
        } else {
            // La lettera non è presente nella frase
            key.classList.add('wrong');
            
            // Riduci il volume del suono sbagliato
            const originalVolume = wrongSound.volume;
            if (originalVolume !== undefined) {
                wrongSound.volume = originalVolume * 0.5;
            }
            
            showWrongAnimation();
            
            // Ripristina il volume originale
            if (originalVolume !== undefined) {
                wrongSound.volume = originalVolume;
            }
            
            // Se siamo in modalità consonante e la lettera è una consonante
            // Solo se non siamo in una situazione speciale (solo vocali o solo consonanti)
            if (!onlyVowelsRemain && !onlyConsonantsRemain) {
                if (selectionMode === 'consonant' && consonants.includes(letter)) {
                    // Se abbiamo già indovinato 2 consonanti, non resettare il conteggio
                    if (correctConsonantsInARow < 2) {
                        correctConsonantsInARow = 0;
                    }
                }
            }
        }
        
        // Cambia la modalità di selezione se necessario
        // Solo se non siamo in una situazione speciale (solo vocali o solo consonanti)
        if (!onlyVowelsRemain && !onlyConsonantsRemain) {
            if ((selectionMode === 'consonant' && correctConsonantsInARow >= maxConsonantsBeforeVowel) || 
                selectionMode === 'vowel') {
                toggleSelectionMode();
            }
        }
        
        // Aggiorna sempre la guida e lo stato della tastiera
        updateSelectionGuide();
        updateKeyboardState();
    };
    
    // Rivela le lettere una alla volta con un ritardo
    const revealLetters = (boxes) => {
        // Creiamo più istanze del suono per evitare sovrapposizioni
        const sounds = boxes.map(() => new Audio('assets/audio/Mario Coin Sound - Sound Effect (HD).mp3'));
        
        boxes.forEach((box, index) => {
            setTimeout(() => {
                box.textContent = box.dataset.char;
                box.classList.add('revealed');
                
                // Utilizziamo un'istanza separata del suono per ogni lettera
                try {
                    sounds[index].play();
                } catch (e) {
                    console.log('Errore nella riproduzione del suono di rivelazione:', e);
                }
                
                lettersRevealed++;
                
                // Controlla se tutte le lettere sono state rivelate
                if (lettersRevealed === totalLettersToReveal) {
                    // Nascondi il testo guida quando tutte le lettere sono state rivelate
                    selectionGuide.style.display = 'none';
                    
                    setTimeout(() => {
                        celebrateWin();
                    }, 1000);
                }
                
                // Aggiorna lo stato della tastiera dopo ogni lettera rivelata
                // per mostrare solo le lettere rimanenti
                updateKeyboardState();
            }, index * 1000); // 1 secondo di ritardo tra ogni lettera
        });
    };
    
    // Mostra l'animazione per la risposta sbagliata
    const showWrongAnimation = () => {
        // Riduci il volume del suono sbagliato
        const originalVolume = wrongSound.volume;
        if (originalVolume !== undefined) {
            wrongSound.volume = originalVolume * 0.5;
        }
        
        playSound(wrongSound);
        
        // Ripristina il volume originale
        if (originalVolume !== undefined) {
            wrongSound.volume = originalVolume;
        }
        
        // Metti in pausa la musica di sottofondo
        backgroundMusic.pause();
        
        // Mostra la X
        wrongAnswer.style.opacity = '1';
        
        // Nascondi la X dopo l'animazione
        setTimeout(() => {
            wrongAnswer.style.opacity = '0';
            
            // Mostra la modale
            showModal();
        }, 1000);
    };
    
    // Mostra la modale di punizione
    const showModal = () => {
        modal.classList.add('active');
        overlay.classList.add('active');
    };
    
    // Nasconde la modale
    const hideModal = () => {
        modal.classList.remove('active');
        overlay.classList.remove('active');
        
        // Riprendi la musica di sottofondo
        backgroundMusic.play().catch(e => console.log('Errore nella riproduzione della musica:', e));
    };
    
    // Crea confetti
    const createConfetti = () => {
        confettiContainer.innerHTML = '';
        
        const colors = ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f', '#ff5722', '#e91e63', '#9c27b0'];
        
        // Crea 100 confetti
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            
            // Posizione casuale
            const left = Math.random() * 100;
            const delay = Math.random() * 5;
            const duration = 3 + Math.random() * 2;
            
            // Stile casuale
            confetti.style.left = `${left}%`;
            confetti.style.width = `${5 + Math.random() * 10}px`;
            confetti.style.height = `${5 + Math.random() * 10}px`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = `${delay}s`;
            confetti.style.animationDuration = `${duration}s`;
            
            // Forma casuale
            if (Math.random() > 0.5) {
                confetti.style.borderRadius = '50%';
            } else {
                confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            }
            
            confettiContainer.appendChild(confetti);
        }
    };
    
    // Celebra la vittoria
    const celebrateWin = () => {
        // Nascondi il testo guida
        selectionGuide.style.display = 'none';
        
        // Invece di mettere in pausa la musica, aumenta il volume al 100%
        backgroundMusic.volume = 0.8;
        
        // Riproduci il suono di vittoria
        playSound(winSound);
        
        // Crea confetti
        createConfetti();
        
        // Crea un overlay per il messaggio di vittoria
        const winOverlay = document.createElement('div');
        winOverlay.style.position = 'fixed';
        winOverlay.style.top = '0';
        winOverlay.style.left = '0';
        winOverlay.style.width = '100%';
        winOverlay.style.height = '100%';
        winOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        winOverlay.style.display = 'flex';
        winOverlay.style.justifyContent = 'center';
        winOverlay.style.alignItems = 'center';
        winOverlay.style.zIndex = '29';
        
        // Implementazione della celebrazione della vittoria
        const winMessage = document.createElement('div');
        winMessage.classList.add('win-message');
        
        // Aggiungi il pulsante X per chiudere
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.style.position = 'absolute';
        closeButton.style.right = '20px';
        closeButton.style.top = '20px';
        closeButton.style.background = 'none';
        closeButton.style.border = 'none';
        closeButton.style.color = 'white';
        closeButton.style.fontSize = '3rem';
        closeButton.style.cursor = 'pointer';
        closeButton.style.padding = '0';
        closeButton.style.lineHeight = '1';
        
        closeButton.addEventListener('click', () => {
            document.body.removeChild(winOverlay);
        });
        
        winMessage.innerHTML = '<h2><i class="fas fa-trophy"></i> Complimenti Manuela! <i class="fas fa-trophy"></i></h2><p>Hai indovinato la frase!</p>';
        
        // Stile per posizionamento e aspetto
        Object.assign(winMessage.style, {
            backgroundColor: 'var(--color-green)',
            color: 'var(--color-white)',
            padding: '70px',
            borderRadius: '30px',
            textAlign: 'center',
            zIndex: '30',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
            animation: 'popIn 0.5s ease forwards',
            width: '90%',
            maxWidth: '1000px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative' // Per il posizionamento del pulsante X
        });
        
        // Stili per il titolo e il testo
        const h2 = winMessage.querySelector('h2');
        Object.assign(h2.style, {
            fontSize: '2.75rem', // Ridotto da 5.5rem
            marginBottom: '40px',
            width: '100%',
            textAlign: 'center'
        });
        
        const p = winMessage.querySelector('p');
        Object.assign(p.style, {
            fontSize: '3.5rem',
            width: '100%',
            textAlign: 'center'
        });
        
        // Aggiungi il pulsante X al messaggio
        winMessage.appendChild(closeButton);
        
        // Aggiungi il messaggio all'overlay e l'overlay al body
        winOverlay.appendChild(winMessage);
        document.body.appendChild(winOverlay);
    };
    
    // Riproduce un suono
    const playSound = (sound) => {
        try {
            sound.play();
        } catch (e) {
            console.log('Errore nella riproduzione del suono:', e);
        }
    };
    
    // Event listeners
    closeModalBtn.addEventListener('click', hideModal);
    
    // Inizializza il gioco
    initGame();
}); 