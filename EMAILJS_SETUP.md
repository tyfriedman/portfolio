# EmailJS Setup Guide

## 📧 How to Set Up EmailJS for Your Contact Form

### Step 1: Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### Step 2: Create Email Service
1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions for your provider
5. Note down your **Service ID** (e.g., `service_xxxxxxx`)

### Step 3: Create Email Template
1. Go to "Email Templates" in your dashboard
2. Click "Create New Template"
3. Use this template content:

**Subject:** New message from {{from_name}} - {{subject}}

**Content:**
```
You have received a new message from your portfolio contact form:

Name: {{from_name}}
Email: {{from_email}}
Subject: {{subject}}

Message:
{{message}}

---
This message was sent from your portfolio website.
```

4. Save the template and note down your **Template ID** (e.g., `template_xxxxxxx`)

### Step 4: Get Public Key
1. Go to "Account" in your EmailJS dashboard
2. Find your **Public Key** (e.g., `your_public_key_here`)

### Step 5: Update Configuration
1. Open `src/lib/emailjs.ts`
2. Replace the placeholder values with your actual credentials:

```typescript
export const EMAILJS_CONFIG = {
  serviceId: 'your_actual_service_id',     // From Step 2
  templateId: 'your_actual_template_id',   // From Step 3
  publicKey: 'your_actual_public_key',     // From Step 4
};
```

### Step 6: Test the Form
1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000`
3. Scroll to the contact section
4. Fill out and submit the form
5. Check your email for the message!

## 🎉 You're All Set!

Once configured, your contact form will:
- ✅ Send emails directly to `tyfriedman@pm.me`
- ✅ Include sender's name, email, subject, and message
- ✅ Show success/error messages to users
- ✅ Validate form inputs
- ✅ Prevent spam with proper validation

## 📝 Free Tier Limits
- 200 emails per month
- Perfect for a personal portfolio!

## 🔧 Troubleshooting
- Make sure all IDs are correct (no extra spaces)
- Check that your email service is properly connected
- Verify the template variables match exactly
- Check browser console for any error messages
