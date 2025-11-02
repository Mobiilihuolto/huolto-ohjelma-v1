const crypto = require('crypto');

function generateLicenseKey() {
  const segments = [];

  for (let i = 0; i < 4; i++) {
    const segment = crypto.randomBytes(2).toString('hex').toUpperCase();
    segments.push(segment);
  }

  return `HU-${segments.join('-')}`;
}

function generateMultipleLicenses(count = 1) {
  const licenses = [];

  for (let i = 0; i < count; i++) {
    licenses.push(generateLicenseKey());
  }

  return licenses;
}

const args = process.argv.slice(2);
const count = args.length > 0 ? parseInt(args[0], 10) : 1;

if (isNaN(count) || count < 1) {
  console.error('Virhe: Anna kelvollinen määrä (positiivinen kokonaisluku)');
  console.log('Käyttö: node generate-license.js [määrä]');
  console.log('Esimerkki: node generate-license.js 5');
  process.exit(1);
}

console.log('='.repeat(60));
console.log('HUOLTOSOVELLUS - LISENSSIEN GENEROINTI');
console.log('='.repeat(60));
console.log(`\nGeneroitu ${count} lisenssiavainta:\n`);

const licenses = generateMultipleLicenses(count);

licenses.forEach((license, index) => {
  console.log(`${index + 1}. ${license}`);
});

console.log('\n' + '='.repeat(60));
console.log('OHJEET:');
console.log('='.repeat(60));
console.log('1. Kopioi lisenssiavain asiakkaalle');
console.log('2. Asiakas syöttää avaimen sovellukseen ensimmäisellä käynnistyskerralla');
console.log('3. Sovellus aktivoituu ja toimii ilman rajoituksia');
console.log('4. Tallenna myydyt lisenssit Excel-taulukkoon tai tietokantaan');
console.log('='.repeat(60));
console.log('\nHUOM: Nämä avaimet ovat KERTAKÄYTTÖISIÄ.');
console.log('Älä jaa samaa avainta usealle asiakkaalle!\n');
