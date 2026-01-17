// WORDLE-BİDB - jQuery + Bootstrap ile Mini Wordle
// Başlangıç seviyesi için sade kod

$(function () {
  // ========== EKRANA SIĞDIRMA (TAŞMA OLMASIN) ==========
  // Amaç: Header/Footer sabitken, oyun kutusu her ekranda tek sayfaya sığsın.
  // Sığmıyorsa .game-shell otomatik ölçeklenir.
  function fitGameToViewport() {
    var shell = document.querySelector(".game-shell");
    var main = document.querySelector("main");
    if (!shell || !main) return;

    // Önce ölçeği sıfırla ki gerçek ölçüyü hesaplayalım
    shell.style.transform = "none";

    var shellRect = shell.getBoundingClientRect();
    var mainRect = main.getBoundingClientRect();

    var availableW = Math.max(0, mainRect.width);
    var availableH = Math.max(0, mainRect.height);

    if (shellRect.width <= 0 || shellRect.height <= 0) return;

    var scaleW = availableW / shellRect.width;
    var scaleH = availableH / shellRect.height;
    var scale = Math.min(1, scaleW, scaleH);

    // Çok küçük ekranlarda bile taşma olmaması için gerekirse daha da küçült
    if (!isFinite(scale) || scale <= 0) scale = 1;

    shell.style.transform = "scale(" + scale + ")";
  }

  // Resize sırasında aşırı çağrıyı azaltmak için basit debounce
  var fitTimer = null;
  function scheduleFit() {
    if (fitTimer) clearTimeout(fitTimer);
    fitTimer = setTimeout(fitGameToViewport, 50);
  }

  // ========== KELİME LİSTESİ ==========
  // 5 harfli Türkçe kelimeler (büyük harf)
  var wordList = [
    "ELMAS",
    "KALEM",
    "BAHÇE",
    "DÜNYA",
    "GÜNEŞ",
    "KALIP",
    "MASAL",
    "PASTA",
    "SALON",
    "TABLO",
    "VATAN",
    "YATAK",
    "ZAMAN",
    "ÇANTA",
    "ŞEKER",
    "KÖPRÜ",
    "ÖRDEK",
    "ÜLKELER".slice(0, 5),
    "İNSAN",
    "GÜZEL",
  ];

  // ========== OYUN DEĞİŞKENLERİ ==========
  var maxRows = 6; // 6 tahmin hakkı
  var maxCols = 5; // 5 harfli kelime
  var currentRow = 0; // Şu anki satır (0-5)
  var currentCol = 0; // Şu anki sütun (0-4)
  var isGameOver = false;
  var secret = ""; // Tahmin edilecek kelime
  var grid = []; // 6x5 harf matrisi
  var letterStatus = {}; // Klavye renkleri için: harf -> durum

  // İzin verilen harfler (Türkçe dahil)
  var allowedLetters = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ";

  // ========== YARDIMCI FONKSİYONLAR ==========

  // Rastgele kelime seç
  function pickRandomWord() {
    var index = Math.floor(Math.random() * wordList.length);
    return wordList[index];
  }

  // Boş grid oluştur
  function createEmptyGrid() {
    var newGrid = [];
    for (var r = 0; r < maxRows; r++) {
      var row = [];
      for (var c = 0; c < maxCols; c++) {
        row.push("");
      }
      newGrid.push(row);
    }
    return newGrid;
  }

  // Mesaj göster (Bootstrap Alert)
  function showMessage(text, type) {
    var $status = $("#status");
    $status.removeClass(
      "d-none alert-info alert-success alert-warning alert-danger"
    );
    $status.addClass("alert-" + (type || "info"));
    $status.text(text);
    scheduleFit();
  }

  // Mesajı gizle
  function hideMessage() {
    $("#status").addClass("d-none").text("");
    scheduleFit();
  }

  // Hücreyi bul ve içeriğini güncelle
  function renderCell(row, col, letter) {
    var $cell = $('#board [data-row="' + row + '"][data-col="' + col + '"]');
    $cell.text(letter);
  }

  // Hücreye durum class'ı ekle
  function setCellState(row, col, state) {
    var $cell = $('#board [data-row="' + row + '"][data-col="' + col + '"]');
    $cell.removeClass("is-correct is-present is-absent");
    if (state) {
      $cell.addClass("is-" + state);
    }
  }

  // Klavye tuşuna durum class'ı ekle (öncelik: correct > present > absent)
  function setKeyState(letter, state) {
    var currentState = letterStatus[letter];

    // Öncelik kontrolü: correct en yüksek, sonra present, sonra absent
    if (currentState === "correct") {
      return; // Zaten yeşil, değiştirme
    }
    if (currentState === "present" && state === "absent") {
      return; // Sarı varken griye düşürme
    }

    letterStatus[letter] = state;

    var $key = $('#keyboard [data-key="' + letter + '"]');
    $key.removeClass("is-correct is-present is-absent");
    $key.addClass("is-" + state);
  }

  // ========== OYUN MANTIĞI ==========

  // Harf ekle
  function handleLetter(letter) {
    if (isGameOver) return;
    if (currentCol >= maxCols) return; // Satır dolu

    grid[currentRow][currentCol] = letter;
    renderCell(currentRow, currentCol, letter);
    currentCol++;
  }

  // Harf sil
  function handleBackspace() {
    if (isGameOver) return;
    if (currentCol <= 0) return; // Satır boş

    currentCol--;
    grid[currentRow][currentCol] = "";
    renderCell(currentRow, currentCol, "");
  }

  // Enter: Tahmini değerlendir
  function handleEnter() {
    if (isGameOver) return;

    // 5 harf girilmeli
    if (currentCol < maxCols) {
      showMessage("5 harf girmelisin!", "warning");
      return;
    }

    // Tahmini al
    var guess = grid[currentRow].join("");

    // Değerlendir (two-pass algoritma)
    var result = evaluateGuess(guess, secret);

    // Hücreleri renklendir
    for (var c = 0; c < maxCols; c++) {
      setCellState(currentRow, c, result[c]);
      setKeyState(guess[c], result[c]);
    }

    // Kazandı mı?
    if (guess === secret) {
      showMessage("Tebrikler! Doğru tahmin: " + secret, "success");
      isGameOver = true;
      return;
    }

    // Son satır mıydı?
    currentRow++;
    if (currentRow >= maxRows) {
      showMessage("Oyun bitti! Kelime: " + secret, "danger");
      isGameOver = true;
      return;
    }

    // Yeni satıra geç
    currentCol = 0;
    hideMessage();
  }

  // ========== DEĞERLENDİRME (TWO-PASS) ==========
  // Tekrar eden harfleri doğru boyamak için iki geçişli algoritma

  function evaluateGuess(guess, secret) {
    var result = [];
    var secretCounts = {}; // Her harfin kaç kez geçtiği

    // Başlangıç: hepsi "absent"
    for (var i = 0; i < maxCols; i++) {
      result.push("absent");
    }

    // Secret'teki harf sayılarını hesapla
    for (var i = 0; i < secret.length; i++) {
      var letter = secret[i];
      if (secretCounts[letter]) {
        secretCounts[letter]++;
      } else {
        secretCounts[letter] = 1;
      }
    }

    // Geçiş 1: Doğru yerdeki harfler (yeşil)
    for (var i = 0; i < maxCols; i++) {
      if (guess[i] === secret[i]) {
        result[i] = "correct";
        secretCounts[guess[i]]--; // Bu harfi kullandık
      }
    }

    // Geçiş 2: Yanlış yerde olan harfler (sarı)
    for (var i = 0; i < maxCols; i++) {
      if (result[i] === "correct") continue; // Zaten yeşil

      var letter = guess[i];
      if (secretCounts[letter] && secretCounts[letter] > 0) {
        result[i] = "present";
        secretCounts[letter]--; // Bu harfi kullandık
      }
      // Yoksa "absent" kalır
    }

    return result;
  }

  // ========== OYUNU SIFIRLA ==========

  function resetGame() {
    // Yeni kelime seç
    secret = pickRandomWord();
    console.log("Gizli kelime:", secret); // Debug için

    // State'i sıfırla
    currentRow = 0;
    currentCol = 0;
    isGameOver = false;
    grid = createEmptyGrid();
    letterStatus = {};

    // Tahtayı temizle
    $("#board .col").each(function () {
      $(this).text("");
      $(this).removeClass("is-correct is-present is-absent");
    });

    // Klavyeyi temizle
    $("#keyboard .letter-box").each(function () {
      $(this).removeClass("is-correct is-present is-absent");
    });

    // Mesajı gizle
    hideMessage();

    // İçerik değişti, tekrar sığdır
    scheduleFit();
  }

  // ========== OLAY DİNLEYİCİLERİ (jQuery) ==========

  // Sanal klavye tıklaması (delegation)
  $("#keyboard").on("click", ".letter-box", function () {
    var $key = $(this);

    // Harf tuşu mu?
    var letter = $key.data("key");
    if (letter) {
      handleLetter(letter);
      return;
    }

    // Özel tuş mu?
    var action = $key.data("action");
    if (action === "enter") {
      handleEnter();
    } else if (action === "backspace") {
      handleBackspace();
    }
  });

  // Fiziksel klavye (keydown)
  $(document).on("keydown", function (e) {
    if (isGameOver) return;

    var key = e.key;

    // Enter tuşu
    if (key === "Enter") {
      e.preventDefault();
      handleEnter();
      return;
    }

    // Backspace tuşu
    if (key === "Backspace") {
      e.preventDefault();
      handleBackspace();
      return;
    }

    // Harf tuşu (Türkçe uyumlu büyük harfe çevir)
    var letter = key.toLocaleUpperCase("tr-TR");

    // İzinli harf mi?
    if (letter.length === 1 && allowedLetters.indexOf(letter) !== -1) {
      handleLetter(letter);
    }
  });

  // Reset butonu
  $("#resetBtn").on("click", function () {
    resetGame();
  });

  // ========== OYUNU BAŞLAT ==========
  resetGame();
  console.log("WORDLE-BİDB başladı!");

  // İlk yüklemede ve ekran boyutu değişince sığdır
  scheduleFit();
  $(window).on("resize orientationchange", function () {
    scheduleFit();
  });
});
