# KAJ Semestral Work - TickTick Clone
**Předmět:** KAJ (Klientské aplikace v JavaScriptu)
**Téma:** Klon aplikace TickTick (Premium Features: Eisenhower Matrix, Pomodoro, Habits)
**Cíl:** Vytvořit webovou klientskou aplikaci využívající moderní technologie a MVC vzor.

## Bodové hodnocení a nasazení v projektu (36b max)

Tento dokument slouží k evidenci požadavků a toho, kde budou v našem *TickTick klonu* implementovány.

### HTML 5 (7 bodů)
- [ ] **Validita (1b):** Validní použití HTML5 doctype.
- [ ] **Sémantické značky (1b):** Správné použití sémantických značek (`<header>`, `<main>`, `<section>`, `<article>`, `<nav>`, `<aside>`).
- [ ] **Grafika - SVG / Canvas (2b):** 
  - *Využití:* Pomodoro timer nakreslený do `<canvas>` (kruhový ukazatel odpočtu) a SVG ikony v UI. Graf pro "Habit Tracker" statistiky.
- [ ] **Média - Audio/Video (1b):**
  - *Využití:* Přehrávání bílého šumu (White noise) a upozornění timeru přes `<audio>`.
- [ ] **Formulářové prvky (2b):** Validace, typy, placeholder, autofocus.
  - *Využití:* Přidávání úkolů do matrixu/listu - input musí být validován na neprázdnou string a správně nastavený `autofocus`.

### CSS (8 bodů)
- [ ] **Pokročilé selektory (1b):** Použití pokročilých pseudotříd a kombinátorů (`:not()`, `:has()`, `:nth-child`, `+`, `~`, `:checked`).
- [ ] **CSS3 transformace 2D/3D (2b):**
  - *Využití:* 3D flip animace pro detaily úkolu (pomocí CSS transformací).
- [ ] **CSS3 transitions/animations (2b):**
  - *Využití:* Plynulé fade-in přechody pro listování úkolů a drag-and-drop zón.
- [ ] **Media queries (2b):** Responzivita (stránky se přeskládají z 3-sloupcového layoutu na 1 sloupec na mobilu).
- [ ] **Nested CSS (1b):** Využití SCSS preprocesoru (nebo nativního CSS nestingu) pro strukturování UI (např. Matrix mřížka).

### Javascript (15 bodů)
- [ ] **OOP přístup (2b):** Prototypová dědičnost, její využití, jmenné prostory.
  - *Využití:* Architektura MVC. Modely (např. `TaskModel`, `PomodoroModel`) s prototypovým napojením na Event Emmiter, ukryté v JS modulech.
- [ ] **Použití JS frameworku či knihovny (1b):**
  - *Využití:* Knihovna `SortableJS` pro dokonalou integraci Matrix (Drag & Drop) a Vite jako build tool pro modulární JS.
- [ ] **Použití pokročilých JS API (3b):**
  - *Využití:* 
    - **LocalStorage:** Ukládání celého stavu databáze aplikaci.
    - **Drag & Drop API:** Nativně využito v knihovně pro přesouvání mezi okny Eisenhowerovy matice (Kanban columns).
    - **Geolocation API:** Poloha v "Task Detail" pro připomínky na základě lokace.
    - **File API:** Nahrání přiloženého obrázku přes FileReader k úkolu.
- [ ] **Funkční historie (2b):** Posun tlačítky zpět/vpřed prohlížeče (History API).
  - *Využití:* Vlastní router, který přepíná pohledy (List View -> Eisenhower Matrix -> Habit Tracker) a manipuluje se state přes `history.pushState`.
- [ ] **Ovládání médií (1b):** Použití Média API, přehrávání z JS.
  - *Využití:* Ovládání White Noise z JS u Pomodoro sekce (`audio.play()`, `audio.pause()`).
- [ ] **Offline aplikace (2b):** Stránka reaguje na stav připojení nebo funguje bez něj.
  - *Využití:* Service Worker s PWA manifestem – appka kešuje všechny assety a ukládá tick-ticky do offline DB a synchronizuje při online stavu.
- [ ] **JS práce s SVG (2b):** Události, tvorba, úpravy.
  - *Využití:* Vykreslování interaktivní ikony hvězdičky "Důležité", zmenšování stroke width při focusu v JS.
- [ ] **Webová komponenta (2b):** Na stránce je použit vlastní HTML element.
  - *Využití:* `<task-modal>` komponenta zabalená do Shadow DOM pro oddělené styly modálního okna.

### Ostatní (5 bodů)
- [ ] **Kompletnost řešení (3b):** Vše musí dávat smysl a být propojené.
- [ ] **Estetické zpracování (2b):** Dark Mode a Premium TickTick look-and-feel (s efekty glassmorphism a gridem).
