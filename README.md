# KAJ Semestral Work - TickTick Clone (To-Do, Pomodoro, Habits)

Tato klientská webová aplikace je klonem populárního plánovače **TickTick** a slouží jako semestrální práce pro předmět **KAJ (Klientské aplikace v JavaScriptu)** na ČVUT FEL.

Aplikace je navržena jako moderní Single Page Application (SPA) s čistou architekturou **MVC (Model-View-Controller)** napsanou v čistém **Vanilla JavaScriptu** (ES6+), s využitím pokročilých rozhraní HTML5 a CSS3.

## Hlavní Funkcionality (Premium Features)

1. **Inbox & List View:** Klasická správa úkolů s možností třídění.
2. **Eisenhowerova Matice (Kanban):** Interaktivní pohled rozdělující úkoly podle důležitosti a naléhavosti s podporou **Drag & Drop** pro rychlé přeorganizování.
3. **Habit Tracker & Statistiky:** Sledování plnění návyků s vizualizací pomocí **Canvas grafů**.
4. **Pomodoro Timer Widget:** Odpočítávání času na práci s integrovaným přehrávačem relaxačních zvuků (bílý šum) přes **Media API** a vizuálním SVG/Canvas ukazatelem.
5. **Geolocation API & File API:** Možnost označit úkol geografickou lokací a nahrát k němu přílohu.

---

## Architektura (MVC)

Projekt striktně odděluje data od grafického rozhraní:

* **Model:** Zapouzdřuje stav aplikaci (úkoly, časovač, nastavení) a synchronizuje ho s `LocalStorage`. Využívá prototypovou dědičnost pro sdílení chování (Event emitter).
* **View:** Dynamicky generuje a vykresluje HTML a CSS komponenty na základě stavu. Obsahuje vlastní **Web Components** (Shadow DOM) a CSS3 animace.
* **Controller:** Zpracovává vstupy uživatele (kliky, drag&drop, submit formulářů), aktualizuje Model a instruuje View k překreslení.
* **Router:** Řídí navigaci mezi pohledy bez znovunačtení stránky (SPA) za použití **History API**.

---

## Spuštění a Vývoj

Projekt využívá moderní buildovací nástroj **Vite**.

### Požadavky
* Node.js (doporučeno v18+)

### Instalace
1. Naklonujte repozitář:
   ```bash
   git clone git@github.com:yeronymus/kaj-todo.git
   cd kaj-todo
   ```
2. Nainstalujte závislosti:
   ```bash
   npm install
   ```

### Spuštění lokálního serveru
```bash
npm run dev
```
Aplikace poběží na adrese `http://localhost:5173`.

### Sestavení pro produkci (Build)
```bash
npm run build
```
Vite vygeneruje optimalizovaný build do složky `dist/`, kterou je možné přímo hostovat např. na GitHub Pages.

---

## Autoři
* **Student:** [Jméno a Příjmení]
* **Předmět:** KAJ (Klientské aplikace v JavaScriptu), ČVUT FEL
* **Vyučující:** Zdeněk Vlach / Jan Dušek
