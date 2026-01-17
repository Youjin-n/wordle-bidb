// WORDLE-BİDB - Basit Oyun Kodları

// Sayfa yüklendiğinde çalış
console.log("WORDLE-BİDB başladı!");

// Kutuları seç
const letterBoxes = document.querySelectorAll(".letter-box");

// Her kutunun üzerine tıklandığında renk değiştir
letterBoxes.forEach((box) => {
  box.addEventListener("click", function () {
    this.style.backgroundColor = "#4CAF50";
    this.style.color = "white";
  });
});

// Basitlik için ekstra değişkenler ve fonksiyonlar kaldırıldı
