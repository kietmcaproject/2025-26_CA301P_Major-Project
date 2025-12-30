# SMTP Email Configuration Guide

## Quick Setup for Gmail (Recommended)

### Step 1: Enable 2-Step Verification
1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** → **2-Step Verification**
3. Follow the steps to enable it

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select **Mail** from the dropdown
3. Select **Other (Custom name)** → Enter "IntervuIQ"
4. Click **Generate**
5. Copy the **16-character password** (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Add to backend/.env
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_FROM=your-email@gmail.com
SMTP_FROM_NAME=IntervuIQ
```

**Important:** Remove spaces from the app password when pasting!

---

## Complete .env Example

```env
# ============================================
# SMTP EMAIL CONFIGURATION
# ============================================

# Gmail Configuration (Recommended)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM=your-email@gmail.com
SMTP_FROM_NAME=IntervuIQ

# ============================================
# GROQ API CONFIGURATION (for email generation)
# ============================================
GROQ_API_KEY=your-groq-api-key-here
GROQ_API_URL=https://api.groq.com/openai/v1
GROQ_MODEL=llama-3.3-70b-versatile

# ============================================
# OTHER CONFIGURATION
# ============================================
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-key-here
PORT=8000
```

---

## Alternative Email Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_FROM=your-email@outlook.com
SMTP_FROM_NAME=IntervuIQ
```

### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@yahoo.com
SMTP_FROM_NAME=IntervuIQ
```

### Custom SMTP Server
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
SMTP_FROM=your-email@domain.com
SMTP_FROM_NAME=IntervuIQ
```

---

## Troubleshooting

### Error: "SMTP connection failed"
- Check if SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS are set correctly
- For Gmail: Make sure you're using an **App Password**, not your regular password
- Check if 2-Step Verification is enabled

### Error: "Authentication failed"
- Verify your SMTP_USER and SMTP_PASS are correct
- For Gmail: Regenerate the App Password if it's not working
- Make sure there are no extra spaces in the password

### Error: "Connection timeout"
- Check your firewall/antivirus settings
- Verify SMTP_PORT is correct (587 for TLS, 465 for SSL)
- Try using port 465 with `secure: true`

---

## Testing SMTP Configuration

After adding SMTP settings to `.env`:
1. Restart your backend server
2. Try sending an email from the Cold Email Generator page
3. Check the backend console for any error messages
4. Check the recipient's inbox (and spam folder)

---

## Security Notes

- **Never commit your .env file to Git**
- Use App Passwords instead of your main account password
- Keep your SMTP credentials secure
- Consider using environment-specific .env files (.env.development, .env.production)




