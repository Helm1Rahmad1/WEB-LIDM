import nodemailer from 'nodemailer';
import crypto from 'crypto';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Email configuration - you can use Gmail, Outlook, or custom SMTP
const emailConfig: EmailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '', // your email
    pass: process.env.SMTP_PASS || '', // your app password
  },
};

const transporter = nodemailer.createTransport(emailConfig);

export const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const sendVerificationEmail = async (
  email: string, 
  name: string, 
  token: string
): Promise<boolean> => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Verifikasi Akun LIDM - Learning Interactive Digital Multimedia',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verifikasi Akun LIDM</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #147E7E; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .title { color: #2C3E50; font-size: 20px; margin-bottom: 20px; }
            .content { color: #555; line-height: 1.6; margin-bottom: 30px; }
            .button { display: inline-block; background-color: #147E7E; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .button:hover { background-color: #0f6b6b; }
            .footer { text-align: center; color: #888; font-size: 12px; margin-top: 30px; }
            .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; color: #856404; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🕌 LIDM</div>
              <div class="title">Selamat Datang di Learning Interactive Digital Multimedia!</div>
            </div>
            
            <div class="content">
              <p>Assalamu'alaikum <strong>${name}</strong>,</p>
              
              <p>Terima kasih telah mendaftar di platform pembelajaran huruf hijaiyah LIDM. Untuk mengaktifkan akun Anda, silakan klik tombol verifikasi di bawah ini:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verifikasi Akun Saya</a>
              </div>
              
              <p>Jika tombol tidak berfungsi, Anda dapat mengcopy dan paste link berikut di browser:</p>
              <p style="background-color: #f8f9fa; padding: 10px; border-radius: 5px; word-break: break-all;">
                ${verificationUrl}
              </p>
              
              <div class="warning">
                <strong>Penting:</strong> Link verifikasi ini akan kedaluwarsa dalam 24 jam. Jika Anda tidak melakukan verifikasi dalam waktu tersebut, Anda perlu mendaftar ulang.
              </div>
              
              <p>Setelah verifikasi berhasil, Anda dapat langsung mulai belajar huruf hijaiyah dengan fitur-fitur menarik:</p>
              <ul>
                <li>🔤 Pembelajaran huruf hijaiyah interaktif</li>
                <li>📖 Latihan menulis dan membaca</li>
                <li>🎮 Kuis dan permainan edukatif</li>
                <li>📊 Tracking progress pembelajaran</li>
                <li>👥 Bergabung dengan kelas virtual</li>
              </ul>
              
              <p>Jika Anda tidak mendaftar di LIDM, abaikan email ini.</p>
              
              <p>Barakallahu fiikum,<br>
              Tim LIDM</p>
            </div>
            
            <div class="footer">
              <p>Email ini dikirim otomatis oleh sistem LIDM.<br>
              Jangan balas email ini. Untuk bantuan, hubungi tim support kami.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Send verification email error:', error);
    return false;
  }
};

export const sendWelcomeEmail = async (
  email: string, 
  name: string, 
  role: string
): Promise<boolean> => {
  try {
    const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard/${role}`;
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Selamat Datang di LIDM! Akun Anda Telah Aktif',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Selamat Datang di LIDM</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #147E7E; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .title { color: #2C3E50; font-size: 20px; margin-bottom: 20px; }
            .content { color: #555; line-height: 1.6; margin-bottom: 30px; }
            .button { display: inline-block; background-color: #F1C40F; color: #2C3E50; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .button:hover { background-color: #f39c12; }
            .footer { text-align: center; color: #888; font-size: 12px; margin-top: 30px; }
            .success { background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; color: #155724; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🕌 LIDM</div>
              <div class="title">Akun Anda Telah Aktif! 🎉</div>
            </div>
            
            <div class="content">
              <p>Assalamu'alaikum <strong>${name}</strong>,</p>
              
              <div class="success">
                <strong>✅ Verifikasi Berhasil!</strong><br>
                Akun Anda sebagai <strong>${role === 'guru' ? 'Guru' : 'Murid'}</strong> telah berhasil diaktifkan.
              </div>
              
              <p>Selamat! Anda sekarang dapat mengakses semua fitur LIDM untuk pembelajaran huruf hijaiyah yang interaktif dan menyenangkan.</p>
              
              <div style="text-align: center;">
                <a href="${dashboardUrl}" class="button">Mulai Belajar Sekarang</a>
              </div>
              
              ${role === 'guru' ? `
              <h3>🧑‍🏫 Fitur untuk Guru:</h3>
              <ul>
                <li>Membuat dan mengelola kelas virtual</li>
                <li>Memantau progress murid</li>
                <li>Memberikan tugas dan kuis</li>
                <li>Analisis pembelajaran murid</li>
              </ul>
              ` : `
              <h3>👨‍🎓 Fitur untuk Murid:</h3>
              <ul>
                <li>Belajar huruf hijaiyah interaktif</li>
                <li>Bergabung dengan kelas</li>
                <li>Mengerjakan latihan dan kuis</li>
                <li>Melihat progress pembelajaran</li>
              </ul>
              `}
              
              <p>Tim LIDM berkomitmen untuk memberikan pengalaman pembelajaran terbaik. Jika ada pertanyaan atau butuh bantuan, jangan ragu untuk menghubungi kami.</p>
              
              <p>Selamat belajar dan semoga berkah!<br>
              Tim LIDM</p>
            </div>
            
            <div class="footer">
              <p>Email ini dikirim otomatis oleh sistem LIDM.<br>
              Untuk bantuan, hubungi tim support kami.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Send welcome email error:', error);
    return false;
  }
};