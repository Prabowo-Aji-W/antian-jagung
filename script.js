/* =========================================================
   ANTRIAN JAGUNG - SCRIPT.JS
   Logika kasir: hitung total, nomor antrian, simpan ke
   Google Spreadsheet lewat Google Apps Script (Web App).
   ========================================================= */

// =========================================================
// KONFIGURASI
// =========================================================

// GANTI URL INI dengan URL Web App hasil deploy Google Apps Script (Code.gs)
// Contoh: https://script.google.com/macros/s/XXXXXXXXXXXXXXXXX/exec
const API_URL = "https://script.google.com/macros/s/AKfycbxRDr9aQ_9qu36bX7wp48DzyUFn4RdOuM1VJBY0OwrEOe2_-FpHzZAaP1jHGuAy6R2J/exec";

// Daftar harga menu (mudah diubah di sini)
const HARGA = {
  bakarOriginal: { nama: "Jagung Bakar Original", harga: 8000 },
  bakarRasa: { nama: "Jagung Bakar Rasa", harga: 9000 },
  bakar3Rasa: { nama: "Jagung Bakar 3 Rasa", harga: 10000 },
  bakarCoklat: { nama: "Jagung Bakar Coklat/Custom", harga: 11000 },
  manisOriginal: { nama: "Jagung Manis Original", harga: 7000 },
  manisRasa: { nama: "Jagung Manis Rasa", harga: 9000 },
  manisCoklat: { nama: "Jagung Manis Coklat", harga: 11000 },
  cornRibs: { nama: "Corn Ribs", harga: 9000 },
};

// State jumlah pesanan saat ini
let cart = {
  bakarOriginal: 0,
  bakarRasa: 0,
  bakar3Rasa: 0,
  bakarCoklat: 0,
  manisOriginal: 0,
  manisRasa: 0,
  manisCoklat: 0,
  cornRibs: 0,
};

let nomorAntrianSaatIni = "A001"; // akan diperbarui dari Spreadsheet

// =========================================================
// UTIL: FORMAT RUPIAH
// =========================================================
function formatRupiah(angka) {
  return "Rp" + Number(angka).toLocaleString("id-ID");
}

// =========================================================
// UTIL: FORMAT NOMOR ANTRIAN (A001, A002, ...)
// =========================================================
function formatNomorAntrian(nomorTerakhir) {
  // nomorTerakhir bisa berupa "A007" atau angka 7
  let angka = 1;
  if (typeof nomorTerakhir === "string" && nomorTerakhir.startsWith("A")) {
    angka = parseInt(nomorTerakhir.substring(1), 10) + 1;
  } else if (!isNaN(nomorTerakhir)) {
    angka = parseInt(nomorTerakhir, 10) + 1;
  }
  if (isNaN(angka) || angka < 1) angka = 1;
  return "A" + String(angka).padStart(3, "0");
}

// =========================================================
// AMBIL NOMOR ANTRIAN TERAKHIR DARI SPREADSHEET SAAT LOAD
// =========================================================
async function muatNomorAntrian() {
  try {
    const res = await fetch(`${API_URL}?action=getLastQueue`);
    const data = await res.json();
    if (data && data.lastQueue) {
      nomorAntrianSaatIni = formatNomorAntrian(data.lastQueue);
    } else {
      nomorAntrianSaatIni = "A001";
    }
  } catch (err) {
    console.warn("Gagal memuat nomor antrian, memakai default A001:", err);
    nomorAntrianSaatIni = "A001";
  }
  document.getElementById("queueNumber").textContent = nomorAntrianSaatIni;
}

// =========================================================
// RENDER RINGKASAN & TOTAL
// =========================================================
function hitungDanRenderRingkasan() {
  const summaryList = document.getElementById("summaryList");
  let totalHarga = 0;
  let baris = "";

  Object.keys(cart).forEach((key) => {
    const jumlah = cart[key];
    if (jumlah > 0) {
      const subtotal = jumlah * HARGA[key].harga;
      totalHarga += subtotal;
      baris += `
        <div class="summary-line">
          <span class="label">${HARGA[key].nama} x${jumlah}</span>
          <span class="value">${formatRupiah(subtotal)}</span>
        </div>`;
    }
  });

  summaryList.innerHTML = baris || `<p class="text-muted small mb-0 empty-summary-msg">Belum ada pesanan dipilih.</p>`;
  document.getElementById("totalAmount").textContent = formatRupiah(totalHarga);

  return totalHarga;
}

// =========================================================
// EVENT: TOMBOL + / - PADA SETIAP MENU
// =========================================================
function pasangEventQty() {
  document.querySelectorAll(".menu-item").forEach((item) => {
    const key = item.dataset.key;
    const qtyValueEl = item.querySelector(".qty-value");
    const btnMinus = item.querySelector(".btn-minus");
    const btnPlus = item.querySelector(".btn-plus");

    btnPlus.addEventListener("click", () => {
      cart[key]++;
      qtyValueEl.textContent = cart[key];
      hitungDanRenderRingkasan();
    });

    btnMinus.addEventListener("click", () => {
      if (cart[key] > 0) {
        cart[key]--;
        qtyValueEl.textContent = cart[key];
        hitungDanRenderRingkasan();
      }
    });
  });
}

// =========================================================
// EVENT: PILIH METODE PEMBAYARAN
// =========================================================
function ambilMetodePembayaran() {
  const dipilih = document.querySelector('input[name="paymentMethod"]:checked');
  return dipilih ? dipilih.value : null;
}

// =========================================================
// RESET FORM KE KONDISI AWAL
// =========================================================
function resetForm() {
  Object.keys(cart).forEach((key) => (cart[key] = 0));
  document.querySelectorAll(".qty-value").forEach((el) => (el.textContent = "0"));
  document.querySelectorAll('input[name="paymentMethod"]').forEach((el) => (el.checked = false));
  document.getElementById("paymentSummaryLine").classList.add("d-none");
  hitungDanRenderRingkasan();
}

// =========================================================
// VALIDASI SEBELUM SIMPAN
// =========================================================
function validasiPesanan(total, metode) {
  if (total <= 0) {
    Swal.fire({
      icon: "warning",
      title: "Belum ada pesanan",
      text: "Silakan pilih minimal satu menu sebelum menyimpan.",
      confirmButtonColor: "#4CAF50",
    });
    return false;
  }
  if (!metode) {
    Swal.fire({
      icon: "warning",
      title: "Metode pembayaran belum dipilih",
      text: "Silakan pilih QRIS atau Cash terlebih dahulu.",
      confirmButtonColor: "#4CAF50",
    });
    return false;
  }
  return true;
}

// =========================================================
// SIMPAN TRANSAKSI KE GOOGLE SPREADSHEET
// =========================================================
async function simpanTransaksi() {
  const total = hitungDanRenderRingkasan();
  const metode = ambilMetodePembayaran();

  if (!validasiPesanan(total, metode)) return;

  const sekarang = new Date();
  const payload = {
    action: "simpanTransaksi",
    nomorAntrian: nomorAntrianSaatIni,
    tanggal: sekarang.toLocaleDateString("id-ID"),
    jam: sekarang.toLocaleTimeString("id-ID"),
    bakarOriginal: cart.bakarOriginal,
    bakarRasa: cart.bakarRasa,
    bakar3Rasa: cart.bakar3Rasa,
    bakarCoklat: cart.bakarCoklat,
    manisOriginal: cart.manisOriginal,
    manisRasa: cart.manisRasa,
    manisCoklat: cart.manisCoklat,
    cornRibs: cart.cornRibs,
    total: total,
    metodePembayaran: metode,
  };

  toggleLoading(true);

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" }, // hindari preflight CORS di Apps Script
      body: JSON.stringify(payload),
    });
    const hasil = await res.json();

    toggleLoading(false);

    if (hasil && hasil.status === "success") {
      Swal.fire({
        icon: "success",
        title: "Pesanan tersimpan!",
        html: `Nomor antrian <b>${nomorAntrianSaatIni}</b> berhasil disimpan.`,
        confirmButtonColor: "#4CAF50",
      });

      cetakStruk(payload);

      // Siapkan nomor antrian berikutnya & reset form
      nomorAntrianSaatIni = formatNomorAntrian(nomorAntrianSaatIni);
      document.getElementById("queueNumber").textContent = nomorAntrianSaatIni;
      resetForm();
      muatRiwayatDanStatistik();
    } else {
      throw new Error(hasil && hasil.message ? hasil.message : "Gagal menyimpan data");
    }
  } catch (err) {
    toggleLoading(false);
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "Gagal menyimpan",
      text: "Terjadi kesalahan saat menghubungi server. Periksa koneksi atau URL Web App.",
      confirmButtonColor: "#4CAF50",
    });
  }
}

// =========================================================
// LOADING OVERLAY
// =========================================================
function toggleLoading(tampilkan) {
  document.getElementById("loadingOverlay").classList.toggle("d-none", !tampilkan);
}

// =========================================================
// CETAK STRUK SEDERHANA
// =========================================================
function cetakStruk(payload) {
  const strukArea = document.getElementById("strukArea");
  let isiMenu = "";
  Object.keys(HARGA).forEach((key) => {
    if (payload[key] > 0) {
      isiMenu += `${HARGA[key].nama} x${payload[key]}  ${formatRupiah(HARGA[key].harga * payload[key])}\n`;
    }
  });

  strukArea.innerHTML = `
    <pre>
======================
     ANTRIAN JAGUNG
======================
No Antrian : ${payload.nomorAntrian}
Tanggal    : ${payload.tanggal}
Jam        : ${payload.jam}
----------------------
${isiMenu}----------------------
TOTAL      : ${formatRupiah(payload.total)}
Bayar      : ${payload.metodePembayaran}
======================
   Terima kasih!
======================
    </pre>`;
}

function cetakStrukManual() {
  window.print();
}

// =========================================================
// RIWAYAT TRANSAKSI & STATISTIK HARI INI
// =========================================================
async function muatRiwayatDanStatistik() {
  const tbody = document.getElementById("riwayatBody");
  try {
    const res = await fetch(`${API_URL}?action=getRiwayatHariIni`);
    const data = await res.json();

    if (!data || !data.riwayat) throw new Error("Data tidak ditemukan");

    // Render riwayat
    if (data.riwayat.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Belum ada transaksi hari ini.</td></tr>`;
    } else {
      tbody.innerHTML = data.riwayat
        .map((trx) => {
          const pesananRingkas = Object.keys(HARGA)
            .filter((key) => trx[key] > 0)
            .map((key) => `${HARGA[key].nama} x${trx[key]}`)
            .join(", ");
          return `
            <tr>
              <td><span class="badge bg-success">${trx.nomorAntrian}</span></td>
              <td>${trx.jam}</td>
              <td>${pesananRingkas}</td>
              <td>${formatRupiah(trx.total)}</td>
              <td>${trx.metodePembayaran}</td>
              <td><i class="bi bi-printer" role="button" title="Cetak ulang"></i></td>
            </tr>`;
        })
        .join("");
    }

    // Render statistik
    document.getElementById("statTransaksi").textContent = data.jumlahTransaksi || 0;
    document.getElementById("statOmzet").textContent = formatRupiah(data.totalOmzet || 0);
    document.getElementById("statTerlaris").textContent = data.menuTerlaris || "-";
  } catch (err) {
    console.warn("Gagal memuat riwayat/statistik:", err);
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Gagal memuat data. Periksa koneksi API.</td></tr>`;
  }
}

// =========================================================
// DARK MODE
// =========================================================
function pasangDarkMode() {
  const toggleBtn = document.getElementById("darkModeToggle");
  const icon = toggleBtn.querySelector("i");

  // Muat preferensi tersimpan
  if (localStorage.getItem("antrianJagungDarkMode") === "true") {
    document.body.classList.add("dark-mode");
    icon.classList.replace("bi-moon-stars-fill", "bi-sun-fill");
  }

  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const aktif = document.body.classList.contains("dark-mode");
    localStorage.setItem("antrianJagungDarkMode", aktif);
    icon.classList.toggle("bi-moon-stars-fill", !aktif);
    icon.classList.toggle("bi-sun-fill", aktif);
  });
}

// =========================================================
// EVENT PEMBAYARAN (highlight pilihan)
// =========================================================
function pasangEventPembayaran() {
  document.querySelectorAll('input[name="paymentMethod"]').forEach((input) => {
    input.addEventListener("change", () => {
      // Tampilkan metode yang dipilih di kartu Ringkasan, supaya kasir tetap
      // bisa lihat meskipun pembayaran dipilih di awal sebelum pilih menu.
      const baris = document.getElementById("paymentSummaryLine");
      const nilai = document.getElementById("paymentSummaryValue");
      nilai.textContent = input.value;
      baris.classList.remove("d-none");
    });
  });
}

// =========================================================
// INISIALISASI HALAMAN
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("tahunSekarang").textContent = new Date().getFullYear();

  pasangEventQty();
  pasangEventPembayaran();
  pasangDarkMode();
  hitungDanRenderRingkasan();

  document.getElementById("btnSimpan").addEventListener("click", simpanTransaksi);
  document.getElementById("btnReset").addEventListener("click", resetForm);
  document.getElementById("btnRefreshStat").addEventListener("click", muatRiwayatDanStatistik);
  document.getElementById("btnMuatRiwayat").addEventListener("click", muatRiwayatDanStatistik);

  muatNomorAntrian();
  muatRiwayatDanStatistik();
});
