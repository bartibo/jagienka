# Gry Jagienki

Gry i aplikacje zrobione przez Jagienkę.

Strona: https://jagienka.vibemaster.pl (oraz https://bartibo.github.io/jagienka/)

## Jak dodać nowy projekt

1. Utwórz folder, np. `gra1/`, wrzuć do niego plik gry lub aplikacji i zrzut ekranu `screenshot.jpg` (najlepiej 1280×800).
2. Dodaj kartę z linkiem, obrazkiem, tytułem i opisem w głównym [index.html](index.html), w miejsce karty „Wkrótce”.
3. Zrób commit i push do gałęzi `main`. Po minucie projekt będzie na https://jagienka.vibemaster.pl.

Używaj w ścieżkach linków względnych (`img/obrazek.png`, a nie `/img/obrazek.png`),
żeby projekty działały zarówno pod adresem github.io, jak i pod własną domeną.

## Projekty

- [`gra1-moda/`](gra1-moda/) – **Studio Jagienki**: kreator postaci 2D z przebieraniem (twarz, makijaż, malunki,
  fryzury z ombre, ubrania z kolorami i wzorami, dodatki, zwierzaki, efekty, tła). Wybór pory roku (zima, wiosna, lato,
  jesień/Halloween) podpowiada stroje, losowanie, wyzwania i jury; zimowa kolekcja leży w `js/katalog-zima-*.js`.
  Galeria postaci w `localStorage`, eksport PNG z przezroczystym tłem i JPG z tłem, wyzwania z jury i odznaki.
  Postać i ubrania są rysowane kodem jako warstwy SVG (`js/`), tła w `tla/` wygenerowane w Nano Banana 2.1 (Google Gemini).
  Kontrakt rysunków: wszystkie elementy leżą w układzie 600 × 800 wzdłuż punktów ciała z `js/cialo.js`.
- [`gra2-mesnik-anomalie/`](gra2-mesnik-anomalie/) – **Meśnik: Anomalie**: horror 3D w przeglądarce (Three.js). Gracz przechodzi przez
  10 wagonów ekspresu „Meśnik” (druga klasa, przedziały, Wars, sypialny, bagażowy z manekinami, pierwsza klasa, tunel, wagon opuszczony,
  wagon odwrócony do góry nogami i wagon Konduktora z bossem), wypatruje anomalii i niszczy je laserem. Gdy anomalia zdąży go dopaść,
  zaczyna ten wagon od początku. Trzy poziomy trudności, tryb łagodny bez straszaków, sterowanie dotykowe, rekordy w `localStorage`.
  Wagony, pasażerowie i światło są budowane kodem (`js/wagony.js`, `js/postacie.js`), duchy, panoramy za oknami i plakaty w `img/`
  wygenerowane w Nano Banana 2.1, dźwięk syntezowany w Web Audio (`js/dzwiek.js`). `lib/three.js` to zminifikowana paczka Three.js 0.186
  z dodatkami do post-processingu. Do testów: `?test&wagon=N` startuje od razu w wagonie N, a `window.__gra` steruje grą.
