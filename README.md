# Gioco dell'Impiccato Modificato

Un gioco simile all'impiccato ma con alcune differenze. In questa variante non ci sono tentativi limitati, l'utente può provare tutte le lettere che vuole.

## Come Giocare

1. Apri `index.html` nel tuo browser
2. Clicca sulle lettere nella tastiera virtuale per indovinare la frase
3. Se selezioni una lettera che non è presente nella frase, dovrai cantare una canzone come punizione!
4. Continua a indovinare fino a rivelare l'intera frase

## Suoni

I suoni del gioco sono generati direttamente nel JavaScript utilizzando l'API Web Audio. Non è necessario scaricare file audio esterni.

## Personalizzazione

Puoi modificare la frase da indovinare cambiando il valore della variabile `phrase` nel file `script.js`.

```javascript
// Frase da indovinare (modificabile)
const phrase = "La vita è bella anche quando piove";
```

Puoi anche personalizzare i suoni modificando le funzioni `createCorrectSound`, `createWrongSound` e `createRevealSound` nel file `script.js`.

## Tecnologie Utilizzate

- HTML5
- CSS3
- JavaScript (ES6+)
- Web Audio API
- Font Awesome per le icone 