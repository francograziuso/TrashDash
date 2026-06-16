# TrashDash

TrashDash e' un'applicazione mobile in forma di educational game dedicata alla raccolta differenziata. Il progetto trasforma lo smistamento dei rifiuti in un'esperienza interattiva: l'utente riconosce gli oggetti, li trascina nel contenitore corretto, accumula punteggio, riceve feedback sugli errori e puo' confrontarsi con altri giocatori.

Questo repository contiene un unico README di presentazione del progetto. La documentazione completa, i materiali di consegna e gli approfondimenti tecnici sono disponibili nel Drive ufficiale del gruppo.

## Documentazione ufficiale

[Cartella Google Drive del progetto](https://drive.google.com/drive/folders/1M_5jjC_RomTToiA7NyK14MkHqKCE5Gag?usp=drive_link)

Nel Drive sono raccolti i documenti utili per descrivere l'applicazione, l'architettura, il design, il frontend, il backend, il database e la presentazione del lavoro.

## Obiettivo del progetto

TrashDash nasce con l'obiettivo di rendere piu' semplice e coinvolgente l'apprendimento della raccolta differenziata. L'app usa meccaniche da gioco arcade per aiutare l'utente a memorizzare il contenitore corretto per ogni rifiuto e, quando possibile, ad applicare regole coerenti con il territorio rilevato.

## Funzionalita' principali

- Registrazione, login e accesso ospite.
- Profilo utente con punteggio, monete, impostazioni e oggetti cosmetici.
- Gameplay drag-and-drop con timer, vite e difficolta' progressive.
- Feedback immediato sugli errori e report didattico a fine partita.
- Catalogo dei rifiuti e regole di smistamento.
- Regole locali basate su localizzazione o selezione manuale.
- Classifica globale degli utenti.
- Shop cosmetico con acquisto ed equipaggiamento degli item.
- Modalita' scontro 1v1 tramite codice lobby.

## Architettura dell'applicazione

La versione applicativa di TrashDash e' organizzata separando le responsabilita' principali:

- **Frontend mobile**: interfaccia utente, schermate di gioco, navigazione, animazioni, suoni, shop, classifica e interazione con le API.
- **Backend**: API REST, autenticazione, gestione utenti, partite, lobby 1v1, classifica, shop e geolocalizzazione.
- **Database**: persistenza di utenti, sessioni, risultati, acquisti, item, regole locali e dati di gioco.
- **Documentazione**: requisiti, casi d'uso, struttura dati, architettura, scelte progettuali e materiali di presentazione.

## Tecnologie utilizzate

- **React Native / Expo** per l'app mobile.
- **JavaScript** per la parte frontend.
- **Node.js** per l'ambiente backend.
- **Express** per l'esposizione delle API.
- **TypeScript** per rendere il backend piu' tipizzato e manutenibile.
- **PostgreSQL** come database relazionale.
- **Prisma** come ORM e livello di accesso al database.
- **Docker** per avviare l'ambiente database in modo riproducibile.
- **API REST** per la comunicazione tra app e backend.
- **WebSocket** per le funzionalita' realtime della modalita' scontro.
- **Onion/Clean Architecture** per separare dominio, casi d'uso, infrastruttura e presentazione.

## Aree del progetto

### Documentazione

La documentazione descrive il progetto in modo completo: obiettivi, requisiti, casi d'uso, architettura, database, design, frontend e backend. Serve sia come supporto alla presentazione sia come guida tecnica per spiegare le scelte realizzative.

### Design

Il design e' pensato per rendere il tema ambientale chiaro e immediato. L'interfaccia usa colori, icone, feedback visivi, elementi cosmetici, suoni e animazioni per rendere il gioco leggibile, riconoscibile e adatto a un'esperienza mobile.

### Frontend

Il frontend gestisce l'esperienza utente: schermate principali, login, nuova partita, gameplay, report, classifica, shop, impostazioni e comunicazione con il backend. La parte mobile e' progettata per essere usata tramite Expo e per funzionare su dispositivi reali o emulatori.

### Backend

Il backend coordina la logica applicativa: autenticazione, utenti, salvataggio delle partite, classifica, acquisti dello shop, lobby 1v1, sincronizzazione realtime e accesso ai dati tramite Prisma. La struttura segue una separazione a livelli per mantenere il codice piu' ordinato e facile da spiegare.

## Team

- Franco Graziuso (Matr. 0612709488)
- Gabriele Alfano (Matr. 0612710143)
- Giorgia Rispoli (Matr. 0612709246)
- Matteo Trivellone (Matr. 0612709465)

## Contesto

Progetto realizzato dal Gruppo 1 per l'Academy di Mobile Programming, Universita' degli Studi di Salerno, A.A. 2025/2026.
