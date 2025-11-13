function simulate() {
  const demand = parseInt(document.getElementById("demand").value);
  const capacity = parseInt(document.getElementById("capacity").value);
  let inventory = parseInt(document.getElementById("inventory").value);

  let output = "";
  for (let week = 1; week <= 4; week++) {
    let production = Math.min(capacity, demand);
    inventory = inventory + production - demand;
    output += `Minggu ${week}: Produksi = ${production}, Persediaan Akhir = ${inventory}<br>`;
  }
  document.getElementById("result").innerHTML = output;
}

function quiz(answer) {
  let result = "";
  if (answer === 2) {
    result = "✅ Benar! Tujuan utama perencanaan produksi adalah menjamin ketersediaan produk.";
  } else {
    result = "❌ Salah. Coba lagi!";
  }
  document.getElementById("quiz-result").innerHTML = result;
}
