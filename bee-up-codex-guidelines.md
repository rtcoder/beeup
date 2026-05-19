# Wytyczne dla Codex — gra Reddit Devvit „Bee Up!”

## 1. Cel projektu

Stwórz lekką grę webową działającą jako interaktywny post na Reddicie.

Robocza nazwa gry: **Bee Up!**

Mechanika:

- pszczółka leci cały czas w górę;
- gracz steruje ruchem lewo/prawo;
- pszczółka zbiera miód;
- pszczółka unika kolców/cierni;
- z czasem gra przyspiesza;
- z czasem pojawia się więcej przeszkód;
- po kolizji z przeszkodą następuje koniec gry;
- wynik bazuje na czasie przetrwania i zebranym miodzie.

Gra ma być prosta, szybka i dobra do krótkiej sesji w poście Reddita.

---

## 2. Platforma docelowa

Projekt ma być przygotowany pod **Reddit Devvit Web**.

Założenia techniczne:

- Devvit Web;
- React;
- TypeScript;
- Vite;
- Canvas 2D;
- backend Devvit/Express tylko do API i późniejszego zapisu wyników;
- bez dużych bibliotek game engine na MVP;
- bez Phasera w pierwszej wersji;
- bez zewnętrznych assetów w MVP;
- wszystko ma działać jako custom post / interactive post Reddita.

Oficjalne punkty odniesienia:

- Devvit Web pozwala budować aplikacje z użyciem standardowych technologii webowych, takich jak React, Three.js, Phaser itd.
- Custom post w Devvit definiuje się przez entry point w `devvit.json`, a następnie tworzy post przez `submitCustomPost`.
- Redis w Devvit może służyć do zapisu wyników, leaderboardów i danych użytkownika.

Linki referencyjne:

- https://developers.reddit.com/docs/capabilities/devvit-web/devvit_web_overview
- https://developers.reddit.com/docs/capabilities/creating_custom_post
- https://developers.reddit.com/docs/introduction/intro-games
- https://developers.reddit.com/docs/capabilities/server/redis
- https://github.com/reddit/devvit-template-react

---

## 3. Priorytet implementacji

Najpierw ma powstać grywalny core loop, dopiero potem dodatki.

Kolejność prac:

1. Ekran startowy.
2. Canvas z pszczółką.
3. Sterowanie lewo/prawo.
4. Scroll świata w dół.
5. Spawn miodu.
6. Spawn kolców.
7. Kolizje.
8. Score.
9. Game over.
10. Restart gry.
11. Local best score.
12. Przygotowanie API pod leaderboard.
13. Dopiero potem grafiki, animacje i efekty.

Nie zaczynaj od assetów, leaderboarda ani skomplikowanej architektury. Najpierw gra ma być przyjemna w dotyku.

---

## 4. Styl gry

Gra ma mieć czytelny, pastelowy, arcade’owy styl.

Kierunek wizualny:

- jasne niebo;
- pastelowy gradient tła;
- pszczółka żółto-czarna;
- miód złoty;
- przeszkody jako ciemne ciernie/kolce;
- UI minimalistyczne;
- duży czytelny wynik;
- duży przycisk „Play again”.

MVP może używać prostych kształtów:

- pszczółka: okrąg/owal z paskami i skrzydełkami;
- miód: złota kropla lub sześciokąt;
- kolce: trójkąty/ciernie;
- tło: gradient i kilka delikatnych chmur.

Nie używaj ciężkich grafik ani zewnętrznych bibliotek graficznych na start.

---

## 5. Docelowy rozmiar gry

Canvas powinien być responsywny, ale logika gry powinna używać stałej przestrzeni projektowej.

Bazowa przestrzeń gry:

```ts
const GAME_WIDTH = 390;
const GAME_HEIGHT = 700;
```

Canvas można skalować CSS-em do dostępnej szerokości, ale logika kolizji powinna działać na bazowych wymiarach.

Zasady:

- canvas ma zachować proporcje;
- na desktopie może być wycentrowany;
- na mobile ma wypełniać maksymalną sensowną szerokość;
- nie dopuszczaj do poziomego scrolla;
- gra ma być wygodna na telefonie.

---

## 6. Struktura plików

Docelowa struktura:

```txt
src/
  client/
    App.tsx
    styles.css
    game/
      BeeGame.tsx
      engine/
        constants.ts
        types.ts
        state.ts
        input.ts
        physics.ts
        spawning.ts
        rendering.ts
        collision.ts
        storage.ts
  server/
    index.ts
    routes/
      score.ts
  shared/
    game.ts
```

Minimalnie akceptowalna struktura dla MVP:

```txt
src/
  client/
    App.tsx
    game/
      BeeGame.tsx
      constants.ts
      types.ts
      utils.ts
```

Jeżeli projekt bazowy Devvit ma inną strukturę, dostosuj się do niej, ale zachowaj separację:

- komponent React;
- logika gry;
- typy;
- rendering;
- konfiguracja balansu.

---

## 7. Model danych gry

Użyj jawnych typów TypeScript.

```ts
export type GameStatus = 'menu' | 'playing' | 'gameOver';

export type EntityType = 'honey' | 'spike';

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
}

export interface Entity {
  id: string;
  type: EntityType;
  x: number;
  y: number;
  width: number;
  height: number;
  speedY?: number;
  points?: number;
}

export interface GameState {
  status: GameStatus;
  player: Player;
  entities: Entity[];
  score: number;
  bestScore: number;
  distanceScore: number;
  honeyScore: number;
  elapsedMs: number;
  worldSpeed: number;
  spawnTimerMs: number;
  spawnIntervalMs: number;
  difficulty: number;
}
```

Nie trzymaj całego stanu gry w React state, bo to spowoduje zbyt dużo renderów. Dla pętli gry użyj `useRef`.

React state może trzymać tylko:

- status gry;
- score do wyświetlenia;
- bestScore;
- ewentualnie gameOver modal.

---

## 8. Sterowanie

Desktop:

- `ArrowLeft`;
- `ArrowRight`;
- `A`;
- `D`.

Mobile:

- pointer/touch drag;
- gracz przesuwa pszczółkę w stronę palca;
- alternatywnie: dotknięcie lewej/prawej połowy ekranu.

Preferowany model:

- na klawiaturze: velocity left/right;
- na touch/pointer: płynne podążanie do `targetX`.

Wytyczne:

- sterowanie musi być responsywne;
- pszczółka nie może wyjść poza ekran;
- ruch ma być lekko wygładzony, ale nie opóźniony;
- gracz musi czuć precyzję.

Przykładowe wartości:

```ts
export const PLAYER_SPEED = 320;
export const TOUCH_LERP = 0.18;
```

---

## 9. Ruch świata

Technicznie pszczółka nie musi naprawdę lecieć w górę. Łatwiej zrobić tak:

- pszczółka jest mniej więcej w dolnej części ekranu;
- miód i przeszkody przesuwają się z góry na dół;
- tło sugeruje lot w górę.

Pozycja startowa gracza:

```ts
player.x = GAME_WIDTH / 2 - PLAYER_WIDTH / 2;
player.y = GAME_HEIGHT * 0.72;
```

Entity update:

```ts
entity.y += worldSpeed * deltaSeconds;
```

Usuń entity, gdy:

```ts
entity.y > GAME_HEIGHT + 80
```

---

## 10. Spawn obiektów

Nie spawnuj wszystkiego kompletnie losowo, bo gra może stać się niesprawiedliwa.

Użyj prostego systemu „rzędów” i „lane’ów”.

Przykład:

```ts
const LANES = 5;
const LANE_WIDTH = GAME_WIDTH / LANES;
```

Spawn row:

- co `spawnIntervalMs` generuj rząd obiektów;
- w rzędzie może być miód, przeszkoda albo układ mieszany;
- zawsze zostaw minimum jeden bezpieczny lane;
- nie stawiaj przeszkód na wszystkich lane’ach;
- im większa trudność, tym większa szansa na więcej przeszkód.

Przykładowe typy rzędów:

```ts
type RowPattern =
  | 'singleHoney'
  | 'doubleHoney'
  | 'singleSpike'
  | 'twoSpikes'
  | 'spikeHoneySpike'
  | 'mixed';
```

Na początku używaj tylko:

- `singleHoney`;
- `singleSpike`;
- `mixed`.

Po wzroście trudności dodaj:

- `twoSpikes`;
- `spikeHoneySpike`.

---

## 11. Trudność i balans

Trudność ma rosnąć płynnie z czasem.

Parametry startowe:

```ts
export const INITIAL_WORLD_SPEED = 170;
export const MAX_WORLD_SPEED = 520;

export const INITIAL_SPAWN_INTERVAL_MS = 900;
export const MIN_SPAWN_INTERVAL_MS = 320;

export const DIFFICULTY_RAMP_MS = 45000;
```

Formuła:

```ts
const difficulty = Math.min(1, elapsedMs / DIFFICULTY_RAMP_MS);

worldSpeed =
  INITIAL_WORLD_SPEED +
  (MAX_WORLD_SPEED - INITIAL_WORLD_SPEED) * difficulty;

spawnIntervalMs =
  INITIAL_SPAWN_INTERVAL_MS -
  (INITIAL_SPAWN_INTERVAL_MS - MIN_SPAWN_INTERVAL_MS) * difficulty;
```

Po 45 sekundach gra osiąga wysoki poziom trudności. Można potem kontynuować przez delikatny endless scaling:

```ts
const overtime = Math.max(0, elapsedMs - DIFFICULTY_RAMP_MS);
const overtimeMultiplier = 1 + Math.min(0.35, overtime / 120000);
worldSpeed *= overtimeMultiplier;
```

Nie przesadzaj z trudnością. Gra ma być szybka, ale nie losowo frustrująca.

---

## 12. Punktacja

Wynik składa się z:

1. punktów za przetrwanie;
2. punktów za zebrany miód.

Przykład:

```ts
distanceScore += deltaSeconds * 12;
honeyScore += collectedHoney.points;
score = Math.floor(distanceScore + honeyScore);
```

Punkty:

```ts
const HONEY_POINTS = 25;
```

Opcjonalnie później:

- złoty miód: `75`;
- combo za serię miodów;
- bonus za bliskie minięcie kolca.

Na MVP nie implementuj combo.

---

## 13. Kolizje

Na MVP wystarczą kolizje prostokątne AABB.

```ts
function intersects(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
```

Dla pszczółki użyj trochę mniejszego hitboxa niż rysunek, żeby gra wydawała się uczciwa.

Przykład:

```ts
const playerHitbox = {
  x: player.x + 6,
  y: player.y + 6,
  width: player.width - 12,
  height: player.height - 12,
};
```

Dla kolców też można zmniejszyć hitbox o kilka pikseli.

Zasady:

- kolizja z miodem usuwa miód i dodaje punkty;
- kolizja z kolcem kończy grę;
- po game over zatrzymaj update świata;
- zostaw ekran z końcowym wynikiem.

---

## 14. Rendering Canvas

Użyj `requestAnimationFrame`.

Pętla:

```ts
let lastTime = performance.now();

function loop(now: number) {
  const deltaMs = Math.min(32, now - lastTime);
  lastTime = now;

  update(deltaMs);
  render(ctx);

  animationFrameId = requestAnimationFrame(loop);
}
```

Limit delta:

- maksymalnie 32 ms na klatkę;
- zapobiega skokom po przełączeniu karty.

Warstwy renderowania:

1. tło;
2. chmury/parallax;
3. miód;
4. kolce;
5. pszczółka;
6. UI w React albo na canvasie.

Preferencja:

- score i przyciski w React;
- obiekty gry na canvasie.

---

## 15. UI React

Ekrany:

### Menu

Elementy:

- tytuł: `Bee Up!`;
- krótki opis: `Collect honey. Dodge thorns. Fly as high as you can.`;
- przycisk: `Start`;
- informacja o sterowaniu.

### Playing

Elementy:

- score;
- best score;
- canvas.

### Game Over

Elementy:

- `Game Over`;
- final score;
- collected honey score;
- best score;
- przycisk `Play again`.

MVP może być po angielsku, bo Reddit jest anglojęzyczny.

---

## 16. Local storage

Na MVP zapisz `bestScore` lokalnie.

Klucz:

```ts
const BEST_SCORE_KEY = 'bee-up-best-score';
```

Funkcje:

```ts
export function loadBestScore(): number;
export function saveBestScore(score: number): void;
```

Obsłuż przypadek, gdy `localStorage` jest niedostępny.

---

## 17. Backend i API

W MVP backend może mieć tylko stub pod wynik.

Endpoint:

```txt
POST /api/score
```

Body:

```json
{
  "score": 1234,
  "honeyScore": 250,
  "distanceScore": 984,
  "elapsedMs": 62000
}
```

Response:

```json
{
  "ok": true
}
```

Na razie endpoint może tylko walidować dane i zwracać `ok`.

Późniejsza wersja:

- zapis wyniku do Redis;
- leaderboard per post;
- leaderboard per subreddit;
- najlepszy wynik użytkownika;
- ochrona przed absurdalnymi wynikami.

---

## 18. Walidacja wyników

Nie ufaj bezkrytycznie frontendowi.

Na MVP można tylko ograniczyć wartości:

- `score >= 0`;
- `score <= 999999`;
- `elapsedMs >= 0`;
- `elapsedMs <= 10 * 60 * 1000`.

W przyszłości można sprawdzać:

```ts
const maxPossibleScore = elapsedMs * 0.05 + collectedHoneyCount * 75;
```

Nie implementuj ciężkiej anty-cheat logiki w MVP.

---

## 19. Devvit Custom Post

Przygotuj projekt tak, aby gra była używalna jako custom post.

W `devvit.json` powinien istnieć entry point dla gry.

Pseudoprzykład:

```json
{
  "entrypoints": {
    "default": {
      "entry": "src/client/App.tsx"
    }
  }
}
```

Uwaga: dopasuj dokładny format do aktualnego template Devvit React, nie zgaduj na siłę, jeżeli template ma inną strukturę.

Przygotuj funkcję serwerową do utworzenia posta, np.:

```ts
export async function createGamePost() {
  return await reddit.submitCustomPost({
    subredditName,
    title: 'Bee Up! 🐝',
    entry: 'default',
    splash: {
      appDisplayName: 'Bee Up!',
      heading: 'Fly higher. Collect honey. Dodge thorns.',
      description: 'A tiny endless bee runner for Reddit.',
      buttonLabel: 'Play'
    },
    postData: {
      version: 1
    }
  });
}
```

Dopasuj importy do aktualnego Devvit SDK w projekcie.

---

## 20. Komendy developerskie

Projekt powinien mieć działające komendy:

```bash
npm install
npm run dev
npm run build
npm run lint
npm run typecheck
```

Jeżeli template nie ma `lint` albo `typecheck`, dodaj je.

Przykład:

```json
{
  "scripts": {
    "dev": "devvit playtest",
    "build": "vite build && tsc --noEmit",
    "typecheck": "tsc --noEmit",
    "lint": "eslint ."
  }
}
```

Dopasuj skrypty do template Devvit. Nie psuj istniejących komend.

---

## 21. Wymagania jakościowe

Kod:

- TypeScript bez `any`, chyba że jest realny powód;
- małe funkcje;
- brak globalnego mutable state poza kontrolowanym game state;
- brak niepotrzebnych zależności;
- brak logiki gry bezpośrednio w JSX;
- brak powtarzania magic numbers;
- konfiguracja w `constants.ts`;
- typy w `types.ts`.

Canvas:

- czyszczony co klatkę;
- skalowany poprawnie pod device pixel ratio;
- bez rozmycia na ekranach retina;
- bez memory leaków z `requestAnimationFrame`;
- event listenery czyszczone w `useEffect`.

React:

- komponent `BeeGame` sam sprząta eventy;
- po unmount zatrzymuje animację;
- restart resetuje pełny stan gry;
- UI nie powoduje lagów w pętli gry.

---

## 22. Device pixel ratio

Canvas powinien być ostry na ekranach retina.

Przykład:

```ts
const dpr = window.devicePixelRatio || 1;

canvas.width = GAME_WIDTH * dpr;
canvas.height = GAME_HEIGHT * dpr;

canvas.style.width = `${GAME_WIDTH}px`;
canvas.style.height = `${GAME_HEIGHT}px`;

ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
```

Jeżeli canvas jest responsywny CSS-em, przelicz pointer coordinates z rzeczywistego rozmiaru elementu na bazowe wymiary gry.

---

## 23. Input pointer/touch

Przeliczanie pozycji:

```ts
function getCanvasPoint(event: PointerEvent, canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();

  return {
    x: ((event.clientX - rect.left) / rect.width) * GAME_WIDTH,
    y: ((event.clientY - rect.top) / rect.height) * GAME_HEIGHT,
  };
}
```

Ustaw:

```css
canvas {
  touch-action: none;
}
```

Dzięki temu przeglądarka nie będzie scrollować strony podczas gry.

---

## 24. Fairness rules

Gra nie może generować niemożliwych układów.

Zasady:

- zawsze zostaw co najmniej jeden bezpieczny lane;
- nie spawnuj dwóch rzędów przeszkód bez odstępu, jeśli prędkość jest wysoka;
- miód nie może być zawsze pułapką;
- pierwszy kolec powinien pojawić się dopiero po krótkim starcie;
- pierwsze 3 sekundy powinny być łatwe;
- gracz musi mieć czas na reakcję.

Parametry:

```ts
const SAFE_START_MS = 2500;
const MIN_VERTICAL_GAP = 120;
```

---

## 25. Etapy implementacji dla Codex

### Etap 1 — szkielet

Zadania:

- utwórz `BeeGame.tsx`;
- dodaj canvas;
- dodaj menu;
- dodaj start/restart;
- dodaj pętlę `requestAnimationFrame`.

Akceptacja:

- aplikacja się buduje;
- można kliknąć Start;
- canvas renderuje tło;
- nie ma błędów w konsoli.

### Etap 2 — gracz

Zadania:

- narysuj pszczółkę;
- dodaj sterowanie klawiaturą;
- dodaj sterowanie pointer/touch;
- ogranicz ruch do ekranu.

Akceptacja:

- pszczółka porusza się płynnie;
- nie wychodzi poza canvas;
- sterowanie działa na desktopie i mobile.

### Etap 3 — obiekty

Zadania:

- dodaj miód;
- dodaj kolce;
- dodaj spawn;
- dodaj ruch obiektów w dół;
- usuwaj obiekty poza ekranem.

Akceptacja:

- obiekty pojawiają się z góry;
- obiekty znikają po opuszczeniu ekranu;
- gra nie generuje setek nieusuniętych obiektów.

### Etap 4 — kolizje i wynik

Zadania:

- dodaj AABB collision;
- zbieranie miodu;
- śmierć po kolcu;
- score za czas;
- score za miód;
- game over screen.

Akceptacja:

- miód znika po kontakcie;
- wynik rośnie;
- kolec kończy grę;
- restart działa poprawnie.

### Etap 5 — balans

Zadania:

- dodaj difficulty;
- zwiększaj `worldSpeed`;
- zmniejszaj `spawnIntervalMs`;
- dodaj bezpieczne lane’y.

Akceptacja:

- pierwsze sekundy są łatwe;
- po kilkudziesięciu sekundach gra jest wyraźnie szybsza;
- nie pojawiają się niemożliwe układy.

### Etap 6 — polish

Zadania:

- popraw tło;
- dodaj chmury/parallax;
- dodaj prostą animację skrzydeł;
- dodaj local best score;
- popraw UI.

Akceptacja:

- gra wygląda spójnie;
- wynik i best score są czytelne;
- gra zachęca do ponownego zagrania.

### Etap 7 — Devvit API

Zadania:

- dodaj endpoint `POST /api/score`;
- przygotuj payload;
- dodaj walidację;
- zostaw TODO pod Redis leaderboard.

Akceptacja:

- po game over frontend może wysłać wynik;
- endpoint odpowiada `{ ok: true }`;
- błędny payload zwraca błąd.

---

## 26. Rekomendowany kod startowy — stałe

```ts
export const GAME_WIDTH = 390;
export const GAME_HEIGHT = 700;

export const PLAYER_WIDTH = 42;
export const PLAYER_HEIGHT = 36;
export const PLAYER_SPEED = 320;
export const TOUCH_LERP = 0.18;

export const INITIAL_WORLD_SPEED = 170;
export const MAX_WORLD_SPEED = 520;

export const INITIAL_SPAWN_INTERVAL_MS = 900;
export const MIN_SPAWN_INTERVAL_MS = 320;
export const DIFFICULTY_RAMP_MS = 45000;

export const HONEY_POINTS = 25;

export const LANES = 5;
export const SAFE_START_MS = 2500;
```

---

## 27. Rekomendowana funkcja resetu gry

```ts
export function createInitialGameState(bestScore: number): GameState {
  return {
    status: 'menu',
    player: {
      x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2,
      y: GAME_HEIGHT * 0.72,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      velocityX: 0,
    },
    entities: [],
    score: 0,
    bestScore,
    distanceScore: 0,
    honeyScore: 0,
    elapsedMs: 0,
    worldSpeed: INITIAL_WORLD_SPEED,
    spawnTimerMs: 0,
    spawnIntervalMs: INITIAL_SPAWN_INTERVAL_MS,
    difficulty: 0,
  };
}
```

---

## 28. Rekomendowana funkcja update

```ts
function updateGame(state: GameState, input: InputState, deltaMs: number) {
  if (state.status !== 'playing') {
    return;
  }

  const deltaSeconds = deltaMs / 1000;

  state.elapsedMs += deltaMs;

  updateDifficulty(state);
  updatePlayer(state, input, deltaSeconds);
  updateEntities(state, deltaSeconds);
  updateSpawning(state, deltaMs);
  updateCollisions(state);
  updateScore(state, deltaSeconds);
}
```

Nie musi być dokładnie tak, ale logika powinna być podzielona podobnie.

---

## 29. Rekomendowana funkcja renderująca pszczółkę

Na MVP nie używaj obrazków.

```ts
function drawBee(ctx: CanvasRenderingContext2D, player: Player, timeMs: number) {
  const cx = player.x + player.width / 2;
  const cy = player.y + player.height / 2;

  const wingOffset = Math.sin(timeMs / 70) * 3;

  ctx.save();

  // wings
  ctx.globalAlpha = 0.65;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(cx - 12, cy - 14 + wingOffset, 10, 14, -0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(cx + 12, cy - 14 - wingOffset, 10, 14, 0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;

  // body
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 20, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // stripes
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy - 14);
  ctx.lineTo(cx - 6, cy + 14);
  ctx.moveTo(cx + 6, cy - 14);
  ctx.lineTo(cx + 6, cy + 14);
  ctx.stroke();

  ctx.restore();
}
```

---

## 30. Rekomendowana funkcja renderująca miód

```ts
function drawHoney(ctx: CanvasRenderingContext2D, entity: Entity) {
  const cx = entity.x + entity.width / 2;
  const cy = entity.y + entity.height / 2;

  ctx.save();
  ctx.fillStyle = '#f59e0b';

  ctx.beginPath();
  ctx.moveTo(cx, entity.y);
  ctx.quadraticCurveTo(entity.x + entity.width, cy, cx, entity.y + entity.height);
  ctx.quadraticCurveTo(entity.x, cy, cx, entity.y);
  ctx.fill();

  ctx.restore();
}
```

---

## 31. Rekomendowana funkcja renderująca kolec

```ts
function drawSpike(ctx: CanvasRenderingContext2D, entity: Entity) {
  ctx.save();
  ctx.fillStyle = '#374151';

  ctx.beginPath();
  ctx.moveTo(entity.x + entity.width / 2, entity.y);
  ctx.lineTo(entity.x + entity.width, entity.y + entity.height);
  ctx.lineTo(entity.x, entity.y + entity.height);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
```

---

## 32. Kryteria ukończenia MVP

MVP jest gotowe, jeżeli:

- gra uruchamia się w Devvit playtest;
- jest ekran startowy;
- działa canvas;
- pszczółka porusza się lewo/prawo;
- działa klawiatura;
- działa touch/pointer;
- miód daje punkty;
- kolce kończą grę;
- poziom trudności rośnie;
- score działa;
- best score zapisuje się lokalnie;
- restart działa;
- projekt przechodzi `npm run build`;
- projekt przechodzi `npm run typecheck`;
- brak błędów w konsoli przeglądarki.

---

## 33. Czego nie robić w MVP

Nie implementuj jeszcze:

- logowania użytkownika;
- pełnego leaderboarda;
- płatności;
- skórek;
- sklepu;
- systemu achievementów;
- proceduralnego świata z fizyką;
- audio;
- multiplayera;
- reklam;
- zewnętrznych assetów;
- ciężkich bibliotek animacji.

To wszystko może być później.

---

## 34. Roadmap po MVP

### Wersja 0.2

- leaderboard lokalny per post;
- Redis;
- zapis najlepszego wyniku użytkownika;
- lepsze wzory przeszkód;
- złoty miód;
- animowane chmury.

### Wersja 0.3

- daily challenge;
- seedowane układy przeszkód;
- ranking dnia;
- udostępnianie wyniku w komentarzu.

### Wersja 0.4

- skórki pszczółki;
- power-up tarczy;
- magnes na miód;
- combo streak.

---

## 35. Instrukcja końcowa dla Codex

Implementuj iteracyjnie.

Po każdej większej zmianie:

1. sprawdź build;
2. sprawdź typecheck;
3. napraw błędy;
4. nie zostawiaj martwego kodu;
5. nie dodawaj zależności bez potrzeby;
6. zachowaj prostą strukturę;
7. preferuj działający MVP ponad rozbudowany, niedokończony system.

Najważniejsze: gra ma być natychmiast zrozumiała i grywalna.
