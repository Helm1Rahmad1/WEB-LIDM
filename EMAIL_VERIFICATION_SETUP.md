# Email Verification System - Setup Instructions

## 📧 Email Configuration

To enable email verification, you need to configure SMTP settings in the backend `.env` file.

### Gmail Setup (Recommended)

1. **Generate App Password:**
   - Go to your Google Account settings
   - Enable 2-Factor Authentication
   - Go to Security > 2-Step Verification > App passwords
   - Generate an app password for "Mail"

2. **Update Backend .env file:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password-here
   FROM_EMAIL=your-email@gmail.com
   FROM_NAME=LIDM Learning Platform
   ```

### Alternative Email Providers

**Outlook/Hotmail:**
```env
SMTP_HOST=smtp.live.com
SMTP_PORT=587
```

**Yahoo:**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

## 🔧 System Features

### ✅ Implemented Features

1. **Email Verification System**
   - Registration sends verification email
   - Beautiful HTML email templates
   - Verification and welcome emails
   - 24-hour token expiration

2. **Authentication Flow**
   - Registration requires email verification
   - Login blocks unverified accounts
   - Resend verification email functionality
   - User-friendly error messages

3. **Frontend Integration**
   - Email verification page (`/auth/verify-email`)
   - Resend verification button
   - Success/error handling
   - Responsive design

### 📍 API Endpoints

- `POST /auth/register` - Register with email verification
- `GET /auth/verify-email?token=xxx` - Verify email token
- `POST /auth/resend-verification` - Resend verification email
- `POST /auth/login` - Login (requires verified email)

## 🚀 Testing the System

1. **Start the application:**
   ```bash
   docker-compose up --build -d
   ```

2. **Configure email settings** in `backend/.env`

3. **Register a new user** at http://localhost:3000/auth/register

4. **Check your email** for verification link

5. **Verify account** by clicking the email link

6. **Login** with verified account

## 🎨 Email Templates

The system includes professional HTML email templates:
- **Verification Email**: Welcome message with verification button
- **Welcome Email**: Sent after successful verification

Templates are mobile-responsive and branded for LIDM Learning Platform.

## 🔒 Security Features

- **Token Validation**: Cryptographically secure verification tokens
- **Expiration**: 24-hour token expiration
- **Input Validation**: Email format and required field validation
- **Error Handling**: Graceful error handling and user feedback

## 📝 Notes

- Emails may take a few minutes to arrive
- Check spam folder if email not received
- Use the "Resend Verification" button if needed
- Tokens expire after 24 hours for security