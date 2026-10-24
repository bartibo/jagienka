// Gotowe stylizacje (start dla tych, które nie wiedzą od czego zacząć), tematy wyzwań dla jury i odznaki.

export const STYLIZACJE = [
  { id: 'czarownica', nazwa: 'Czarownica', emoji: '🧙‍♀️', w: { suknia: { id: 'czarownica' }, nakrycie: { id: 'czarownicy' }, wreka: { id: 'miotla' }, rajstopy: { id: 'pasiaste' }, buty: { id: 'czarownicy' }, fryzura: { id: 'fale', k: ['#c77dff', '#4cc9f0', '#ff5d8f'] }, grzywka: { id: 'prosta' }, malunki: { id: 'pajeczyna' }, usta: { id: 'usmiech', k: ['#5c0a1e'] }, kreska: { id: 'kocia', k: ['#1b1020'] }, cienie: { id: 'mocne', k: ['#7b2cbf', '#d3b6ff'] }, zwierzak: { id: 'kot' }, tlo: { id: 'pracownia-czarownicy' }, efekty: { id: 'swietliki' } } },
  { id: 'wampirzyca', nazwa: 'Wampirzyca', emoji: '🧛‍♀️', w: { suknia: { id: 'wampirzyca' }, okrycie: { id: 'wampirza' }, skora: { id: 'wampir', k: ['#eee4f4'] }, usta: { id: 'kly', k: ['#c1121f'] }, fryzura: { id: 'kok', k: ['#1d1520', '#1d1520', '#c1121f'] }, grzywka: { id: 'brak' }, oczy: { id: 'kocie', k: ['#c1121f'] }, malunki: { id: 'wampir' }, kreska: { id: 'skrzydelko', k: ['#1b1020'] }, rekawiczki: { id: 'koronkowe' }, naszyjnik: { id: 'choker' }, buty: { id: 'szpilki', k: ['#1b1020', '#c1121f'] }, zwierzak: { id: 'nietoperz' }, tlo: { id: 'nawiedzony-dwor' }, efekty: { id: 'nietoperze' } } },
  { id: 'kotka', nazwa: 'Czarna kotka', emoji: '🐈‍⬛', w: { suknia: { id: 'kotka' }, nakrycie: { id: 'kocieUszy' }, ogon: { id: 'koci' }, malunki: { id: 'kotek' }, usta: { id: 'koci', k: ['#e8848f'] }, naszyjnik: { id: 'dzwonek' }, rekawiczki: { id: 'lapki' }, fryzura: { id: 'bob', k: ['#1d1520', '#1d1520', '#ff5d8f'] }, grzywka: { id: 'prosta' }, oczy: { id: 'kocie', k: ['#5fd068'] }, kreska: { id: 'kocia', k: ['#1b1020'] }, buty: { id: 'kozaki' }, zwierzak: { id: 'kot', k: ['#ff8a1f', '#5fd068'] }, tlo: { id: 'impreza-halloween' } } },
  { id: 'szkieletka', nazwa: 'Szkieletka', emoji: '💀', w: { suknia: { id: 'szkielet' }, malunki: { id: 'szkielet' }, fryzura: { id: 'kucyki', k: ['#f4f1ea', '#c77dff', '#1b1020'] }, grzywka: { id: 'kosmyki' }, nos: { id: 'czaszka' }, buty: { id: 'glany' }, nakrycie: { id: 'kokarda', k: ['#1b1020', '#ffffff'], wz: 'groszki' }, usta: { id: 'spokojna', k: ['#3a2d4a'] }, tlo: { id: 'halloween-cmentarz' }, efekty: { id: 'nietoperze' }, zwierzak: { id: 'duszek' } } },
  { id: 'dynia', nazwa: 'Dyniowa panna', emoji: '🎃', w: { suknia: { id: 'dynia' }, nakrycie: { id: 'dynia' }, rajstopy: { id: 'pasiaste', k: ['#ff8a1f', '#1b1020'] }, wreka: { id: 'koszyk' }, fryzura: { id: 'warkocze', k: ['#c0392b', '#ff7a3d', '#5b7a2a'] }, grzywka: { id: 'zaslonka' }, policzki: { id: 'oba' }, zwierzak: { id: 'dynia' }, kolczyki: { id: 'dynie' }, buty: { id: 'trampki', k: ['#1b1020', '#ff8a1f'] }, malunki: { id: 'dynia' }, tlo: { id: 'halloween-dynie' }, efekty: { id: 'liscie' } } },
  { id: 'duszek', nazwa: 'Duszek', emoji: '👻', w: { suknia: { id: 'duszek' }, skora: { id: 'duch', k: ['#f4f7ff'] }, fryzura: { id: 'syrenka', k: ['#f4f1ea', '#b8b8f8', '#c77dff'] }, grzywka: { id: 'kosmyki' }, oczy: { id: 'swiecace', k: ['#4cc9f0'] }, usta: { id: 'zdziwiona', k: ['#b8a8e8'] }, nakrycie: { id: 'aureola', k: ['#e0e8ff', '#ffffff'] }, rajstopy: { id: 'brak' }, buty: { id: 'baleriny', k: ['#ffffff', '#c77dff'] }, zwierzak: { id: 'duszek' }, tlo: { id: 'nawiedzony-dwor' }, efekty: { id: 'mgla' } } },
  { id: 'diablica', nazwa: 'Diabełek', emoji: '😈', w: { suknia: { id: 'mini', k: ['#e5383b', '#1b1020'] }, nakrycie: { id: 'rogi' }, ogon: { id: 'diabelski' }, skrzydla: { id: 'diabelskie' }, rajstopy: { id: 'rajstopy', k: ['#1b1020', '#1b1020'] }, buty: { id: 'kozaki', k: ['#e5383b', '#ffd23f'] }, fryzura: { id: 'fale', k: ['#1d1520', '#c1121f', '#e5383b'] }, usta: { id: 'usmieszek', k: ['#c1121f'] }, kreska: { id: 'skrzydelko', k: ['#1b1020'] }, oczy: { id: 'duze', k: ['#e5383b'] }, tlo: { id: 'impreza-halloween' }, efekty: { id: 'iskierki', k: ['#ffb84d', '#e5383b'] } } },
  { id: 'zombie', nazwa: 'Zombie', emoji: '🧟‍♀️', w: { skora: { id: 'zombie', k: ['#a9d39a'] }, gora: { id: 'podarta' }, dol: { id: 'poszarpana', k: ['#4a3a5a', '#7fb069'] }, malunki: { id: 'szwy' }, oczy: { id: 'spirale', k: ['#5fd068'] }, buty: { id: 'glany' }, fryzura: { id: 'kucyki', k: ['#5b7a2a', '#c77dff', '#7a5a3a'] }, grzywka: { id: 'kosmyki' }, usta: { id: 'jezyk', k: ['#7a6a8a'] }, brwi: { id: 'smutne', k: ['#3b2418'] }, tlo: { id: 'halloween-cmentarz' }, efekty: { id: 'mgla' } } },
  { id: 'wrozka', nazwa: 'Wróżka', emoji: '🧚‍♀️', w: { suknia: { id: 'wrozka' }, skrzydla: { id: 'wrozki' }, nakrycie: { id: 'wianek' }, fryzura: { id: 'polkucyk', k: ['#ff8fc7', '#c77dff', '#fff3b0'] }, skora: { id: 'wrozka', k: ['#e6cbff'] }, uszy: { id: 'elfie' }, oczy: { id: 'gwiazdki', k: ['#8b5cf6'] }, malunki: { id: 'brokat' }, zwierzak: { id: 'krolik' }, efekty: { id: 'swietliki' }, buty: { id: 'baleriny' }, wreka: { id: 'rozdzka', k: ['#ffd23f', '#ff8fc7'] }, tlo: { id: 'las-wrozek' } } },
  { id: 'syrenka', nazwa: 'Syrenka', emoji: '🧜‍♀️', w: { suknia: { id: 'syrena' }, fryzura: { id: 'syrenka', k: ['#ff8fc7', '#4cc9f0', '#ffd23f'] }, grzywka: { id: 'brak' }, malunki: { id: 'syrena' }, kolczyki: { id: 'krople' }, nakrycie: { id: 'tiara', k: ['#e0e6f0', '#4cc9f0'] }, oczy: { id: 'anime', k: ['#2ec4b6'] }, cienie: { id: 'teczowe' }, tlo: { id: 'podwodny' }, efekty: { id: 'banki' }, buty: { id: 'brak' } } },
  { id: 'ksiezniczka', nazwa: 'Księżniczka', emoji: '👑', w: { suknia: { id: 'balowa' }, nakrycie: { id: 'korona' }, fryzura: { id: 'syrenka', k: ['#f2c46d', '#fbe3a0', '#ff5d8f'] }, rekawiczki: { id: 'dlugie' }, naszyjnik: { id: 'perly' }, kolczyki: { id: 'perelki' }, buty: { id: 'baleriny' }, wreka: { id: 'rozdzka' }, okrycie: { id: 'futerko' }, tlo: { id: 'sala-balowa' }, efekty: { id: 'iskierki' } } },
  { id: 'gwiazda', nazwa: 'Gwiazda pop', emoji: '🎤', w: { gora: { id: 'crop', k: ['#c13ad6', '#ffffff'], wz: 'brokat' }, dol: { id: 'mini', k: ['#1b1020', '#ffd23f'] }, okrycie: { id: 'ramoneska' }, okulary: { id: 'gwiazdy' }, kreska: { id: 'skrzydelko', k: ['#1b1020'] }, rzesy: { id: 'dramatyczne', k: ['#1b1020'] }, buty: { id: 'kozaki', k: ['#c13ad6', '#ffd23f'] }, rajstopy: { id: 'kabaretki' }, fryzura: { id: 'kucyk', k: ['#ff4d8d', '#c77dff', '#ffd23f'] }, kolczyki: { id: 'kolka' }, efekty: { id: 'konfetti' }, tlo: { id: 'wybieg' } } },
  { id: 'paryzanka', nazwa: 'Paryżanka', emoji: '🥐', w: { gora: { id: 'bluzka', k: ['#ffffff', '#1b1020'], wz: 'paski' }, dol: { id: 'maxi', k: ['#c1121f', '#ffd23f'] }, nakrycie: { id: 'beret' }, okulary: { id: 'kocie' }, wreka: { id: 'torebka', k: ['#1b1020', '#ffd23f'] }, buty: { id: 'baleriny', k: ['#1b1020', '#c1121f'] }, usta: { id: 'usmiech', k: ['#c1121f'] }, kreska: { id: 'skrzydelko', k: ['#1b1020'] }, fryzura: { id: 'bob', k: ['#3b2418', '#3b2418', '#c1121f'] }, grzywka: { id: 'prosta' }, naszyjnik: { id: 'perly' }, zwierzak: { id: 'piesek', k: ['#f4f1ea', '#c58556'] }, tlo: { id: 'paryz' } } },
  { id: 'sniezynka', nazwa: 'Śnieżynka', emoji: '❄️', w: { gora: { id: 'sweter', k: ['#bfe9ff', '#ffffff'], wz: 'gwiazdki' }, dol: { id: 'mini', k: ['#5b8def', '#ffffff'] }, rajstopy: { id: 'rajstopy', k: ['#ffffff', '#ffffff'] }, buty: { id: 'botki' }, nakrycie: { id: 'czapka' }, naszyjnik: { id: 'szalik', k: ['#4cc9f0', '#ffffff'] }, rekawiczki: { id: 'krotkie', k: ['#4cc9f0', '#ffffff'] }, policzki: { id: 'rumience', k: ['#ff6b8f', '#b0705a'] }, fryzura: { id: 'warkocze', k: ['#fbe3a0', '#f4f1ea', '#4cc9f0'] }, tlo: { id: 'zima' }, efekty: { id: 'snieg' } } },
  { id: 'kosmitka', nazwa: 'Kosmitka', emoji: '🪐', w: { suknia: { id: 'kosmiczny' }, skora: { id: 'kosmitka', k: ['#9fd3f0'] }, fryzura: { id: 'koczki', k: ['#c77dff', '#ff8fc7', '#ffd23f'] }, oczy: { id: 'gwiazdki', k: ['#c77dff'] }, okulary: { id: 'brak' }, malunki: { id: 'gwiazdki' }, buty: { id: 'kozaki', k: ['#e0e6f0', '#7b6cf6'] }, kolczyki: { id: 'gwiazdki' }, tlo: { id: 'kosmos' }, efekty: { id: 'gwiazdki' } } },
  { id: 'plaza', nazwa: 'Plażowiczka', emoji: '🏖️', w: { gora: { id: 'crop', k: ['#ffd23f', '#ff5d8f'], wz: 'kwiatki' }, dol: { id: 'szorty' }, nakrycie: { id: 'slomkowy' }, okulary: { id: 'serca' }, buty: { id: 'sandaly' }, fryzura: { id: 'fale', k: ['#a0623a', '#f2c46d', '#ff5d8f'] }, policzki: { id: 'piegi' }, wreka: { id: 'balon', k: ['#4cc9f0', '#ffffff'] }, tlo: { id: 'plaza' } } },
];

// Kategorie, które gotowa stylizacja czyści przed nałożeniem (skóra, oczy i buzia zostają – to „ta sama” postać).
export const SZAFA = ['gora', 'dol', 'suknia', 'okrycie', 'rajstopy', 'buty', 'nakrycie', 'naszyjnik', 'kolczyki', 'okulary', 'rekawiczki', 'wreka', 'skrzydla', 'ogon', 'zwierzak', 'efekty', 'malunki', 'cienie'];

export const TEMATY = [
  { id: 'bal-czarownic', nazwa: 'Bal czarownic', emoji: '🧙‍♀️', opis: 'Kapelusz, miotła, eliksiry… i może czarny kot?', tagi: ['czarownica', 'halloween'], halloween: true },
  { id: 'noc-wampirow', nazwa: 'Noc wampirów', emoji: '🧛‍♀️', opis: 'Elegancko, mrocznie, z peleryną i kiełkami.', tagi: ['wampir', 'halloween'], halloween: true },
  { id: 'dyniowe-swieto', nazwa: 'Dyniowe święto', emoji: '🎃', opis: 'Pomarańczowo! Dynie wszędzie, gdzie się da.', tagi: ['dynia', 'halloween'], halloween: true },
  { id: 'kocia-impreza', nazwa: 'Kocia impreza', emoji: '🐈‍⬛', opis: 'Uszy, ogon, wąsy – miau!', tagi: ['kot', 'halloween'], halloween: true },
  { id: 'straszny-cmentarz', nazwa: 'Straszny cmentarzyk', emoji: '💀', opis: 'Szkieletki, duszki i zombie – ale słodkie!', tagi: ['szkielet', 'zombie', 'duch', 'halloween'], halloween: true },
  { id: 'krolewski-bal', nazwa: 'Królewski bal', emoji: '👑', opis: 'Suknia, korona, błysk – jak prawdziwa księżniczka.', tagi: ['ksiezniczka', 'gala'] },
  { id: 'gwiazda-wybiegu', nazwa: 'Gwiazda wybiegu', emoji: '🌟', opis: 'Odważnie, modnie, z pazurem.', tagi: ['gwiazda', 'gala'] },
  { id: 'lesna-wrozka', nazwa: 'Leśna wróżka', emoji: '🧚‍♀️', opis: 'Skrzydełka, kwiaty i magiczny pył.', tagi: ['wrozka', 'las'] },
  { id: 'podwodny-swiat', nazwa: 'Podwodny świat', emoji: '🧜‍♀️', opis: 'Syrenia płetwa, muszelki i bąbelki.', tagi: ['syrena'] },
  { id: 'wakacje', nazwa: 'Wakacje na plaży', emoji: '🏖️', opis: 'Słońce, kapelusz, okulary i lody!', tagi: ['plaza'] },
  { id: 'zima', nazwa: 'Zimowa przygoda', emoji: '❄️', opis: 'Ciepło, puchato, ze śnieżynkami.', tagi: ['zima'] },
  { id: 'kosmos', nazwa: 'Kosmiczna podróż', emoji: '🪐', opis: 'Gwiazdy, planety i kosmiczny błysk.', tagi: ['kosmos'] },
  { id: 'slodka', nazwa: 'Słodka kraina', emoji: '🍭', opis: 'Lizaki, serduszka, róż i pastele.', tagi: ['slodka', 'cukierki'] },
  { id: 'paryz', nazwa: 'Spacer po Paryżu', emoji: '🥐', opis: 'Beret, paski i szczypta elegancji.', tagi: ['paryz'] },
];

export const SEDZIOWIE = [
  { id: 'mruczka', imie: 'Kotka Mruczka', emoji: '🐈‍⬛', co: 'pasuje do tematu' },
  { id: 'bubu', imie: 'Duszek Bubu', emoji: '👻', co: 'kolory i pomysłowość' },
  { id: 'dynia', imie: 'Pani Dynia', emoji: '🎃', co: 'dodatki i makijaż' },
];

export const KOMENTARZE = {
  mruczka: ['Hmm, to chyba inny temat… miau?', 'Coś tu jest, ale dodaj więcej z tematu!', 'Ładnie! Brakuje jeszcze kilku rzeczy z tematu.', 'Bardzo pasuje! Prawie idealnie!', 'MIAU! Dokładnie o to chodziło!'],
  bubu: ['Buuu… dodaj trochę kolorów!', 'Fajnie, ale możesz zaszaleć z kolorami i wzorami!', 'Ładne kolory! Może jakiś wzór?', 'Uuu, ale pomysłowo! Śliczne kolory!', 'BUUU-ŻO! Ale kreacja! Kocham te kolory!'],
  dynia: ['A gdzie dodatki, kochana?', 'Dodaj biżuterię albo coś do ręki!', 'Ładne dodatki! Makijaż by się przydał.', 'Świetne detale! Widać, że się postarałaś!', 'Perfekcyjne detale! Dyniowo genialne!'],
};

export const ODZNAKI = [
  { id: 'start', nazwa: 'Pierwsze kroki', emoji: '👣', opis: 'Zmień 10 rzeczy w postaci' },
  { id: 'szafa', nazwa: 'Pełna szafa', emoji: '🚪', opis: 'Przymierz 60 różnych rzeczy' },
  { id: 'kolekcja', nazwa: 'Kolekcjonerka', emoji: '📚', opis: 'Zapisz 3 postacie w galerii' },
  { id: 'fotograf', nazwa: 'Fotografka', emoji: '📸', opis: 'Pobierz obrazek postaci' },
  { id: 'tecza', nazwa: 'Tęczowa', emoji: '🌈', opis: 'Użyj naraz 10 różnych kolorów' },
  { id: 'wzory', nazwa: 'Projektantka wzorów', emoji: '🧵', opis: 'Użyj naraz 4 różnych wzorów' },
  { id: 'wizazystka', nazwa: 'Wizażystka', emoji: '💄', opis: 'Cienie, kreska i malunek naraz' },
  { id: 'czarownica', nazwa: 'Prawdziwa czarownica', emoji: '🧹', opis: 'Kapelusz czarownicy i miotła' },
  { id: 'wampir', nazwa: 'Nocny marek', emoji: '🦇', opis: 'Kiełki i peleryna z kołnierzem' },
  { id: 'kocia', nazwa: 'Kocia mama', emoji: '🐾', opis: 'Kocie uszy i kotek obok' },
  { id: 'losowanie', nazwa: 'Szczęściara', emoji: '🎲', opis: 'Losuj 10 razy' },
  { id: 'jury', nazwa: 'Na wybiegu', emoji: '🎬', opis: 'Pokaż stylizację jury' },
  { id: 'gwiazda', nazwa: 'Gwiazda wybiegu', emoji: '🏆', opis: 'Zdobądź 15 gwiazdek od jury' },
  { id: 'halloween', nazwa: 'Królowa Halloween', emoji: '🎃', opis: 'Min. 13 gwiazdek w halloweenowym wyzwaniu' },
  { id: 'mistrzyni', nazwa: 'Mistrzyni wyzwań', emoji: '🥇', opis: 'Ukończ 5 wyzwań' },
];

// Zestawy kolorów do losowania – pasują do siebie, więc los nie robi „pstrokacizny”.
export const ZESTAWY_KOLOROW = [
  ['#ff8fc7', '#ffffff', '#c77dff'], ['#1b1020', '#ff8a1f', '#7b2cbf'], ['#4cc9f0', '#ffffff', '#ffd23f'], ['#c1121f', '#1b1020', '#ffd23f'],
  ['#a0e7c0', '#ffb3d9', '#fff3b0'], ['#7b6cf6', '#ffd23f', '#ffffff'], ['#2ec4b6', '#c77dff', '#ff8fc7'], ['#ffd23f', '#ff5d8f', '#4cc9f0'],
  ['#5b8def', '#ffffff', '#ff5d8f'], ['#3b2a5a', '#5fd068', '#ff8a1f'], ['#e5383b', '#ffffff', '#1b1020'], ['#f4f1ea', '#c58556', '#3b2418'],
];
