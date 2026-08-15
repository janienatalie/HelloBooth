// hash-password.js
const bcrypt = require("bcrypt");

const passwordAsli = "admin"; // Ganti dengan password yang Anda inginkan
const saltRounds = 10;

bcrypt.hash(passwordAsli, saltRounds, (err, hash) => {
  if (err) {
    console.error("Gagal melakukan hashing:", err);
    return;
  }
  console.log("--- HASIL HASHING ANDA ---");
  console.log(hash);
  console.log("--------------------------");
});
