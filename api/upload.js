import fs from 'fs';
import path from 'path';
import { IncomingForm } from 'formidable';
import fetch from 'node-fetch';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const uploadDir = path.join(process.cwd(), 'public', 'file');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = new IncomingForm({ uploadDir, keepExtensions: true, maxFileSize: 3 * 1024 * 1024 });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ status: "error", message: "Upload error!" });

    const file = files.file;
    if (!file) return res.status(400).json({ status: "error", message: "No file uploaded!" });

    const allowedExt = ['jpg','jpeg','png','gif','pdf','zip','mp3','txt','mp4','html','js'];
    const ext = path.extname(file.originalFilename).slice(1);
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);

    if (!allowedExt.includes(ext)) {
      return res.json({ status: "error", message: "Format file tidak didukung!" });
    }

    const randName = generateRandomString(7) + '.' + ext;
    const newPath = path.join(uploadDir, randName);
    fs.renameSync(file.filepath, newPath);

    const fileUrl = `https://${req.headers.host}/file/${randName}`;
    await sendWhatsApp(randName, sizeMB, fileUrl);
    await sendTelegram(randName, sizeMB, fileUrl);

    res.json({ status: "success", message: "Upload berhasil!", fileUrl });
  });
}

function generateRandomString(length = 7) {
  return [...Array(length)].map(() => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 62)]).join('');
}

async function sendWhatsApp(name, size, url) {
  const message = encodeURIComponent(`📂 *File Baru Diupload!* %0A%0A🔗 *Link:* ${url} %0A📁 *Nama:* ${name} %0A📏 *Ukuran:* ${size} MB %0A⏰ *Waktu:* ${new Date().toLocaleString()} %0A%0A⚡ *By Bagus Bahril*`);
  const phone = "6281936845010";
  const apikey = "1142220";
  const apiUrl = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${message}&apikey=${apikey}`;
  await fetch(apiUrl);
}

async function sendTelegram(name, size, url) {
  const botToken = "7248739382:AAGVFqmeaajhaTo74eCR9ABsNJ0akPfsQyQ";
  const chatId = "7081489041";
  const text = `📂 *File Baru Diupload!*\n\n🔗 *Link:* ${url}\n📁 *Nama:* ${name}\n📏 *Ukuran:* ${size}MB\n⏰ *Waktu:* ${new Date().toLocaleString()}\n\n⚡ *By Bagus Bahril*`;

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
  });
}
