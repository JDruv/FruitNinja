# 🍉 Druvnja - Fruit Ninja Clone

Benvenuto in **Druvnja**, un emozionante minigioco web ispirato al classico "Fruit Ninja". Affetta la frutta al volo, evita le bombe esplosive e punta a stabilire il nuovo record! Sviluppato interamente con tecnologie web standard (HTML5 Canvas e JavaScript).

## 🎮 Modalità di Gioco

Il gioco offre due diverse sfide per mettere alla prova i tuoi riflessi:

1.  **Modalità Normale:** L'esperienza classica. Taglia più frutta possibile, evita di farla cadere intatta e non toccare le bombe. La difficoltà aumenta gradualmente.
2.  **Modalità Estrema:** Per i veri ninja! Le bombe sono più frequenti, la frutta si muove più velocemente, le traiettorie sono più imprevedibili e i movimenti sono accelerati. La lama diventa di un rosso acceso per ricordarti il pericolo.

## ✨ Caratteristiche Principali

* **Gameplay Fluido:** Rendering a 60 FPS (dipendente dal dispositivo) grazie a `requestAnimationFrame` su HTML5 `<canvas>`.
* **Motore Fisico Personalizzato:** Calcolo in tempo reale di gravità, rotazione, parabole di lancio e impatto della lama sugli oggetti.
* **Sistema di Taglio Dinamico:** La direzione dello "swipe" determina l'angolo esatto in cui la frutta viene tagliata e l'inclinazione delle due metà che si separano.
* **Effetti Visivi:**
    * Scia della lama (personalizzata in base alla modalità).
    * Particelle colorate ("succo") al taglio della frutta.
    * Effetto "tremore dello schermo" (Screen Shake) quando si colpisce una bomba.
    * Testi fluttuanti per l'aumento del punteggio.
* **Punteggi Locali:** I tuoi record per entrambe le modalità vengono salvati automaticamente nel tuo browser tramite `localStorage` (non li perderai ricaricando la pagina!).
* **Supporto Touch:** Giocabile sia con il mouse su PC che con il tocco su smartphone e tablet.

## 🛠️ Tecnologie Utilizzate

* **HTML5:** Struttura della pagina e tag `<canvas>` per il rendering grafico.
* **CSS3:** (Presunto, per posizionare HUD e menu) Stile dell'interfaccia utente.
* **Vanilla JavaScript (ES6+):** Tutta la logica di gioco, la gestione della fisica (classi `OggettoVolante`, `Particella`), la gestione degli eventi di input (mouse/touch) e il loop di rendering.

## 🚀 Come Giocare (Installazione e Avvio)

Essendo un gioco basato su browser che non richiede server di backend, avviare il gioco è facilissimo:

1.  **Clona o scarica** questo repository sul tuo computer.
2.  Assicurati di avere una cartella chiamata `assets/` nella stessa directory del file HTML, contenente le immagini necessarie:
    * `fragola.png`
    * `mela.png`
    * `banana.png`
    * `bomba.png`
3.  Apri il file principale (es. `index.html`) con il tuo browser preferito (Chrome, Firefox, Safari, Edge).
4.  Seleziona la modalità e inizia ad affettare!

## 📜 Regole Base

* **Affetta la frutta:** Trascina il mouse (o il dito sullo schermo) attraverso i frutti per guadagnare punti.
* **Evita le cadute:** Hai 3 vite. Ogni frutto che cade fuori dallo schermo senza essere tagliato ti costa una vita.
* **NON tagliare le bombe:** Colpire una bomba causa il Game Over immediato, indipendentemente dalle vite rimaste.

---
*Progetto sviluppato come esercizio avanzato in JavaScript e HTML5 Canvas.*
