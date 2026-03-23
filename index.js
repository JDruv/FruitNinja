    const tela = document.getElementById("tela");
    const ctx = tela.getContext("2d");

    let LARGHEZZA = window.innerWidth, ALTEZZA = window.innerHeight;
    tela.width = LARGHEZZA; tela.height = ALTEZZA;
    window.addEventListener('resize', () => { LARGHEZZA = window.innerWidth; ALTEZZA = window.innerHeight; tela.width = LARGHEZZA; tela.height = ALTEZZA; });

    const menuPrincipale = document.getElementById("menu-principale");
    const menuGameOver = document.getElementById("menu-gameover");
    const hud = document.getElementById("hud");
    const hudPunteggio = document.getElementById("valore-punteggio");
    const hudVite = document.getElementById("valore-vite");
    const indicatoreModalita = document.getElementById("indicatore-modalita");
    const punteggioFinale = document.getElementById("punteggio-finale");
    const titoloGameOver = document.getElementById("titolo-gameover");
    
    const labelRecordNormale = document.getElementById("record-normale");
    const labelRecordEstrema = document.getElementById("record-estrema");

    let recordNormale = localStorage.getItem("druvnja_record_normale") || 0;
    let recordEstrema = localStorage.getItem("druvnja_record_estrema") || 0;
    labelRecordNormale.innerText = recordNormale;
    labelRecordEstrema.innerText = recordEstrema;

    const GRAVITA = 0.25; 
    let FORZA_LANCIO = Math.min(-13, -ALTEZZA / 65);

    const TIPI_OGGETTO = [
        { src: 'assets/fragola.png', tipo: 'frutto', coloreSchizzo: '#ff0033' },
        { src: 'assets/mela.png', tipo: 'frutto', coloreSchizzo: '#ccff00' },
        { src: 'assets/banana.png', tipo: 'frutto', coloreSchizzo: '#ffff00' },
        { src: 'assets/bomba.png', tipo: 'bomba', coloreSchizzo: '#444444' }
    ];

    TIPI_OGGETTO.forEach(obj => { obj.img = new Image(); obj.img.src = obj.src; });

    let statoGioco = "menu", modalitaAttuale = "normale";
    let cicloAnimazione, punteggio = 0, contatoreFrame = 0, vite = 3;
    let isClicking = false, swipePath = [], lastPoint = null;
    let entita = [], particelle = [], testiFluttuanti = [], tremoreSchermo = 0;

    class OggettoVolante {
        constructor(difficoltaExtra) {
            let probBombaBase = modalitaAttuale === "estrema" ? 0.25 : 0.15;
            let aumentoBomba = modalitaAttuale === "estrema" ? (difficoltaExtra * 0.05) : (difficoltaExtra * 0.01);
            let probFinaleBomba = Math.min(probBombaBase + aumentoBomba, modalitaAttuale === "estrema" ? 0.75 : 0.40);
            
            let isBomba = Math.random() < probFinaleBomba; 
            let arrayScelta = isBomba ? TIPI_OGGETTO.filter(o => o.tipo === 'bomba') : TIPI_OGGETTO.filter(o => o.tipo === 'frutto');
            this.dati = arrayScelta[Math.floor(Math.random() * arrayScelta.length)];
            
            this.raggioFrutto = 60; this.raggioBomba = 65; 
            this.raggioBase = this.dati.tipo === 'bomba' ? this.raggioBomba : this.raggioFrutto;
            
            this.raggioHitbox = this.raggioBase; 

            this.x = Math.random() * (LARGHEZZA - 400) + 200;
            this.y = ALTEZZA + this.raggioBase;
            
            this.velocitaX = (LARGHEZZA / 2 - this.x) * 0.015 + (Math.random() - 0.5) * 6;
            if (modalitaAttuale === "estrema") this.velocitaX *= 1.5; 
            
            let limiteVelocitaY = -Math.sqrt(2 * GRAVITA * (ALTEZZA - 150));
            
            let boostDifficolta = modalitaAttuale === "estrema" ? 0.6 : 0.3;
            let velocitaCalcolata = FORZA_LANCIO - (difficoltaExtra * boostDifficolta);

            this.velocitaY = Math.max(velocitaCalcolata, limiteVelocitaY) + (Math.random() - 0.5) * 2;

            this.rotazione = Math.random() * Math.PI * 2;
            let rotazioneBase = modalitaAttuale === "estrema" ? 0.3 : 0.15;
            this.velRotazione = (Math.random() - 0.5) * (rotazioneBase + difficoltaExtra * 0.02);

            this.tagliato = false; this.mancato = false; this.meta = []; 
        }

        aggiorna() {
            if (!this.tagliato) {
                this.velocitaY += GRAVITA; 
                this.x += this.velocitaX; 
                this.y += this.velocitaY; 
                this.rotazione += this.velRotazione;

                if (this.x - this.raggioHitbox < 0) {
                    this.x = this.raggioHitbox;
                    this.velocitaX *= -1; 
                } else if (this.x + this.raggioHitbox > LARGHEZZA) {
                    this.x = LARGHEZZA - this.raggioHitbox;
                    this.velocitaX *= -1; 
                }

            } else {
                for (let m of this.meta) { m.velocitaY += GRAVITA; m.x += m.velocitaX; m.y += m.velocitaY; m.rotazione += m.velRotazione; }
            }
        }

        disegna() {
            if (!this.dati.img.complete || this.dati.img.naturalWidth === 0) return;

            let proporzioneImg = this.dati.img.naturalWidth / this.dati.img.naturalHeight;
            let dimensioneW = this.raggioBase * 2.2;
            let dimensioneH = dimensioneW / proporzioneImg;
            this.raggioHitbox = Math.max(dimensioneW, dimensioneH) / 2 * 0.9;

            if (!this.tagliato) {
                ctx.save();
                ctx.translate(this.x, this.y); ctx.rotate(this.rotazione);
                let scala = this.dati.tipo === 'bomba' ? 1 + Math.sin(contatoreFrame * 0.2) * 0.05 : 1;
                if (this.dati.tipo === 'frutto' && this.velocitaY > 0 && this.y > ALTEZZA - 100) {
                    ctx.globalAlpha = 0.5 + Math.sin(contatoreFrame * 0.5) * 0.5;
                }
                ctx.scale(scala, scala);
                ctx.drawImage(this.dati.img, -dimensioneW / 2, -dimensioneH / 2, dimensioneW, dimensioneH);
                ctx.restore();
            } else {
                for (let m of this.meta) {
                    ctx.save();
                    ctx.translate(m.x, m.y); ctx.rotate(m.angoloTaglio);
                    ctx.beginPath();
                    if (m.lato === 1) ctx.rect(-this.raggioBase * 2, -this.raggioBase * 2, this.raggioBase * 4, this.raggioBase * 2);
                    else ctx.rect(-this.raggioBase * 2, 0, this.raggioBase * 4, this.raggioBase * 2);
                    ctx.clip();
                    ctx.rotate(-m.angoloTaglio); ctx.rotate(m.rotazione);
                    ctx.drawImage(this.dati.img, -dimensioneW / 2, -dimensioneH / 2, dimensioneW, dimensioneH);
                    ctx.restore();
                }
            }
        }

        controllaTaglio(p1, p2) {
            if(this.tagliato || !p1 || !p2) return false;
            let A = this.x - p1.x, B = this.y - p1.y, C = p2.x - p1.x, D = p2.y - p1.y;
            let dot = A * C + B * D, len_sq = C * C + D * D, param = -1;
            if (len_sq != 0) param = dot / len_sq;
            let xx = param < 0 ? p1.x : param > 1 ? p2.x : p1.x + param * C;
            let yy = param < 0 ? p1.y : param > 1 ? p2.y : p1.y + param * D;
            if (Math.sqrt((this.x - xx)**2 + (this.y - yy)**2) < this.raggioHitbox) {
                if(this.dati.tipo === 'bomba') esplosioneBomba(this.x, this.y);
                else this.eseguiTaglio(Math.atan2(p2.y - p1.y, p2.x - p1.x));
                return true;
            }
            return false;
        }

        eseguiTaglio(angoloTaglio) {
            this.tagliato = true;
            let spinta = modalitaAttuale === "estrema" ? 8 : 5; 
            this.meta = [
                { x: this.x, y: this.y, velocitaX: this.velocitaX + Math.cos(angoloTaglio - Math.PI/2) * spinta, velocitaY: this.velocitaY + Math.sin(angoloTaglio - Math.PI/2) * spinta, rotazione: this.rotazione, velRotazione: this.velRotazione + 0.2, lato: 1, angoloTaglio: angoloTaglio },
                { x: this.x, y: this.y, velocitaX: this.velocitaX + Math.cos(angoloTaglio + Math.PI/2) * spinta, velocitaY: this.velocitaY + Math.sin(angoloTaglio + Math.PI/2) * spinta, rotazione: this.rotazione, velRotazione: this.velRotazione - 0.2, lato: -1, angoloTaglio: angoloTaglio }
            ];
            punteggio++; hudPunteggio.innerText = punteggio;
            creaEsplosione(this.x, this.y, this.dati.coloreSchizzo, 40, angoloTaglio);
            testiFluttuanti.push(new TestoFluttuante("+1", this.x, this.y, "#ffcc00"));
        }
    }

    class Particella {
        constructor(x, y, colore, angoloBase) {
            this.x = x; this.y = y; this.colore = colore;
            let angolo = angoloBase + (Math.random() - 0.5) * 3, forza = Math.random() * 12 + 2;
            this.velocitaX = Math.cos(angolo) * forza; this.velocitaY = Math.sin(angolo) * forza;
            this.vita = 1.0; this.dimensione = Math.random() * 10 + 4; 
        }
        aggiorna() { this.velocitaY += 0.3; this.x += this.velocitaX; this.y += this.velocitaY; this.vita -= 0.025; }
        disegna() { ctx.globalAlpha = Math.max(0, this.vita); ctx.fillStyle = this.colore; ctx.beginPath(); ctx.arc(this.x, this.y, this.dimensione/2, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1.0; }
    }

    class TestoFluttuante {
        constructor(testo, x, y, colore) { this.testo = testo; this.x = x; this.y = y; this.colore = colore; this.vita = 1.0; }
        aggiorna() { this.y -= 2.5; this.vita -= 0.035; }
        disegna() { ctx.globalAlpha = Math.max(0, this.vita); ctx.fillStyle = this.colore; ctx.font = "bold 50px Arial"; ctx.fillText(this.testo, this.x - 25, this.y); ctx.globalAlpha = 1.0; }
    }

    function inizioSwipe(e) { isClicking = true; swipePath = []; lastPoint = null; }
    function fineSwipe() { isClicking = false; }
    tela.addEventListener('mousedown', inizioSwipe); tela.addEventListener('mouseup', fineSwipe); tela.addEventListener('mouseleave', fineSwipe);
    tela.addEventListener('touchstart', (e) => { e.preventDefault(); inizioSwipe(); }, {passive: false}); tela.addEventListener('touchend', fineSwipe);
    function gestisciMovimento(clientX, clientY) {
        if (!isClicking || statoGioco !== "giocando") return;
        let currentPoint = { x: clientX, y: clientY, time: Date.now() }; swipePath.push(currentPoint);
        if (lastPoint) for (let e of entita) e.controllaTaglio(lastPoint, currentPoint);
        lastPoint = currentPoint;
    }
    tela.addEventListener('mousemove', (e) => gestisciMovimento(e.clientX, e.clientY));
    tela.addEventListener('touchmove', (e) => gestisciMovimento(e.touches[0].clientX, e.touches[0].clientY), {passive: false});

    function creaEsplosione(x, y, colore, quantita, angoloTaglio) { for (let i = 0; i < quantita; i++) particelle.push(new Particella(x, y, colore, angoloTaglio)); }
    function aggiornaUIVite() { hudVite.innerText = "❤️".repeat(vite); }

    function salvaRecord() {
        if (modalitaAttuale === "normale" && punteggio > recordNormale) {
            recordNormale = punteggio; localStorage.setItem("druvnja_record_normale", recordNormale); labelRecordNormale.innerText = recordNormale;
        } else if (modalitaAttuale === "estrema" && punteggio > recordEstrema) {
            recordEstrema = punteggio; localStorage.setItem("druvnja_record_estrema", recordEstrema); labelRecordEstrema.innerText = recordEstrema;
        }
    }

    function esplosioneBomba(x, y) {
        statoGioco = "esplosione"; tremoreSchermo = modalitaAttuale === "estrema" ? 60 : 40; vite = 0; aggiornaUIVite();
        creaEsplosione(x, y, "#ff3300", 60, Math.PI*2); creaEsplosione(x, y, "#ffff00", 60, Math.PI*2);
        titoloGameOver.innerText = "KABOOM!"; titoloGameOver.style.color = "#ff0000";
        salvaRecord();
        setTimeout(() => { statoGioco = "gameover"; punteggioFinale.innerText = punteggio; menuGameOver.classList.remove("nascosto"); hud.classList.add("nascosto"); }, 1800);
    }

    function decrementaVita() {
        vite--; aggiornaUIVite();
        if (vite <= 0) gameOverNormale();
    }

    function gameOverNormale() {
        statoGioco = "gameover"; salvaRecord();
        punteggioFinale.innerText = punteggio; titoloGameOver.innerText = "Sconfitta!"; titoloGameOver.style.color = "#ff3333";
        setTimeout(() => { menuGameOver.classList.remove("nascosto"); hud.classList.add("nascosto"); }, 800);
    }

    function resetMenu() {
        menuGameOver.classList.add("nascosto");
        menuPrincipale.classList.remove("nascosto");
        hud.classList.add("nascosto");
        disegnaSfondoVuoto();
    }

    function avviaPartita(modalitaScelta) {
        modalitaAttuale = modalitaScelta;
        indicatoreModalita.innerText = modalitaAttuale === "estrema" ? "(ESTREMA)" : "";
        
        entita = []; particelle = []; testiFluttuanti = []; punteggio = 0; contatoreFrame = 0; tremoreSchermo = 0; vite = 3;
        FORZA_LANCIO = Math.min(-13, -ALTEZZA / 65); hudPunteggio.innerText = punteggio; aggiornaUIVite();
        menuPrincipale.classList.add("nascosto"); menuGameOver.classList.add("nascosto"); hud.classList.remove("nascosto");
        statoGioco = "giocando";
        if(cicloAnimazione) cancelAnimationFrame(cicloAnimazione); cicloGioco();
    }

    function disegnaSfondoVuoto() {
        let grad = ctx.createRadialGradient(LARGHEZZA/2, ALTEZZA/2, LARGHEZZA/8, LARGHEZZA/2, ALTEZZA/2, LARGHEZZA);
        if (modalitaAttuale === "estrema" && statoGioco === "giocando") {
            grad.addColorStop(0, '#4a0000'); grad.addColorStop(1, '#050000');
        } else {
            grad.addColorStop(0, '#3a1505'); grad.addColorStop(1, '#0a0000');
        }
        ctx.fillStyle = grad; ctx.fillRect(0, 0, LARGHEZZA, ALTEZZA);
    }

    function cicloGioco() {
        if (statoGioco !== "giocando" && statoGioco !== "esplosione") return;
        contatoreFrame++;

        disegnaSfondoVuoto();

        ctx.save();
        if (tremoreSchermo > 0) { ctx.translate((Math.random() - 0.5) * tremoreSchermo, (Math.random() - 0.5) * tremoreSchermo); tremoreSchermo *= 0.92; }

        if (statoGioco === "giocando") {
            let moltiplicatoreDifficolta = Math.floor(punteggio / (modalitaAttuale === "estrema" ? 5 : 10));
            let frequenzaMinima = modalitaAttuale === "estrema" ? 10 : 20;
            let stepFrequenza = modalitaAttuale === "estrema" ? 8 : 5;
            let frequenza = Math.max(frequenzaMinima, 60 - (moltiplicatoreDifficolta * stepFrequenza));
            
            if (contatoreFrame % frequenza === 0) entita.push(new OggettoVolante(moltiplicatoreDifficolta));

            let colorLama = modalitaAttuale === "estrema" ? "#ff0044" : "#00ffcc";
            ctx.strokeStyle = colorLama; ctx.shadowBlur = 25; ctx.shadowColor = colorLama;
            ctx.lineWidth = 8; ctx.lineJoin = "round"; ctx.lineCap = "round"; 
            ctx.beginPath();
            let now = Date.now(), tracciaVisible = false;
            for (let i = 1; i < swipePath.length; i++) {
                if (now - swipePath[i].time < 130) { 
                    if (!tracciaVisible || now - swipePath[i-1].time >= 130) ctx.moveTo(swipePath[i].x, swipePath[i].y);
                    else ctx.lineTo(swipePath[i].x, swipePath[i].y);
                    tracciaVisible = true;
                }
            }
            ctx.stroke(); ctx.shadowBlur = 0;
            swipePath = swipePath.filter(p => now - p.time < 130);
        }

        for (let i = entita.length - 1; i >= 0; i--) {
            let e = entita[i]; e.aggiorna(); e.disegna();
            
            if (statoGioco === "giocando" && !e.tagliato && e.dati.tipo === 'frutto' && e.y > ALTEZZA + e.raggioBase) {
                if (!e.mancato) { e.mancato = true; decrementaVita(); }
            }

            if (!e.tagliato && e.y > ALTEZZA + 200) entita.splice(i, 1);
            else if(e.tagliato && e.meta.every(m => m.y > ALTEZZA + 200)) entita.splice(i, 1);
        }
        
        for (let i = particelle.length - 1; i >= 0; i--) { particelle[i].aggiorna(); particelle[i].disegna(); if (particelle[i].vita <= 0) particelle.splice(i, 1); }
        for (let i = testiFluttuanti.length - 1; i >= 0; i--) { testiFluttuanti[i].aggiorna(); testiFluttuanti[i].disegna(); if (testiFluttuanti[i].vita <= 0) testiFluttuanti.splice(i, 1); }

        ctx.restore(); cicloAnimazione = requestAnimationFrame(cicloGioco);
    }

    document.getElementById("btn-gioca").addEventListener("click", () => avviaPartita("normale"));
    document.getElementById("btn-estrema").addEventListener("click", () => avviaPartita("estrema"));
    document.getElementById("btn-riprova").addEventListener("click", () => avviaPartita(modalitaAttuale));
    document.getElementById("btn-home").addEventListener("click", resetMenu);
    
    document.getElementById("btn-reset").addEventListener("click", () => {
        localStorage.removeItem("druvnja_record_normale"); localStorage.removeItem("druvnja_record_estrema");
        recordNormale = 0; recordEstrema = 0;
        labelRecordNormale.innerText = 0; labelRecordEstrema.innerText = 0;
    });

    disegnaSfondoVuoto();