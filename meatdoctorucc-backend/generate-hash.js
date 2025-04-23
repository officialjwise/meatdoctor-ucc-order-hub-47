const bcrypt = require('bcryptjs');

async function generateHash() {
  const hash = await bcrypt.hash('Amoako@21', 10);
  console.log('Password Hash:', hash);
}

generateHash();