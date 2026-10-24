// Konfiguracja Tailwind CSS 3 – styl.css budowany raz zamiast skryptu Tailwind z CDN w przeglądarce.
// Przebudowa (z folderu gra3-zombie):
//   npx tailwindcss@3.4.17 -c tailwind/tailwind.config.js -i tailwind/wejscie.css -o styl.css --minify
module.exports = {
    content: ['./index.html', './js/**/*.js'],
    theme: { extend: {} },
    plugins: []
};
