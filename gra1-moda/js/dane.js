// Gotowe stylizacje (start dla tych, które nie wiedzą od czego zacząć), tematy wyzwań dla jury i odznaki.

export const STYLIZACJE = [
  { id: 'krolowaSniegu', sezon: 'zima', nazwa: 'Królowa Śniegu', emoji: '❄️', w: { suknia: { id: 'krolowaSniegu' }, nakrycie: { id: 'koronaLodowa' }, fryzura: { id: 'warkoczBoczny', k: ['#f4f1ea', '#bfe9ff', '#8fd3f7'] }, grzywka: { id: 'boczna' }, oczy: { id: 'lodowe', k: ['#5b8def'] }, rzesy: { id: 'szronione', k: ['#5b8def'] }, cienie: { id: 'lodowe' }, malunki: { id: 'krysztaly' }, usta: { id: 'usmiech', k: ['#c77dff'] }, kolczyki: { id: 'sople' }, wreka: { id: 'rozdzkaLodowa' }, buty: { id: 'baleriny', k: ['#e0f2ff', '#8fd3f7'] }, zwierzak: { id: 'lisek' }, tlo: { id: 'lodowy-palac' }, efekty: { id: 'sniezynki' } } },
  { id: 'lyzwiarka', sezon: 'zima', nazwa: 'Łyżwiarka', emoji: '⛸️', w: { suknia: { id: 'lyzwiarka' }, buty: { id: 'lyzwy' }, nakrycie: { id: 'nauszniki' }, rekawiczki: { id: 'futrzane' }, naszyjnik: { id: 'wisiorSniezynka' }, fryzura: { id: 'kok', k: ['#3b2418', '#3b2418', '#c77dff'] }, grzywka: { id: 'kurtyna' }, oczy: { id: 'blyszczace', k: ['#8b5cf6'] }, cienie: { id: 'szron' }, policzki: { id: 'mroz' }, rajstopy: { id: 'getryFutro' }, zwierzak: { id: 'pingwin' }, tlo: { id: 'lodowisko' }, efekty: { id: 'snieg' } } },
  { id: 'mikolajka', sezon: 'zima', nazwa: 'Mikołajka', emoji: '🎅', w: { suknia: { id: 'mikolajka' }, nakrycie: { id: 'mikolaj' }, rajstopy: { id: 'rajstopy', k: ['#ffffff', '#ffffff'] }, buty: { id: 'kozakiFutro', k: ['#1b1020', '#ffffff'] }, wreka: { id: 'prezent' }, kolczyki: { id: 'dzwoneczki' }, policzki: { id: 'mroz' }, usta: { id: 'szeroki', k: ['#e5383b'] }, fryzura: { id: 'fale', k: ['#f2c46d', '#fbe3a0', '#e5383b'] }, oczy: { id: 'gwiazdki', k: ['#3a9a4a'] }, zwierzak: { id: 'renifer' }, tlo: { id: 'swiateczny-salon' }, efekty: { id: 'lampki' } } },
  { id: 'elfka', sezon: 'zima', nazwa: 'Elfka', emoji: '🧝‍♀️', w: { suknia: { id: 'elfka' }, nakrycie: { id: 'elf' }, uszy: { id: 'elfie' }, rajstopy: { id: 'cukrowe' }, buty: { id: 'walonki', k: ['#2e9a4a', '#e5383b'] }, wreka: { id: 'laska' }, malunki: { id: 'laska' }, kolczyki: { id: 'laski' }, fryzura: { id: 'niskieKucyki', k: ['#c0392b', '#ff7a3d', '#2e9a4a'] }, grzywka: { id: 'prosta' }, policzki: { id: 'oba' }, tlo: { id: 'jarmark' }, efekty: { id: 'lampki' } } },
  { id: 'narciarka', sezon: 'zima', nazwa: 'Narciarka', emoji: '⛷️', w: { suknia: { id: 'narciarski' }, okulary: { id: 'gogle' }, nakrycie: { id: 'czapkaPompony', k: ['#ff5d8f', '#ffffff'] }, rekawiczki: { id: 'mitenki', k: ['#ff5d8f', '#ffffff'] }, buty: { id: 'narciarskie', k: ['#ffffff', '#ff5d8f'] }, wreka: { id: 'narty' }, naszyjnik: { id: 'komin', k: ['#ffffff', '#ff5d8f'] }, policzki: { id: 'mroz' }, fryzura: { id: 'niskieKucyki', k: ['#a0623a', '#f2c46d', '#4cc9f0'] }, tlo: { id: 'gory-narty' }, efekty: { id: 'snieg' } } },
  { id: 'sniezynka', sezon: 'zima', nazwa: 'Śnieżynka', emoji: '🌨️', w: { suknia: { id: 'sniezynka' }, nakrycie: { id: 'spinkiSniezynki' }, malunki: { id: 'sniezynka' }, oczy: { id: 'blyszczace', k: ['#4cc9f0'] }, fryzura: { id: 'koronaWarkocz', k: ['#fbe3a0', '#f4f1ea', '#4cc9f0'] }, grzywka: { id: 'kurtyna' }, buty: { id: 'baleriny', k: ['#ffffff', '#8fd3f7'] }, rajstopy: { id: 'rajstopy', k: ['#ffffff', '#ffffff'] }, kolczyki: { id: 'sniezynki' }, wreka: { id: 'kulaSniezna' }, zwierzak: { id: 'sowaSniezna' }, tlo: { id: 'las-zimowy' }, efekty: { id: 'sniezynki' } } },
  { id: 'spacer', sezon: 'zima', nazwa: 'Zimowy spacer', emoji: '🧣', w: { gora: { id: 'norweski' }, dol: { id: 'welniana' }, rajstopy: { id: 'grube', k: ['#1b1020', '#000000'] }, buty: { id: 'emu' }, okrycie: { id: 'kozuszek' }, nakrycie: { id: 'uszatka' }, naszyjnik: { id: 'szalikDlugi', k: ['#c1121f', '#ffffff'] }, rekawiczki: { id: 'mitenki' }, wreka: { id: 'kakao' }, policzki: { id: 'mroz' }, fryzura: { id: 'dlugie', k: ['#6b3e26', '#a0623a', '#c1121f'] }, zwierzak: { id: 'piesek' }, tlo: { id: 'zimowa-wioska' }, efekty: { id: 'snieg' } } },
  { id: 'pizama', sezon: 'zima', nazwa: 'Piżamowe party', emoji: '🧸', w: { gora: { id: 'pizamaGora' }, dol: { id: 'pizamaDol' }, buty: { id: 'kapcieRenifer' }, nakrycie: { id: 'opaskaZimowa', k: ['#ffb3d9', '#ffffff'] }, wreka: { id: 'kakao' }, usta: { id: 'kakao', k: ['#e8848f'] }, oczy: { id: 'senne', k: ['#5b8def'] }, fryzura: { id: 'kok', k: ['#a0623a', '#a0623a', '#ff8fc7'] }, zwierzak: { id: 'mis' }, tlo: { id: 'swiateczny-salon' }, efekty: { id: 'lampki' } } },
  { id: 'balwanek', sezon: 'zima', nazwa: 'Bałwanek', emoji: '⛄', w: { suknia: { id: 'balwanek' }, nakrycie: { id: 'cylinder', k: ['#1b1020', '#e5383b'] }, naszyjnik: { id: 'szalikDlugi', k: ['#e5383b', '#ffffff'] }, nos: { id: 'renifer', k: ['#ff8a1f'] }, buty: { id: 'sniegowce' }, rekawiczki: { id: 'mitenki' }, wreka: { id: 'sniezka' }, policzki: { id: 'mroz' }, fryzura: { id: 'niskieKucyki', k: ['#3b2418', '#3b2418', '#e5383b'] }, zwierzak: { id: 'balwan' }, tlo: { id: 'las-zimowy' }, efekty: { id: 'zamiec' } } },
  { id: 'reniferka', sezon: 'zima', nazwa: 'Reniferka', emoji: '🦌', w: { suknia: { id: 'pizamaRenifer' }, nos: { id: 'renifer' }, malunki: { id: 'renifer' }, buty: { id: 'kapcieRenifer' }, wreka: { id: 'piernik' }, fryzura: { id: 'kucyki', k: ['#a0623a', '#d08a4a', '#e5383b'] }, oczy: { id: 'lalka', k: ['#8b5a2b'] }, zwierzak: { id: 'renifer' }, tlo: { id: 'zimowa-wioska' }, efekty: { id: 'sniezynki' } } },
  { id: 'zorza', sezon: 'zima', nazwa: 'Zorza polarna', emoji: '🌌', w: { suknia: { id: 'zorza' }, skrzydla: { id: 'zorzowe' }, nakrycie: { id: 'spinkiSniezynki', k: ['#c77dff', '#ffffff'] }, oczy: { id: 'gwiazdki', k: ['#2ec4b6'] }, kreska: { id: 'brokatowa' }, fryzura: { id: 'syrenka', k: ['#1d1520', '#5fd0a0', '#c77dff'] }, kolczyki: { id: 'sniezynki' }, zwierzak: { id: 'foka' }, tlo: { id: 'zorza-polarna' }, efekty: { id: 'zorza' } } },
  { id: 'pierniczek', sezon: 'zima', nazwa: 'Pierniczek', emoji: '🍪', w: { suknia: { id: 'pierniczek' }, nakrycie: { id: 'kokarda', k: ['#ffffff', '#e5383b'] }, wreka: { id: 'piernik' }, rajstopy: { id: 'cukrowe' }, buty: { id: 'baleriny', k: ['#e5383b', '#ffffff'] }, policzki: { id: 'serduszka' }, fryzura: { id: 'koczki', k: ['#a0623a', '#a0623a', '#ffffff'] }, kolczyki: { id: 'bombki' }, tlo: { id: 'jarmark' }, efekty: { id: 'snieg' } } },
  { id: 'czarownica', sezon: 'jesien', nazwa: 'Czarownica', emoji: '🧙‍♀️', w: { suknia: { id: 'czarownica' }, nakrycie: { id: 'czarownicy' }, wreka: { id: 'miotla' }, rajstopy: { id: 'pasiaste' }, buty: { id: 'czarownicy' }, fryzura: { id: 'fale', k: ['#c77dff', '#4cc9f0', '#ff5d8f'] }, grzywka: { id: 'prosta' }, malunki: { id: 'pajeczyna' }, usta: { id: 'usmiech', k: ['#5c0a1e'] }, kreska: { id: 'kocia', k: ['#1b1020'] }, cienie: { id: 'mocne', k: ['#7b2cbf', '#d3b6ff'] }, zwierzak: { id: 'kot' }, tlo: { id: 'pracownia-czarownicy' }, efekty: { id: 'swietliki' } } },
  { id: 'wampirzyca', sezon: 'jesien', nazwa: 'Wampirzyca', emoji: '🧛‍♀️', w: { suknia: { id: 'wampirzyca' }, okrycie: { id: 'wampirza' }, skora: { id: 'wampir', k: ['#eee4f4'] }, usta: { id: 'kly', k: ['#c1121f'] }, fryzura: { id: 'kok', k: ['#1d1520', '#1d1520', '#c1121f'] }, grzywka: { id: 'brak' }, oczy: { id: 'kocie', k: ['#c1121f'] }, malunki: { id: 'wampir' }, kreska: { id: 'skrzydelko', k: ['#1b1020'] }, rekawiczki: { id: 'koronkowe' }, naszyjnik: { id: 'choker' }, buty: { id: 'szpilki', k: ['#1b1020', '#c1121f'] }, zwierzak: { id: 'nietoperz' }, tlo: { id: 'nawiedzony-dwor' }, efekty: { id: 'nietoperze' } } },
  { id: 'kotka', sezon: 'jesien', nazwa: 'Czarna kotka', emoji: '🐈‍⬛', w: { suknia: { id: 'kotka' }, nakrycie: { id: 'kocieUszy' }, ogon: { id: 'koci' }, malunki: { id: 'kotek' }, usta: { id: 'koci', k: ['#e8848f'] }, naszyjnik: { id: 'dzwonek' }, rekawiczki: { id: 'lapki' }, fryzura: { id: 'bob', k: ['#1d1520', '#1d1520', '#ff5d8f'] }, grzywka: { id: 'prosta' }, oczy: { id: 'kocie', k: ['#5fd068'] }, kreska: { id: 'kocia', k: ['#1b1020'] }, buty: { id: 'kozaki' }, zwierzak: { id: 'kot', k: ['#ff8a1f', '#5fd068'] }, tlo: { id: 'impreza-halloween' } } },
  { id: 'szkieletka', sezon: 'jesien', nazwa: 'Szkieletka', emoji: '💀', w: { suknia: { id: 'szkielet' }, malunki: { id: 'szkielet' }, fryzura: { id: 'kucyki', k: ['#f4f1ea', '#c77dff', '#1b1020'] }, grzywka: { id: 'kosmyki' }, nos: { id: 'czaszka' }, buty: { id: 'glany' }, nakrycie: { id: 'kokarda', k: ['#1b1020', '#ffffff'], wz: 'groszki' }, usta: { id: 'spokojna', k: ['#3a2d4a'] }, tlo: { id: 'halloween-cmentarz' }, efekty: { id: 'nietoperze' }, zwierzak: { id: 'duszek' } } },
  { id: 'dynia', sezon: 'jesien', nazwa: 'Dyniowa panna', emoji: '🎃', w: { suknia: { id: 'dynia' }, nakrycie: { id: 'dynia' }, rajstopy: { id: 'pasiaste', k: ['#ff8a1f', '#1b1020'] }, wreka: { id: 'koszyk' }, fryzura: { id: 'warkocze', k: ['#c0392b', '#ff7a3d', '#5b7a2a'] }, grzywka: { id: 'zaslonka' }, policzki: { id: 'oba' }, zwierzak: { id: 'dynia' }, kolczyki: { id: 'dynie' }, buty: { id: 'trampki', k: ['#1b1020', '#ff8a1f'] }, malunki: { id: 'dynia' }, tlo: { id: 'halloween-dynie' }, efekty: { id: 'liscie' } } },
  { id: 'duszek', sezon: 'jesien', nazwa: 'Duszek', emoji: '👻', w: { suknia: { id: 'duszek' }, skora: { id: 'duch', k: ['#f4f7ff'] }, fryzura: { id: 'syrenka', k: ['#f4f1ea', '#b8b8f8', '#c77dff'] }, grzywka: { id: 'kosmyki' }, oczy: { id: 'swiecace', k: ['#4cc9f0'] }, usta: { id: 'zdziwiona', k: ['#b8a8e8'] }, nakrycie: { id: 'aureola', k: ['#e0e8ff', '#ffffff'] }, rajstopy: { id: 'brak' }, buty: { id: 'baleriny', k: ['#ffffff', '#c77dff'] }, zwierzak: { id: 'duszek' }, tlo: { id: 'nawiedzony-dwor' }, efekty: { id: 'mgla' } } },
  { id: 'diablica', sezon: 'jesien', nazwa: 'Diabełek', emoji: '😈', w: { suknia: { id: 'mini', k: ['#e5383b', '#1b1020'] }, nakrycie: { id: 'rogi' }, ogon: { id: 'diabelski' }, skrzydla: { id: 'diabelskie' }, rajstopy: { id: 'rajstopy', k: ['#1b1020', '#1b1020'] }, buty: { id: 'kozaki', k: ['#e5383b', '#ffd23f'] }, fryzura: { id: 'fale', k: ['#1d1520', '#c1121f', '#e5383b'] }, usta: { id: 'usmieszek', k: ['#c1121f'] }, kreska: { id: 'skrzydelko', k: ['#1b1020'] }, oczy: { id: 'duze', k: ['#e5383b'] }, tlo: { id: 'impreza-halloween' }, efekty: { id: 'iskierki', k: ['#ffb84d', '#e5383b'] } } },
  { id: 'zombie', sezon: 'jesien', nazwa: 'Zombie', emoji: '🧟‍♀️', w: { skora: { id: 'zombie', k: ['#a9d39a'] }, gora: { id: 'podarta' }, dol: { id: 'poszarpana', k: ['#4a3a5a', '#7fb069'] }, malunki: { id: 'szwy' }, oczy: { id: 'spirale', k: ['#5fd068'] }, buty: { id: 'glany' }, fryzura: { id: 'kucyki', k: ['#5b7a2a', '#c77dff', '#7a5a3a'] }, grzywka: { id: 'kosmyki' }, usta: { id: 'jezyk', k: ['#7a6a8a'] }, brwi: { id: 'smutne', k: ['#3b2418'] }, tlo: { id: 'halloween-cmentarz' }, efekty: { id: 'mgla' } } },
  { id: 'wrozka', sezon: 'wiosna', nazwa: 'Wróżka', emoji: '🧚‍♀️', w: { suknia: { id: 'wrozka' }, skrzydla: { id: 'wrozki' }, nakrycie: { id: 'wianek' }, fryzura: { id: 'polkucyk', k: ['#ff8fc7', '#c77dff', '#fff3b0'] }, skora: { id: 'wrozka', k: ['#e6cbff'] }, uszy: { id: 'elfie' }, oczy: { id: 'gwiazdki', k: ['#8b5cf6'] }, malunki: { id: 'brokat' }, zwierzak: { id: 'krolik' }, efekty: { id: 'swietliki' }, buty: { id: 'baleriny' }, wreka: { id: 'rozdzka', k: ['#ffd23f', '#ff8fc7'] }, tlo: { id: 'las-wrozek' } } },
  { id: 'syrenka', sezon: 'lato', nazwa: 'Syrenka', emoji: '🧜‍♀️', w: { suknia: { id: 'syrena' }, fryzura: { id: 'syrenka', k: ['#ff8fc7', '#4cc9f0', '#ffd23f'] }, grzywka: { id: 'brak' }, malunki: { id: 'syrena' }, kolczyki: { id: 'krople' }, nakrycie: { id: 'tiara', k: ['#e0e6f0', '#4cc9f0'] }, oczy: { id: 'anime', k: ['#2ec4b6'] }, cienie: { id: 'teczowe' }, tlo: { id: 'podwodny' }, efekty: { id: 'banki' }, buty: { id: 'brak' } } },
  { id: 'ksiezniczka', nazwa: 'Księżniczka', emoji: '👑', w: { suknia: { id: 'balowa' }, nakrycie: { id: 'korona' }, fryzura: { id: 'syrenka', k: ['#f2c46d', '#fbe3a0', '#ff5d8f'] }, rekawiczki: { id: 'dlugie' }, naszyjnik: { id: 'perly' }, kolczyki: { id: 'perelki' }, buty: { id: 'baleriny' }, wreka: { id: 'rozdzka' }, okrycie: { id: 'futerko' }, tlo: { id: 'sala-balowa' }, efekty: { id: 'iskierki' } } },
  { id: 'gwiazda', nazwa: 'Gwiazda pop', emoji: '🎤', w: { gora: { id: 'crop', k: ['#c13ad6', '#ffffff'], wz: 'brokat' }, dol: { id: 'mini', k: ['#1b1020', '#ffd23f'] }, okrycie: { id: 'ramoneska' }, okulary: { id: 'gwiazdy' }, kreska: { id: 'skrzydelko', k: ['#1b1020'] }, rzesy: { id: 'dramatyczne', k: ['#1b1020'] }, buty: { id: 'kozaki', k: ['#c13ad6', '#ffd23f'] }, rajstopy: { id: 'kabaretki' }, fryzura: { id: 'kucyk', k: ['#ff4d8d', '#c77dff', '#ffd23f'] }, kolczyki: { id: 'kolka' }, efekty: { id: 'konfetti' }, tlo: { id: 'wybieg' } } },
  { id: 'paryzanka', sezon: 'wiosna', nazwa: 'Paryżanka', emoji: '🥐', w: { gora: { id: 'bluzka', k: ['#ffffff', '#1b1020'], wz: 'paski' }, dol: { id: 'maxi', k: ['#c1121f', '#ffd23f'] }, nakrycie: { id: 'beret' }, okulary: { id: 'kocie' }, wreka: { id: 'torebka', k: ['#1b1020', '#ffd23f'] }, buty: { id: 'baleriny', k: ['#1b1020', '#c1121f'] }, usta: { id: 'usmiech', k: ['#c1121f'] }, kreska: { id: 'skrzydelko', k: ['#1b1020'] }, fryzura: { id: 'bob', k: ['#3b2418', '#3b2418', '#c1121f'] }, grzywka: { id: 'prosta' }, naszyjnik: { id: 'perly' }, zwierzak: { id: 'piesek', k: ['#f4f1ea', '#c58556'] }, tlo: { id: 'paryz' } } },
  { id: 'kosmitka', nazwa: 'Kosmitka', emoji: '🪐', w: { suknia: { id: 'kosmiczny' }, skora: { id: 'kosmitka', k: ['#9fd3f0'] }, fryzura: { id: 'koczki', k: ['#c77dff', '#ff8fc7', '#ffd23f'] }, oczy: { id: 'gwiazdki', k: ['#c77dff'] }, okulary: { id: 'brak' }, malunki: { id: 'gwiazdki' }, buty: { id: 'kozaki', k: ['#e0e6f0', '#7b6cf6'] }, kolczyki: { id: 'gwiazdki' }, tlo: { id: 'kosmos' }, efekty: { id: 'gwiazdki' } } },
  { id: 'plaza', sezon: 'lato', nazwa: 'Plażowiczka', emoji: '🏖️', w: { gora: { id: 'crop', k: ['#ffd23f', '#ff5d8f'], wz: 'kwiatki' }, dol: { id: 'szorty' }, nakrycie: { id: 'slomkowy' }, okulary: { id: 'serca' }, buty: { id: 'sandaly' }, fryzura: { id: 'fale', k: ['#a0623a', '#f2c46d', '#ff5d8f'] }, policzki: { id: 'piegi' }, wreka: { id: 'balon', k: ['#4cc9f0', '#ffffff'] }, tlo: { id: 'plaza' } } },
];

// Kategorie, które gotowa stylizacja czyści przed nałożeniem (skóra, oczy i buzia zostają – to „ta sama” postać).
export const SZAFA = ['gora', 'nos', 'dol', 'suknia', 'okrycie', 'rajstopy', 'buty', 'nakrycie', 'naszyjnik', 'kolczyki', 'okulary', 'rekawiczki', 'wreka', 'skrzydla', 'ogon', 'zwierzak', 'efekty', 'malunki', 'cienie'];

export const TEMATY = [
  { id: 'bal-krolowej', nazwa: 'Bal Królowej Śniegu', emoji: '👑', opis: 'Lód, kryształki, srebro i błękit – zimowa elegancja.', tagi: ['krolowa', 'lod'], sezon: 'zima' },
  { id: 'lodowisko', nazwa: 'Piruety na lodowisku', emoji: '⛸️', opis: 'Łyżwy, nauszniki i błyszczący strój łyżwiarki.', tagi: ['lyzwy'], sezon: 'zima' },
  { id: 'swieta', nazwa: 'Magiczne Święta', emoji: '🎄', opis: 'Mikołaj, elfy, renifery i prezenty!', tagi: ['swieta', 'elf', 'renifer'], sezon: 'zima' },
  { id: 'sniezki', nazwa: 'Bitwa na śnieżki', emoji: '⛄', opis: 'Ciepła czapka, rękawiczki i bałwanek do pomocy.', tagi: ['snieg', 'balwan'], sezon: 'zima' },
  { id: 'narty', nazwa: 'Szusem po stoku', emoji: '⛷️', opis: 'Kombinezon, gogle i narty – zjeżdżamy!', tagi: ['narty'], sezon: 'zima' },
  { id: 'pizama', nazwa: 'Piżamowe party', emoji: '🧸', opis: 'Kapcie, kakao i najmilsza piżamka przy kominku.', tagi: ['pizama'], sezon: 'zima' },
  { id: 'zorza', nazwa: 'Pod zorzą polarną', emoji: '🌌', opis: 'Pingwiny, foki i niebo w kolorach tęczy.', tagi: ['zorza', 'pingwin'], sezon: 'zima' },
  { id: 'bal-czarownic', nazwa: 'Bal czarownic', emoji: '🧙‍♀️', opis: 'Kapelusz, miotła, eliksiry… i może czarny kot?', tagi: ['czarownica', 'halloween'], sezon: 'jesien' },
  { id: 'noc-wampirow', nazwa: 'Noc wampirów', emoji: '🧛‍♀️', opis: 'Elegancko, mrocznie, z peleryną i kiełkami.', tagi: ['wampir', 'halloween'], sezon: 'jesien' },
  { id: 'dyniowe-swieto', nazwa: 'Dyniowe święto', emoji: '🎃', opis: 'Pomarańczowo! Dynie wszędzie, gdzie się da.', tagi: ['dynia', 'halloween'], sezon: 'jesien' },
  { id: 'kocia-impreza', nazwa: 'Kocia impreza', emoji: '🐈‍⬛', opis: 'Uszy, ogon, wąsy – miau!', tagi: ['kot', 'halloween'], sezon: 'jesien' },
  { id: 'straszny-cmentarz', nazwa: 'Straszny cmentarzyk', emoji: '💀', opis: 'Szkieletki, duszki i zombie – ale słodkie!', tagi: ['szkielet', 'zombie', 'duch', 'halloween'], sezon: 'jesien' },
  { id: 'krolewski-bal', nazwa: 'Królewski bal', emoji: '👑', opis: 'Suknia, korona, błysk – jak prawdziwa księżniczka.', tagi: ['ksiezniczka', 'gala'] },
  { id: 'gwiazda-wybiegu', nazwa: 'Gwiazda wybiegu', emoji: '🌟', opis: 'Odważnie, modnie, z pazurem.', tagi: ['gwiazda', 'gala'] },
  { id: 'lesna-wrozka', nazwa: 'Leśna wróżka', emoji: '🧚‍♀️', opis: 'Skrzydełka, kwiaty i magiczny pył.', tagi: ['wrozka', 'las'], sezon: 'wiosna' },
  { id: 'podwodny-swiat', nazwa: 'Podwodny świat', emoji: '🧜‍♀️', opis: 'Syrenia płetwa, muszelki i bąbelki.', tagi: ['syrena'], sezon: 'lato' },
  { id: 'wakacje', nazwa: 'Wakacje na plaży', emoji: '🏖️', opis: 'Słońce, kapelusz, okulary i lody!', tagi: ['plaza'], sezon: 'lato' },
  { id: 'zima', nazwa: 'Zimowa przygoda', emoji: '❄️', opis: 'Ciepło, puchato, ze śnieżynkami.', tagi: ['zima'], sezon: 'zima' },
  { id: 'kosmos', nazwa: 'Kosmiczna podróż', emoji: '🪐', opis: 'Gwiazdy, planety i kosmiczny błysk.', tagi: ['kosmos'] },
  { id: 'slodka', nazwa: 'Słodka kraina', emoji: '🍭', opis: 'Lizaki, serduszka, róż i pastele.', tagi: ['slodka', 'cukierki'], sezon: 'wiosna' },
  { id: 'paryz', nazwa: 'Spacer po Paryżu', emoji: '🥐', opis: 'Beret, paski i szczypta elegancji.', tagi: ['paryz'], sezon: 'wiosna' },
];

// Jury na każdą porę roku. Role są stałe: „temat” (czy pasuje do tematu), „kolory” (kolory i pomysłowość), „dodatki” (dodatki i makijaż).
export const SEDZIOWIE = {
  zima: [
    { rola: 'temat', imie: 'Pingwinek Pik', emoji: '🐧', co: 'pasuje do tematu', komentarze: ['Pik, pik? To chyba z innej bajki…', 'Coś tu jest, ale dodaj więcej z tematu!', 'Ładnie! Brakuje jeszcze kilku rzeczy z tematu.', 'Pik-pik! Prawie idealnie!', 'PIIIK! Dokładnie o to chodziło!'] },
    { rola: 'kolory', imie: 'Bałwanek Bolek', emoji: '⛄', co: 'kolory i pomysłowość', komentarze: ['Brrr… dodaj trochę kolorów!', 'Fajnie, ale zaszalej z kolorami i wzorami!', 'Ładne kolory! Może jakiś wzór?', 'Aż mi marchewka zaświeciła! Śliczne!', 'Ale kreacja! Topnieję z zachwytu!'] },
    { rola: 'dodatki', imie: 'Reniferka Gwiazdka', emoji: '🦌', co: 'dodatki i makijaż', komentarze: ['A gdzie dodatki? Zimą trzeba czapki!', 'Dodaj szalik, rękawiczki albo coś do ręki!', 'Ładne dodatki! Makijaż by się przydał.', 'Świetne detale! Mój nosek aż świeci!', 'Perfekcyjne! Ciepło, pięknie i z błyskiem!'] },
  ],
  jesien: [
    { rola: 'temat', imie: 'Kotka Mruczka', emoji: '🐈‍⬛', co: 'pasuje do tematu', komentarze: ['Hmm, to chyba inny temat… miau?', 'Coś tu jest, ale dodaj więcej z tematu!', 'Ładnie! Brakuje jeszcze kilku rzeczy z tematu.', 'Bardzo pasuje! Prawie idealnie!', 'MIAU! Dokładnie o to chodziło!'] },
    { rola: 'kolory', imie: 'Duszek Bubu', emoji: '👻', co: 'kolory i pomysłowość', komentarze: ['Buuu… dodaj trochę kolorów!', 'Fajnie, ale możesz zaszaleć z kolorami i wzorami!', 'Ładne kolory! Może jakiś wzór?', 'Uuu, ale pomysłowo! Śliczne kolory!', 'BUUU-ŻO! Ale kreacja! Kocham te kolory!'] },
    { rola: 'dodatki', imie: 'Pani Dynia', emoji: '🎃', co: 'dodatki i makijaż', komentarze: ['A gdzie dodatki, kochana?', 'Dodaj biżuterię albo coś do ręki!', 'Ładne dodatki! Makijaż by się przydał.', 'Świetne detale! Widać, że się postarałaś!', 'Perfekcyjne detale! Dyniowo genialne!'] },
  ],
  wiosna: [
    { rola: 'temat', imie: 'Króliczek Kiki', emoji: '🐰', co: 'pasuje do tematu', komentarze: ['Hop? To chyba inny temat…', 'Coś tu jest, ale dodaj więcej z tematu!', 'Ładnie! Brakuje jeszcze kilku rzeczy z tematu.', 'Hop-hop! Prawie idealnie!', 'HOP! Dokładnie o to chodziło!'] },
    { rola: 'kolory', imie: 'Motylek Mela', emoji: '🦋', co: 'kolory i pomysłowość', komentarze: ['Dodaj trochę kolorów, proszę!', 'Fajnie, ale zaszalej z kolorami i wzorami!', 'Ładne kolory! Może jakiś wzór?', 'Jak łąka w maju! Śliczne!', 'Zakochałam się w tych kolorach!'] },
    { rola: 'dodatki', imie: 'Pani Biedronka', emoji: '🐞', co: 'dodatki i makijaż', komentarze: ['A gdzie dodatki, kochana?', 'Dodaj biżuterię albo coś do ręki!', 'Ładne dodatki! Makijaż by się przydał.', 'Świetne detale! Widać, że się postarałaś!', 'Perfekcyjne detale! Kropka w kropkę!'] },
  ],
  lato: [
    { rola: 'temat', imie: 'Delfinek Fifi', emoji: '🐬', co: 'pasuje do tematu', komentarze: ['Plum? To chyba inny temat…', 'Coś tu jest, ale dodaj więcej z tematu!', 'Ładnie! Brakuje jeszcze kilku rzeczy z tematu.', 'Plusk! Prawie idealnie!', 'PLUSK! Dokładnie o to chodziło!'] },
    { rola: 'kolory', imie: 'Krab Kubuś', emoji: '🦀', co: 'kolory i pomysłowość', komentarze: ['Dodaj trochę kolorów, szczyp-szczyp!', 'Fajnie, ale zaszalej z kolorami i wzorami!', 'Ładne kolory! Może jakiś wzór?', 'Ale pomysłowo! Śliczne kolory!', 'Szczypię się z zachwytu! Cudo!'] },
    { rola: 'dodatki', imie: 'Pani Arbuzowa', emoji: '🍉', co: 'dodatki i makijaż', komentarze: ['A gdzie dodatki, kochana?', 'Dodaj okulary albo coś do ręki!', 'Ładne dodatki! Makijaż by się przydał.', 'Świetne detale! Słodkie jak arbuz!', 'Perfekcyjne detale! Wakacyjnie genialne!'] },
  ],
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
  { id: 'krolowaSniegu', nazwa: 'Królowa Śniegu', emoji: '👑', opis: 'Lodowa korona i suknia Królowej Śniegu' },
  { id: 'lyzwiarka', nazwa: 'Mistrzyni łyżew', emoji: '⛸️', opis: 'Łyżwy i strój łyżwiarki' },
  { id: 'mikolaj', nazwa: 'Pomocnica Mikołaja', emoji: '🎅', opis: 'Czapka Mikołaja i prezent w dłoni' },
  { id: 'cieplutko', nazwa: 'Cieplutko!', emoji: '🧣', opis: 'Czapka, szalik i rękawiczki naraz' },
  { id: 'balwan', nazwa: 'Przyjaciółka bałwanka', emoji: '⛄', opis: 'Bałwanek obok i śnieżka w dłoni' },
  { id: 'zimowaSzafa', nazwa: 'Zimowa szafa', emoji: '❄️', opis: 'Przymierz 30 zimowych rzeczy' },
  { id: 'zima', nazwa: 'Zimowa gwiazda', emoji: '🌟', opis: 'Min. 13 gwiazdek w zimowym wyzwaniu' },
  { id: 'pory', nazwa: 'Cztery pory roku', emoji: '🍂', opis: 'Zajrzyj do każdej pory roku' },
];

// Pory roku: wybrana pora podpowiada rzeczy (znaczek na kafelku, kolejność, losowanie, wyzwania i jury).
// Rzecz należy do pory, jeśli ma któryś z jej tagów.
export const SEZONY = [
  { id: 'zima', nazwa: 'Zima', emoji: '❄️', los: 'Zimowy strój', opis: 'Śnieg, łyżwy, Święta i Królowa Śniegu', tlo: 'zimowa-wioska', skora: 'lodowa', dzw: 'dzwonki',
    tagi: ['zima', 'swieta', 'lyzwy', 'narty', 'snieg', 'lod', 'krolowa', 'renifer', 'balwan', 'pingwin', 'pizama', 'elf', 'zorza'],
    kolory: [['#bfe9ff', '#ffffff', '#5b8def'], ['#e5383b', '#ffffff', '#2e9a4a'], ['#7b6cf6', '#e0f2ff', '#ffd23f'], ['#ffb3d9', '#ffffff', '#c77dff'], ['#1b2a4a', '#bfe9ff', '#ffffff'], ['#2e9a4a', '#e5383b', '#ffd23f'], ['#f4f1ea', '#c1121f', '#1b1020'], ['#8fd3f7', '#c77dff', '#ffffff']] },
  { id: 'wiosna', nazwa: 'Wiosna', emoji: '🌸', los: 'Wiosenny strój', opis: 'Kwiaty, wróżki, króliczki i pastele', tlo: 'las-wrozek', skora: 'wrozka', dzw: 'magia',
    tagi: ['wiosna', 'wrozka', 'las', 'kwiaty', 'paryz'],
    kolory: [['#a0e7c0', '#ffb3d9', '#fff3b0'], ['#ffb3d9', '#ffffff', '#c77dff'], ['#fff3b0', '#ff8fc7', '#5fd068'], ['#c9b6e8', '#ffffff', '#ffd23f'], ['#bfe9ff', '#ffb3d9', '#ffffff']] },
  { id: 'lato', nazwa: 'Lato', emoji: '☀️', los: 'Letni strój', opis: 'Plaża, syreny i wakacje', tlo: 'plaza', skora: 'syrena', dzw: 'magia',
    tagi: ['lato', 'plaza', 'syrena'],
    kolory: [['#ffd23f', '#ff5d8f', '#4cc9f0'], ['#4cc9f0', '#ffffff', '#ffd23f'], ['#2ec4b6', '#c77dff', '#ff8fc7'], ['#ff7a3d', '#fff3b0', '#2ec4b6'], ['#ff5d8f', '#ffffff', '#5fd068']] },
  { id: 'jesien', nazwa: 'Jesień', emoji: '🎃', los: 'Halloween', opis: 'Halloween: czarownice, wampiry i dynie', tlo: 'halloween-dynie', skora: null, dzw: 'straszny',
    tagi: ['halloween', 'jesien'],
    kolory: [['#1b1020', '#ff8a1f', '#7b2cbf'], ['#3b2a5a', '#5fd068', '#ff8a1f'], ['#5c0a1e', '#1b1020', '#ffd23f'], ['#2b1d3a', '#c77dff', '#ff8fc7'], ['#ff8a1f', '#1b1020', '#5fd068']] },
];
export const SEZON = Object.fromEntries(SEZONY.map(s => [s.id, s]));
export const wSezonie = (el, sezon) => !!(sezon && el?.tagi?.some(t => SEZON[sezon]?.tagi.includes(t)));

// Zestawy kolorów do losowania – pasują do siebie, więc los nie robi „pstrokacizny”.
export const ZESTAWY_KOLOROW = [
  ['#ff8fc7', '#ffffff', '#c77dff'], ['#1b1020', '#ff8a1f', '#7b2cbf'], ['#4cc9f0', '#ffffff', '#ffd23f'], ['#c1121f', '#1b1020', '#ffd23f'],
  ['#a0e7c0', '#ffb3d9', '#fff3b0'], ['#7b6cf6', '#ffd23f', '#ffffff'], ['#2ec4b6', '#c77dff', '#ff8fc7'], ['#ffd23f', '#ff5d8f', '#4cc9f0'],
  ['#5b8def', '#ffffff', '#ff5d8f'], ['#3b2a5a', '#5fd068', '#ff8a1f'], ['#e5383b', '#ffffff', '#1b1020'], ['#f4f1ea', '#c58556', '#3b2418'],
];
