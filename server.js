const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(express.json());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "bagussender@gmail.com",
        pass: "xgqdblqzarqvtioh"
    }
});

app.post('/send-email', async (req, res) => {
    const { to, username, password, link, subject } = req.body;
    
    const htmlContent = `
  <div style="font-family: 'Poppins', sans-serif; background: linear-gradient(to top right, #1f2937, #111827); color: #f9fafb; padding: 30px; border-radius: 20px; max-width: 500px; margin: auto; border: 1px solid #374151;">
    <div style="text-align: center; margin-bottom: 25px;">
      <h2 style="font-size: 26px; font-weight: 600; color: #22d3ee; margin: 0;">Info Akun Panel</h2>
      <p style="font-size: 12px; color: #9ca3af; margin-top: 6px;">Script by Bagus Xixepen</p>
    </div>

    <div style="background: #111827; padding: 20px; border-radius: 12px; border-left: 6px solid #22d3ee; margin-bottom: 20px;">
      <p style="margin: 0; font-size: 16px;"><strong style="color: #22d3ee;">Username:</strong> ${username}</p>
    </div>

    <div style="background: #111827; padding: 20px; border-radius: 12px; border-left: 6px solid #22d3ee; margin-bottom: 20px;">
      <p style="margin: 0; font-size: 16px;"><strong style="color: #22d3ee;">Password:</strong> ${password}</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${link}" style="background: linear-gradient(to right, #22d3ee, #3b82f6); color: #111827; text-decoration: none; padding: 12px 24px; border-radius: 30px; font-weight: 600; display: inline-block;">
        Login Panel
      </a>
    </div>

    <p style="text-align: center; font-size: 12px; color: #9ca3af; font-style: italic;">Dikirim melalui <b style="color: #22d3ee;">Bagus Sender</b></p>
  </div>
`;

    const mailOptions = {
        from: `"🔔 Bagus Message 🔔" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: htmlContent
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ message: "Email berhasil dikirim!" });
    } catch (error) {
        res.status(500).json({ message: "Gagal mengirim email", error });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server berjalan di port ${PORT}`));
