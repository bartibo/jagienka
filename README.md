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

- [`gra1-moda/`](gra1-moda/) – **Studio Mody**: kreator postaci 2D z przebieraniem (twarz, makijaż, malunki halloweenowe,
  fryzury z ombre, ubrania z kolorami i wzorami, dodatki, zwierzaki, efekty, tła). Galeria postaci w `localStorage`,
  eksport PNG z przezroczystym tłem i JPG z tłem, wyzwania z jury i odznaki.
  Postać i ubrania są rysowane kodem jako warstwy SVG (`js/`), tła w `tla/` wygenerowane w Nano Banana 2.1 (Google Gemini).
  Kontrakt rysunków: wszystkie elementy leżą w układzie 600 × 800 wzdłuż punktów ciała z `js/cialo.js`.
