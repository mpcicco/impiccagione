document.addEventListener('DOMContentLoaded', () => {
    // Elementi DOM
    const phraseContainer = document.querySelector('.phrase-container');
    const keyboard = document.querySelector('.keyboard');
    const wrongAnswer = document.querySelector('.wrong-answer');
    const modal = document.querySelector('.modal');
    const overlay = document.querySelector('.overlay');
    const closeModalBtn = document.querySelector('.close-modal');
    
    // Crea suoni direttamente nel JavaScript
    const correctSound = new Audio();
    const wrongSound = new Audio();
    const letterRevealSound = new Audio();
    
    // Imposta i suoni utilizzando AudioContext
    const setupSounds = () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Suono corretto (beep acuto)
        const createCorrectSound = () => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // La nota A5
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
        };
        
        // Suono sbagliato (beep grave)
        const createWrongSound = () => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // La nota A3
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
        };
        
        // Suono rivelazione lettera (pop)
        const createRevealSound = () => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.02);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
        };
        
        // Sostituisci le funzioni di riproduzione
        correctSound.play = createCorrectSound;
        wrongSound.play = createWrongSound;
        letterRevealSound.play = createRevealSound;
    };
    
    // Frase da indovinare (modificabile)
    const phrase = "Diao ti amo tanto";
    
    // Stato del gioco
    let lettersRevealed = 0;
    let totalLettersToReveal = 0;
    
    // Funzione per normalizzare le lettere (rimuovere accenti)
    const normalizeChar = (char) => {
        return char.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };
    
    // Inizializza il gioco
    const initGame = () => {
        setupSounds();
        createPhraseBoxes();
        createKeyboard();
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
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        
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
        // Se il tasto è già stato usato, non fare nulla
        if (key.classList.contains('used')) {
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
        
        if (letterFound) {
            // La lettera è presente nella frase
            key.classList.add('correct');
            playSound(correctSound);
            
            // Rivela le lettere una alla volta con un ritardo
            revealLetters(matchingBoxes);
        } else {
            // La lettera non è presente nella frase
            key.classList.add('wrong');
            showWrongAnimation();
        }
    };
    
    // Rivela le lettere una alla volta con un ritardo
    const revealLetters = (boxes) => {
        boxes.forEach((box, index) => {
            setTimeout(() => {
                box.textContent = box.dataset.char;
                box.classList.add('revealed');
                playSound(letterRevealSound);
                
                lettersRevealed++;
                
                // Controlla se tutte le lettere sono state rivelate
                if (lettersRevealed === totalLettersToReveal) {
                    setTimeout(() => {
                        celebrateWin();
                    }, 1000);
                }
            }, index * 1000); // 1 secondo di ritardo tra ogni lettera
        });
    };
    
    // Mostra l'animazione per la risposta sbagliata
    const showWrongAnimation = () => {
        playSound(wrongSound);
        
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
    };
    
    // Celebra la vittoria
    const celebrateWin = () => {
        // Implementazione della celebrazione della vittoria
        const winMessage = document.createElement('div');
        winMessage.classList.add('win-message');
        winMessage.innerHTML = '<h2><i class="fas fa-trophy"></i> Complimenti! <i class="fas fa-trophy"></i></h2><p>Hai indovinato la frase!</p>';
        winMessage.style.position = 'fixed';
        winMessage.style.top = '50%';
        winMessage.style.left = '50%';
        winMessage.style.transform = 'translate(-50%, -50%)';
        winMessage.style.backgroundColor = 'var(--color-green)';
        winMessage.style.color = 'var(--color-white)';
        winMessage.style.padding = '70px';
        winMessage.style.borderRadius = '30px';
        winMessage.style.textAlign = 'center';
        winMessage.style.zIndex = '30';
        winMessage.style.boxShadow = '0 25px 60px rgba(0, 0, 0, 0.5)';
        winMessage.style.animation = 'popIn 0.5s ease forwards';
        winMessage.style.width = '90%';
        winMessage.style.maxWidth = '1000px';
        
        // Stili per il titolo e il testo
        const h2 = winMessage.querySelector('h2');
        h2.style.fontSize = '5.5rem';
        h2.style.marginBottom = '40px';
        
        const p = winMessage.querySelector('p');
        p.style.fontSize = '3.5rem';
        
        document.body.appendChild(winMessage);
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