// ============================================================================
// APLIKASI KONSOL LAUNDRY BILLING CLI (src/index.ts)
// Mata Kuliah : Dasar Pemrograman (UAS - Proyek Tim)
// Kelas / Kel : T1-A / Kelompok 9
// ============================================================================

import * as readlineSync from "readline-sync";

// ----------------------------------------------------------------------------
// 1. DEFINISI TIPE DATA & DATA AWAL (SEED DATA)
// ----------------------------------------------------------------------------

// Struktur data utama untuk menyimpan informasi pesanan dan perhitungan tagihan laundry
interface LaundryOrder {
  id: string;
  customerName: string;
  phoneNumber: string;
  laundryCategory: string;
  serviceType: string;
  packageName: string;
  weight: number; // Berat cucian dalam kilogram (LW)
  pricePerKg: number; // Tarif per kilogram (PPK)
  paymentMethod: string;
  paymentMethodFee: number; // Biaya tambahan metode pembayaran (PMF)
  subtotal: number; // Subtotal sebelum diskon (SUB)
  discount: number; // Potongan harga/diskon (D)
  totalPrice: number; // Total tagihan akhir / Total Payment (TP)
  paymentAmount: number; // Jumlah uang yang dibayarkan pelanggan (PA)
  change: number; // Kembalian pelanggan (CH)
  isPaid: boolean; // Status pembayaran lunas atau belum
  status: string; // Status proses laundry (Pending, In Progress, Completed)
}

// Konstanta tarif layanan dan potongan harga dasar
const REGULAR_PRICE_PER_KG = 7000;
const EXPRESS_PRICE_PER_KG = 12000;
const DISCOUNT_THRESHOLD_KG = 10;
const DISCOUNT_RATE = 0.1; // Diskon 10% jika berat >= 10 kg dan sudah lunas

// Data contoh awal agar fitur menu, kalkulasi, dan tampilan konsol bisa langsung diuji
const laundryOrders: LaundryOrder[] = [
  {
    id: "LD-001",
    customerName: "Budi Santoso",
    phoneNumber: "081234567890",
    laundryCategory: "Pakaian Harian",
    serviceType: "Regular",
    packageName: "Cuci Lipat Reguler",
    weight: 5,
    pricePerKg: REGULAR_PRICE_PER_KG,
    paymentMethod: "QRIS",
    paymentMethodFee: 0,
    subtotal: 35000,
    discount: 0,
    totalPrice: 35000,
    paymentAmount: 50000,
    change: 15000,
    isPaid: true,
    status: "Completed",
  },
  {
    id: "LD-002",
    customerName: "Siti Aminah",
    phoneNumber: "085678901234",
    laundryCategory: "Pakaian Harian",
    serviceType: "Express",
    packageName: "Cuci Setrika Kilat",
    weight: 12,
    pricePerKg: EXPRESS_PRICE_PER_KG,
    paymentMethod: "Tunai",
    paymentMethodFee: 0,
    subtotal: 144000,
    discount: 14400,
    totalPrice: 129600,
    paymentAmount: 130000,
    change: 400,
    isPaid: true,
    status: "In Progress",
  },
];

// ----------------------------------------------------------------------------
// 2. FUNGSI BERTIPE DATA (OPERATOR, KONDISIONAL, & PERHITUNGAN)
// ----------------------------------------------------------------------------

// Menghitung rincian biaya laundry menggunakan operator aritmatika, perbandingan, dan logika
function calculateBillingSummary(
  weight: number,
  pricePerKg: number,
  paymentMethodFee: number,
  paymentAmount: number,
  isPaid: boolean
): {
  initialLaundryCost: number;
  subtotal: number;
  discount: number;
  totalPrice: number;
  change: number;
} {
  // Menghitung biaya awal cucian (ILC = LW * PPK) serta subtotal (SUB = ILC + PMF)
  const initialLaundryCost: number = weight * pricePerKg;
  let subtotal: number = initialLaundryCost + paymentMethodFee;

  // Menggunakan operator assignment majemuk (+=) untuk penyesuaian biaya administrasi kecil jika diperlukan
  let discount: number = 0;

  // Kondisi majemuk (&&): diskon berlaku jika berat memenuhi batas minimal dan status pembayaran lunas
  if (weight >= DISCOUNT_THRESHOLD_KG && isPaid === true) {
    discount = subtotal * DISCOUNT_RATE;
  } else if (weight > 0 && subtotal > 200000 && !isPaid) {
    // Contoh kondisi lain dengan operator logika negasi (!) dan perbandingan (>)
    discount = 5000;
  }

  // Menghitung total pembayaran akhir (TP = SUB - D)
  let totalPrice: number = subtotal - discount;
  if (totalPrice < 0) {
    totalPrice = 0;
  }

  // Menghitung kembalian (CH = PA - TP); jika belum lunas atau uang kurang, kembalian 0
  let change: number = 0;
  if (isPaid && paymentAmount >= totalPrice) {
    change = paymentAmount - totalPrice;
  }

  // Contoh penggunaan operator modulus (%) untuk mengecek kelipatan berat genap/ganjil
  const isEvenWeight: boolean = weight % 2 === 0;
  if (!isEvenWeight && totalPrice > 0) {
    subtotal += 0; // Menjaga konsistensi nilai subtotal pada berat ganjil
  }

  return {
    initialLaundryCost,
    subtotal,
    discount,
    totalPrice,
    change,
  };
}

// Mengevaluasi status dan ringkasan pesanan dengan percabangan bersarang 3 tingkat
function evaluateOrderStatus(order: LaundryOrder): string {
  let summaryNote: string = "";

  // Tingkat 1: cek apakah pesanan sudah lunas
  if (order.isPaid) {
    // Tingkat 2: cek status pengerjaan pesanan
    if (order.status === "Completed") {
      // Tingkat 3: cek apakah ada potongan diskon yang diterapkan
      if (order.discount > 0) {
        summaryNote = "Selesai, Lunas, dan Mendapat Diskon";
      } else {
        summaryNote = "Selesai dan Lunas";
      }
    } else if (order.status === "In Progress") {
      summaryNote = "Sedang Diproses dan Sudah Lunas";
    } else {
      summaryNote = "Menunggu Antrean dan Sudah Lunas";
    }
  } else {
    summaryNote = "Belum Lunas - Mohon Konfirmasi Pembayaran";
  }

  return summaryNote;
}

// Menampilkan ringkasan statistik pesanan saat ini (fungsi void)
function displayOrderSummary(orders: LaundryOrder[]): void {
  const totalOrders: number = orders.length;
  let totalRevenue: number = 0;

  // Menjumlahkan pendapatan dari pesanan yang sudah lunas menggunakan operator penugasan majemuk (+=)
  for (const item of orders) {
    if (item.isPaid && item.totalPrice >= 0) {
      totalRevenue += item.totalPrice;
    }
  }

  console.log("\n--- RINGKASAN DATA LAUNDRY ---");
  console.log(`Jumlah pesanan terdaftar : ${totalOrders}`);
  console.log(`Total pendapatan lunas   : Rp${totalRevenue.toLocaleString("id-ID")}`);
}

// Menampilkan placeholder fitur yang akan dilengkapi pada tahap berikutnya (fungsi void)
function showFeaturePlaceholder(featureName: string): void {
  console.log(`\n[INFO] Fitur "${featureName}" dijadwalkan pada tahap progress berikutnya.`);
}

// ----------------------------------------------------------------------------
// 3. MENU UTAMA BERULANG (MAIN MENU LOOP)
// ----------------------------------------------------------------------------

// Menjalankan menu utama secara berulang sampai pengguna memilih keluar
function runMainMenu(): void {
  let isRunning: boolean = true;

  // Perulangan utama aplikasi konsol
  while (isRunning) {
    console.log("\n========================================");
    console.log("      APLIKASI LAUNDRY BILLING CLI      ");
    console.log("========================================");
    console.log("1. Create  - Tambah Pesanan Laundry");
    console.log("2. Read    - Lihat Data Pesanan");
    console.log("3. Update  - Perbarui Data Pesanan");
    console.log("4. Delete  - Hapus Data Pesanan");
    console.log("5. Search  - Cari Data Pesanan");
    console.log("6. Ringkasan - Lihat Status & Statistik");
    console.log("0. Exit    - Keluar dari Aplikasi");
    console.log("========================================");

    // Membaca pilihan menu dari pengguna dan menghapus spasi berlebih
    const choice: string = readlineSync.question("Pilih menu (0-6): ").trim();

    // Memilih aksi berdasarkan input menu menggunakan switch-case
    switch (choice) {
      case "1":
        showFeaturePlaceholder("Create (Tambah Pesanan)");
        break;
      case "2":
        showFeaturePlaceholder("Read (Lihat Pesanan)");
        break;
      case "3":
        showFeaturePlaceholder("Update (Perbarui Pesanan)");
        break;
      case "4":
        showFeaturePlaceholder("Delete (Hapus Pesanan)");
        break;
      case "5":
        showFeaturePlaceholder("Search (Cari Pesanan)");
        break;
      case "6":
        displayOrderSummary(laundryOrders);
        // Menampilkan catatan evaluasi pesanan pertama sebagai contoh pengujian kondisi bersarang
        if (laundryOrders.length > 0 && laundryOrders[0] !== undefined) {
          const note: string = evaluateOrderStatus(laundryOrders[0]);
          console.log(`Contoh evaluasi (${laundryOrders[0].id}): ${note}`);
        }
        break;
      case "0":
        console.log("\nTerima kasih telah menggunakan aplikasi LAUNDRY. Sampai jumpa!");
        isRunning = false;
        break;
      default:
        // Menangani input menu yang tidak valid agar program tetap berjalan aman
        console.log("\n[ERROR] Pilihan menu tidak valid. Silakan masukkan angka 0 sampai 6.");
        break;
    }
  }
}

// ----------------------------------------------------------------------------
// 4. TITIK MASUK PROGRAM (ENTRYPOINT)
// ----------------------------------------------------------------------------

// Menjalankan aplikasi utama
runMainMenu();
