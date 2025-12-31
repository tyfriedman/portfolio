import emailjs from '@emailjs/browser';

// EmailJS configuration
// You'll need to replace these with your actual EmailJS credentials
export const EMAILJS_CONFIG = {
  serviceId: 'service_xf9rwm6', // Replace with your EmailJS service ID
  templateId: 'template_7iygu5b', // Replace with your EmailJS template ID
  publicKey: '1agfwryum3jtB5rmO', // Replace with your EmailJS public key
};

// Initialize EmailJS
export const initEmailJS = () => {
  emailjs.init(EMAILJS_CONFIG.publicKey);
};

// Send email function
export const sendEmail = async (formData: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => {
  try {
    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      subject: formData.subject,
      message: formData.message,
      to_email: 'tyfriedman@pm.me', // Your email address
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams
    );

    return { success: true, response };
  } catch (error) {
    console.error('EmailJS error:', error);
    return { success: false, error };
  }
};
