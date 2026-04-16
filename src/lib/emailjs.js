import emailjs from '@emailjs/browser';

// ==========================================
// EMAILJS CONFIGURATION
// Create an account at https://www.emailjs.com/
// ==========================================

// TODO: Replace these with your actual IDs from EmailJS Dashboard
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

// Template IDs
const TEMPLATE_WELCOME = 'YOUR_WELCOME_TEMPLATE_ID';
const TEMPLATE_UPGRADE = 'YOUR_UPGRADE_TEMPLATE_ID';

/**
 * Send Welcome Email after registration
 */
export const sendWelcomeEmail = async (userEmail, userName) => {
  if (EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID') return; // Skip if not configured
  
  try {
    const templateParams = {
      to_email: userEmail,
      to_name: userName,
      // You can add variables here that match your EmailJS template like:
      // message: "Assalamu'alaikum Warahmatullahi Wabarakatuh..."
    };
    await emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_WELCOME, templateParams, EMAILJS_PUBLIC_KEY);
    console.log('Welcome email sent successfully');
  } catch (err) {
    console.error('Failed to send welcome email:', err);
  }
};

/**
 * Send Upgrade Confirmation Email
 */
export const sendUpgradeEmail = async (userEmail, userName, tierName) => {
  if (EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID') return; // Skip if not configured

  try {
    const templateParams = {
      to_email: userEmail,
      to_name: userName,
      tier_name: tierName.toUpperCase(),
    };
    await emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_UPGRADE, templateParams, EMAILJS_PUBLIC_KEY);
    console.log('Upgrade email sent successfully');
  } catch (err) {
    console.error('Failed to send upgrade email:', err);
  }
};
