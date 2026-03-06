$(function () {
  // ===== Constants =====
  const MAX_ROWS = 6;
  const WORD_LENGTH = 5;
  const FLIP_DELAY_MS = 300;
  const TOAST_DURATION_MS = 2500;
  const STATS_SHOW_DELAY_MS = 1800;

  const wordleKelimeler = {
    kolay: [
      "kalem",
      "deniz",
      "kitap",
      "dolap",
      "tabak",
      "yatak",
      "sepet",
      "kapak",
      "insan",
      "araba",
      "bayır",
      "boyut",
      "çanta",
      "daire",
      "ekmek",
      "fırın",
      "gölge",
      "haber",
      "ilham",
      "kanat",
      "limon",
      "masal",
      "nehir",
      "olmak",
      "perde",
      "resim",
      "salon",
      "tarih",
      "uyuma",
      "vakit",
      "yolcu",
      "zaman",
      "bahçe",
      "çiçek",
      "dünya",
    ],
    orta: [
      "serin",
      "yamaç",
      "durak",
      "merak",
      "soluk",
      "tavan",
      "kiler",
      "sokak",
      "neden",
      "arıza",
      "bölge",
      "çelik",
      "dikey",
      "engel",
      "fesih",
      "güven",
      "hakim",
      "istem",
      "jesit",
      "kayıp",
      "lanet",
      "misal",
      "nöbet",
      "örnek",
      "psibi",
      "raspa",
      "sözel",
      "terim",
      "ürpeç",
      "vasat",
      "yoğun",
      "zemin",
      "açlık",
      "bilek",
      "çözüm",
    ],
    zor: [
      "çınar",
      "yığın",
      "büküm",
      "pütür",
      "oylum",
      "kıvam",
      "sıfır",
      "zihin",
      "devim",
      "kısım",
      "akışı",
      "bükme",
      "çelme",
      "düğüm",
      "eğlip",
      "fırça",
      "gürün",
      "hışır",
      "içgüt",
      "kırıt",
      "lığım",
      "meşin",
      "nüfuz",
      "öğüdü",
      "püsür",
      "rütbe",
      "sürgü",
      "tümce",
      "üflem",
      "vızır",
      "yüzey",
      "züğüt",
      "gövde",
      "bölük",
      "çürük",
    ],
  };

  const harfler = ["ERTYUIOPĞÜ", "ASDFGHJKLŞİ", "↵ZXCVBNMÖÇ⌫"];
  const tumHarfler = new Set(harfler.join(""));

  // ===== State =====
  let satir = 0;
  let sutun = 0;
  let bitti = false;
  let gizliKelime = "";
  let mevcutZorluk = "";

  // ===== Statistics (localStorage) =====
  const STATS_KEY = "wordle-bidb-stats";
  const PLAYED_KEY = "wordle-bidb-played";

  const getStats = () => {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) {
      return {
        played: 0,
        won: 0,
        currentStreak: 0,
        maxStreak: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
      };
    }
    return JSON.parse(raw);
  };

  const saveStats = (stats) => {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  };

  const getPlayedWords = () => {
    const raw = localStorage.getItem(PLAYED_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  };

  const savePlayedWord = (zorluk, kelime) => {
    const played = getPlayedWords();
    if (!played[zorluk]) played[zorluk] = [];
    if (!played[zorluk].includes(kelime)) {
      played[zorluk].push(kelime);
    }
    localStorage.setItem(PLAYED_KEY, JSON.stringify(played));
  };

  const recordWin = (guessCount) => {
    const stats = getStats();
    stats.played++;
    stats.won++;
    stats.currentStreak++;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    stats.distribution[guessCount]++;
    saveStats(stats);
  };

  const recordLoss = () => {
    const stats = getStats();
    stats.played++;
    stats.currentStreak = 0;
    saveStats(stats);
  };

  // ===== Toast Notification =====
  const showToast = (message, type = "") => {
    const container = $("#toast-container");
    const toast = $("<div>").addClass("toast").text(message);
    if (type) toast.addClass(type);
    container.append(toast);

    setTimeout(() => {
      toast.remove();
    }, TOAST_DURATION_MS);
  };

  // ===== Word Selection (avoid repeats) =====
  const rastgeleKelimeSec = (zorluk) => {
    const liste = wordleKelimeler[zorluk];
    const played = getPlayedWords();
    const playedList = played[zorluk] || [];

    // Filter out already played words
    let available = liste.filter(
      (k) => !playedList.includes(k.toLocaleUpperCase("tr-TR")),
    );

    // Reset if all words played
    if (available.length === 0) {
      if (played[zorluk]) played[zorluk] = [];
      localStorage.setItem(PLAYED_KEY, JSON.stringify(played));
      available = liste;
    }

    const chosen = available[Math.floor(Math.random() * available.length)];
    return chosen.toLocaleUpperCase("tr-TR");
  };

  // ===== UI Builders =====
  const oyunArayuzu = () => {
    $("#zorlukEkrani").css("display", "none");
    $("#game-container").css("display", "flex");

    const harfKutusu = $("#harf-kutusu");
    harfKutusu.empty();

    for (let i = 0; i < MAX_ROWS; i++) {
      const harfKutusuRow = $("<div>")
        .addClass("harf-kutusu-row")
        .data("key", "harf-kutusu-row-" + i);

      for (let j = 0; j < WORD_LENGTH; j++) {
        const harfKutusuHucre = $("<div>")
          .addClass("harf-kutusu-hucre")
          .data("key", "hucre-" + i + j);
        harfKutusuRow.append(harfKutusuHucre);
      }
      harfKutusu.append(harfKutusuRow);
    }

    const klavye = $("#klavye");
    klavye.empty();

    harfler.forEach((klavyeSatir) => {
      const klavyeRow = $("<div>").addClass("klavye-row");
      for (let harf of klavyeSatir) {
        const klavyeTus = $("<button>").text(harf).addClass("klavye-box");
        switch (harf) {
          case "↵":
            klavyeTus.data("key", "ENTER");
            break;
          case "⌫":
            klavyeTus.data("key", "BACKSPACE");
            break;
          default:
            klavyeTus.data("key", harf);
        }
        klavyeRow.append(klavyeTus);
      }
      klavye.append(klavyeRow);
    });
  };

  // ===== Event Listeners =====
  const zorlukDinle = () => {
    $("#zorlukEkrani").on("click", "button", (e) => {
      const zorluk = $(e.target).data("zorluk");
      if (zorluk) {
        mevcutZorluk = zorluk;
        gizliKelime = rastgeleKelimeSec(zorluk);
        $("#zorlukEkrani").off("click");
        oyunArayuzu();
        fizikselklavyeDinle();
        sanalKlavyeDinle();
        yenidenOynaDinle();
      }
    });
  };

  const sanalKlavyeDinle = () => {
    $("#klavye")
      .off("click")
      .on("click", "button.klavye-box", (e) => {
        const basılanTus = $(e.target).data("key");
        tusIsle(basılanTus);
      });
  };

  const fizikselklavyeDinle = () => {
    $(document).on("keydown", (e) => {
      const tus = e.key.toLocaleUpperCase("tr-TR");
      if (tumHarfler.has(tus) || tus === "ENTER" || tus === "BACKSPACE") {
        tusIsle(tus);
      }
    });
  };

  const yenidenOynaDinle = () => {
    $(".yenidenOyna")
      .off("click")
      .on("click", () => {
        oyunaBasla();
      });
  };

  // ===== Input Handler =====
  const tusIsle = (finalTus) => {
    if (bitti) return;
    switch (finalTus) {
      case "ENTER":
        kontrolEt();
        break;
      case "BACKSPACE":
        harfSilme();
        break;
      default:
        ekranaYazdır(finalTus);
    }
  };

  // ===== Cell & Key Helpers =====
  const hucreGetir = (s, k) => {
    return $(".harf-kutusu-hucre").filter(function () {
      return $(this).data("key") === "hucre-" + s + k;
    });
  };

  const klavyeBoxGetir = (harfKey) => {
    return $(".klavye-box").filter(function () {
      return $(this).data("key") === harfKey;
    });
  };

  const klavyeBoxRenkle = (harf, yeniDurum) => {
    if (!harf) return;
    const tus = klavyeBoxGetir(harf);
    if (tus.hasClass("correct")) return;
    if (tus.hasClass("present") && yeniDurum !== "correct") return;
    tus.removeClass("correct present absent").addClass(yeniDurum);
  };

  // ===== Core Game Logic =====
  const kontrolEt = () => {
    if (bitti) return;

    if (sutun < WORD_LENGTH) {
      const satirRow = $(".harf-kutusu-row").eq(satir);
      satirRow.addClass("shake");
      satirRow.one("animationend", function () {
        $(this).removeClass("shake");
      });
      showToast("Yetersiz harf!", "error");
      return;
    }

    let tahmin = "";
    for (let j = 0; j < WORD_LENGTH; j++) {
      tahmin += hucreGetir(satir, j).text();
    }

    const gizliHarfler = gizliKelime.split("");
    const tahminHarfler = tahmin.split("");
    const sonuc = Array(WORD_LENGTH).fill("absent");

    // First pass: check correct positions
    for (let j = 0; j < WORD_LENGTH; j++) {
      if (tahminHarfler[j] === gizliHarfler[j]) {
        sonuc[j] = "correct";
        gizliHarfler[j] = null;
        tahminHarfler[j] = null;
      }
    }

    // Second pass: check present letters
    for (let j = 0; j < WORD_LENGTH; j++) {
      if (tahminHarfler[j] === null) continue;
      const idx = gizliHarfler.indexOf(tahminHarfler[j]);
      if (idx !== -1) {
        sonuc[j] = "present";
        gizliHarfler[idx] = null;
      }
    }

    // Apply results with flip animation
    const originalTahmin = tahmin.split("");
    for (let j = 0; j < WORD_LENGTH; j++) {
      const cell = hucreGetir(satir, j);
      const delay = j * FLIP_DELAY_MS;

      setTimeout(() => {
        cell.addClass("reveal");

        // Apply color at animation midpoint
        setTimeout(() => {
          cell.addClass(sonuc[j]);
          klavyeBoxRenkle(originalTahmin[j], sonuc[j]);
        }, 250);
      }, delay);
    }

    // After all flips complete
    const totalFlipTime = WORD_LENGTH * FLIP_DELAY_MS + 500;

    setTimeout(() => {
      if (tahmin === gizliKelime) {
        bitti = true;
        savePlayedWord(mevcutZorluk, gizliKelime);
        recordWin(satir + 1);

        // Win dance animation
        for (let j = 0; j < WORD_LENGTH; j++) {
          setTimeout(() => {
            hucreGetir(satir, j).addClass("dance");
          }, j * 100);
        }

        showToast("Tebrikler! 🎉", "success");
        setTimeout(() => showStatsModal(satir + 1), STATS_SHOW_DELAY_MS);
        return;
      }

      satir++;
      sutun = 0;

      if (satir >= MAX_ROWS) {
        bitti = true;
        savePlayedWord(mevcutZorluk, gizliKelime);
        recordLoss();
        showToast("Kelime: " + gizliKelime, "error");
        setTimeout(() => showStatsModal(null), STATS_SHOW_DELAY_MS);
      }
    }, totalFlipTime);
  };

  const harfSilme = () => {
    if (bitti || sutun <= 0) return;
    sutun--;
    const cell = hucreGetir(satir, sutun);
    cell.text("").removeClass("filled");
  };

  const ekranaYazdır = (yazdırılanTus) => {
    if (bitti || sutun >= WORD_LENGTH) return;
    const cell = hucreGetir(satir, sutun);
    cell.text(yazdırılanTus).addClass("filled");
    sutun++;
  };

  // ===== Statistics Modal =====
  const showStatsModal = (winRow) => {
    const stats = getStats();
    const winPct =
      stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;

    $("#stat-played").text(stats.played);
    $("#stat-win-pct").text(winPct);
    $("#stat-streak").text(stats.currentStreak);
    $("#stat-max-streak").text(stats.maxStreak);

    // Build distribution
    const distContainer = $("#distribution");
    distContainer.empty();

    const maxDist = Math.max(...Object.values(stats.distribution), 1);

    for (let i = 1; i <= MAX_ROWS; i++) {
      const count = stats.distribution[i] || 0;
      const width = Math.max((count / maxDist) * 100, 8);
      const isHighlight = winRow === i;

      const row = $("<div>").addClass("distribution-bar-container");
      row.append($("<span>").addClass("bar-label").text(i));
      row.append(
        $("<div>")
          .addClass("distribution-bar" + (isHighlight ? " highlight" : ""))
          .css("width", width + "%")
          .text(count),
      );
      distContainer.append(row);
    }

    $("#stats-overlay").addClass("active");

    // Close handlers
    $("#stats-close-btn")
      .off("click")
      .on("click", () => {
        $("#stats-overlay").removeClass("active");
        oyunaBasla();
      });

    $("#stats-overlay")
      .off("click")
      .on("click", (e) => {
        if ($(e.target).is("#stats-overlay")) {
          $("#stats-overlay").removeClass("active");
        }
      });
  };

  // ===== Game Start =====
  const oyunaBasla = () => {
    $(document).off("keydown");
    $("#game-container").css("display", "none");
    $("#zorlukEkrani").css("display", "flex");
    $("#stats-overlay").removeClass("active");
    satir = 0;
    sutun = 0;
    bitti = false;
    gizliKelime = "";
    zorlukDinle();
  };

  oyunaBasla();
});
