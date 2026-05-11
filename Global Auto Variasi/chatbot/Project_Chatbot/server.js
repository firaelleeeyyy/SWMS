import express from "express";
import OpenAI from "openai";
import cors from "cors";
import xlsx from "xlsx";
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("."));

// 1. DATABASE LOADING
let data = [];
try {
  const workbook = xlsx.readFile("database.xlsx");
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  data = xlsx.utils.sheet_to_json(sheet);
  console.log("📊 Database loaded:", data.length);
} catch (err) {
  console.error("❌ Gagal memuat database.xlsx!");
}

// 2. SMART SEARCH FUNCTION (Kunci Product Knowledge dari Excel)
function searchProduk(query) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase().trim();
  
  return data.filter(item => {
    // Mencari di semua kolom: Nama Produk, Kategori, dan Deskripsi
    const nama = (item["Nama Produk"] || "").toString().toLowerCase();
    const kategori = (item["Kategori"] || "").toString().toLowerCase();
    const deskripsi = (item["Deskripsi"] || "").toString().toLowerCase();
    
    return nama.includes(q) || kategori.includes(q) || deskripsi.includes(q);
  }).slice(0, 8); // Berikan 8 hasil teratas agar AI punya banyak referensi
}

// 3. STORAGE SESSI USER
let sessions = {};

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

app.post("/chat", async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    // Jika sessionId tidak dikirim, buat fallback agar tidak error, 
    // tapi utamakan kirim dari frontend agar memori terpisah.
    const sId = sessionId || "default_session";

    if (!sessions[sId]) {
      sessions[sId] = {
        chatHistory: [],
        userData: { mobil: null, tahun: null, kebutuhan: null }
      };
      console.log(`✨ Session baru dibuat: ${sId}`);
    }

    const currentSess = sessions[sId];
    // Gunakan currentSess untuk semua proses di bawah...

    // 4. AI EXTRACTION
    const extractInfo = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{
        role: "system",
        content: `Ekstrak data mobil dari pesan user. Data saat ini: ${JSON.stringify(currentSess.userData)}. Input: "${message}". Balas HANYA JSON: {"mobil": "...", "tahun": "...", "kebutuhan": "..."}. Gunakan null jika tidak ada info baru.`
      }],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(extractInfo.choices[0].message.content);
    if (result.mobil && result.mobil !== "null") currentSess.userData.mobil = result.mobil;
    if (result.tahun && result.tahun !== "null") currentSess.userData.tahun = result.tahun;
    if (result.kebutuhan && result.kebutuhan !== "null") currentSess.userData.kebutuhan = result.kebutuhan;

    // 5. PENGAMBILAN DATA DARI EXCEL (Product Knowledge)
    let contextData = "";
    // Jika AI mendeteksi 'kebutuhan', cari berdasarkan itu. Jika tidak, gunakan pesan user.
    const searchKey = currentSess.userData.kebutuhan || message;
    const hasil = searchProduk(searchKey);

    if (hasil.length > 0) {
      contextData = hasil.map(item => 
        `- **${item["Nama Produk"]}**: Rp${item["Harga"]} (Kategori: ${item["Kategori"]}, Fungsi: ${item["Deskripsi"]})`
      ).join("\n");
    }

    // 6. SYSTEM PROMPT (Mengunci pengetahuan AI pada data Excel)
    const systemPrompt = `
Kamu adalah Admin Ahli dari Global Auto Variasi.

KEPRIBADIAN:
- Memiliki Product Knowledge otomotif yang sangat luas (generalis).
- Ramah, profesional, dan to-the-point.

PANDUAN PENGETAHUAN PRODUK (WAJIB):
- BILED/PROJIE: Ini adalah LAMPU utama (headlamp) dengan teknologi LED dan lensa proyektor. Fungsinya untuk pencahayaan super terang di malam hari, BUKAN kaca film atau pelindung matahari.
- KACA FILM: Ini yang berfungsi mengurangi panas matahari dan sinar UV.
- AUDIO/DSP: Untuk kualitas suara musik di mobil.
- BODYKIT: Komponen tambahan pada eksterior mobil (seperti bumper depan, belakang, dan samping) yang berfungsi untuk meningkatkan estetika agar mobil terlihat lebih sporty, aerodinamis, dan keren.


ATURAN FORMAT (WAJIB):
- Gunakan baris baru (Enter) yang jelas antar paragraf.
- Gunakan simbol peluru (-) untuk daftar produk, satu produk per baris.
- JANGAN menulis teks dalam satu blok besar yang panjang.
- Akhiri setiap poin dengan satu baris kosong agar tidak mepet.


ATURAN KETERSEDIAAN STOK & HARGA (PENTING):
1. Kamu HANYA boleh menginformasikan harga yang tertera di "DATA PRODUK" di bawah.
2. Jika user bertanya "Apakah stok ready?", "Barang ini ada?", atau "Bisa dipasang besok?", kamu DILARANG MENGARANG JAWABAN.
3. Untuk semua pertanyaan STOK dan JADWAL PASANG, kamu WAJIB menjawab: "Saya hanya menjawab pertanyaan tentang produk dan tidak bisa memastikan ketersediaan stok di gudang dan mengatur jadwal pemasangan, Jadi jika ingin membuat kesepakatan silakan langsung hubungi Admin WhatsApp"
4. Jangan pernah bilang "Stok kami banyak" atau "Barang selalu ready" jika tidak ada di data.

ATURAN KETAT (WAJIB):
1. JANGAN PERNAH memberikan daftar atau opsi barang (seperti jenis bahan, merk, atau tipe) jika barang tersebut TIDAK ADA di "DATA PRODUK DARI DATABASE".
2. Jika user bertanya tentang produk yang tidak ada di database (contoh: Bodykit, Roof Rack, dll), kamu HANYA boleh menjawab secara singkat bahwa barang tersebut belum terinput di sistem.
3. Jika user bertanya tentang produk yang ada di database, kamu WAJIB memberikan informasi lengkap sesuai data (nama produk, harga, kategori, dan deskripsi fungsi).
4. Jika user bertanya biaya jasa pemasangan langsung arahkan saja ke Admin WA 0821-3985-9161, karena biaya bisa bervariasi tergantung jenis mobil dan tingkat kesulitan pemasangan.
5. Pembalasan pesan harus konsisten dengan yang kamu balas sebelumnya, jangan sampai ada kontradiksi. Contoh: Jika kamu sudah bilang "Saya hanya menjawab pertanyaan tentang produk dan tidak bisa memastikan ketersediaan stok di gudang dan mengatur jadwal pemasangan, Jadi jika ingin membuat kesepakatan silakan langsung hubungi Admin WhatsApp" di satu pesan, jangan bilang "Stok kami banyak" di pesan lain.
6. tidak perlu memberi nomor admin di awal, cukup di akhir saja jika diperlukan, agar tidak mengganggu fokus pada produk.

TUGAS UTAMA:
1. Jangan sampai tertukar antara Lampu (Biled) dengan Kaca Film.
2. Jika menjelaskan Biled, fokuslah pada: Terangnya cahaya, fokus sinar (cut-off), dan keamanan berkendara di malam hari.
3. Gunakan DATA PRODUK di bawah untuk referensi harga:
4. Cek DATA PRODUK di bawah. Jika ada nama produk yang mengandung kata yang ditanyakan user (misal: user tanya 'biled' dan di data ada 'Bi-Led'), sebutkan harganya.
5. Jika user tanya harga secara umum, berikan semua daftar harga yang muncul di DATA PRODUK.



Tugas tambahan:
1. jika kamu ngasih nomor admin, kamu harus kasih di barisan paling bawah, harus rapi, contoh :

Silahkan hubungi Admin WhatsApp kami :
- 0821-3985-9161



DATA PRODUK DARI DATABASE (VALID):
${contextData || "TIDAK ADA DATA SPESIFIK DI SISTEM."}

TUGAS & ATURAN:
1. Berikan edukasi variasi secara umum (misal: manfaat Biled, tipe kaca film, dll).
2. Jika user bertanya HARGA atau STOK barang yang TIDAK ADA di "DATA PRODUK" di atas, kamu DILARANG MENEBAK.
4. Gunakan FORMAT DAFTAR BERPOIN (-) untuk opsi produk.
5. Maksimal 3 paragraf pendek agar rapi.
6. Jangan panggil user "null", gunakan sapaan "Kak".


`;

    currentSess.chatHistory.push({ role: "user", content: message });

    const ai = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        ...currentSess.chatHistory.slice(-5)
      ]
    });

    const reply = ai.choices[0].message.content;
    currentSess.chatHistory.push({ role: "assistant", content: reply });

    return res.json({ reply });

  } catch (err) {
    console.error("❌ ERROR:", err.message);
    return res.json({ reply: "Maaf kak, ada kendala teknis. Chat Admin ya ke 0821-3985-9161!" });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server siap dengan Product Knowledge Excel di http://localhost:3000");
});