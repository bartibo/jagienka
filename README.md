# Gry Jagienki

Gry i aplikacje zrobione przez Jagienkę.

Strona: https://jagienka.vibemaster.pl (oraz https://bartibo.github.io/jagienka/)

## Jak dodać nowy projekt

1. Utwórz folder, np. `gra1/`, wrzuć do niego plik gry lub aplikacji i zrzut ekranu `screenshot.jpg` (najlepiej 1280×800).
   Dodaj ikonę: `favicon.svg`, `favicon.ico` (16/32/48 px) i `apple-touch-icon.png` (180×180, pełny kwadrat bez przezroczystości)
   i podepnij je w `<head>` tak jak w pozostałych grach.
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
- [`gra2-anomalie-w-pociagu/`](gra2-anomalie-w-pociagu/) – **Jagienka: anomalie w pociągu**: horror 3D w przeglądarce (Three.js). Gracz przechodzi przez
  10 wagonów nocnego pociągu (druga klasa, przedziały, Wars, sypialny, bagażowy z manekinami, pierwsza klasa, tunel, wagon opuszczony,
  wagon odwrócony do góry nogami i wagon Konduktora z bossem), wypatruje anomalii i niszczy je laserem. Gdy anomalia zdąży go dopaść,
  zaczyna ten wagon od początku. Trzy poziomy trudności, tryb łagodny bez straszaków, sterowanie dotykowe, rekordy w `localStorage`.
  Wagony, pasażerowie i światło są budowane kodem (`js/wagony.js`, `js/postacie.js`), duchy, panoramy za oknami i plakaty w `img/`
  wygenerowane w Nano Banana 2.1, dźwięk syntezowany w Web Audio (`js/dzwiek.js`). `lib/three.js` to zminifikowana paczka Three.js 0.186
  z dodatkami do post-processingu. Do testów: `?test&wagon=N` startuje od razu w wagonie N, a `window.__gra` steruje grą.
- [`gra3-zombie/`](gra3-zombie/) – **Ostatni Ocalały: Martwa Osada**: strzelanka 3D (Three.js 0.170 z CDN jsDelivr, moduły ES w `js/`).
  Poziomy na zmianę w dzień i w nocy, 5 domków do przeszukania, 7 broni w sklepiku, zombie wchodzą do domków przez drzwi.
  Moduły: `stan.js` (stan gry, bronie, typy zombie), `grafika.js` (niebo, światła, cienie, postprocessing, presety jakości
  Niska/Średnia/Wysoka z automatycznym wyborem), `swiat.js` (osada; nieruchoma geometria scalana według materiału),
  `zombie.js` (zombie na kościach – jedno rysowanie na zombie), `bronie.js`, `efekty.js`, `hud.js`, `gra.js` (pętla i sterowanie).
  Tekstury w `tekstury/` to skany CC0 z [Poly Haven](https://polyhaven.com) (1k, przekompresowane); reszta rysowana kodem.
  `styl.css` to zbudowany Tailwind 3 (`tailwind/` – komenda przebudowy w `tailwind.config.js`).
  `wersja-pierwsza.html` to pierwotna wersja gry w jednym pliku. Do testów: `?fps` pokazuje licznik klatek, `window.__gra` steruje grą.
  Gra sieciowa do 3 osób (`js/siec.js`, `js/gracze.js`): przeglądarki łączą się bezpośrednio przez WebRTC (PeerJS 1.5.4 z CDN,
  darmowy serwer PeerJS tylko kojarzy graczy po 5-znakowym kodzie), więc nie trzeba własnego serwera – działa na GitHub Pages.
  Gospodarz liczy fale, zombie i łup, goście wysyłają mu pozycję i trafienia. Link zaproszenia: `gra3-zombie/?pokoj=KOD`.
