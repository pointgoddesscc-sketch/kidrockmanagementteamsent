export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, subject, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  // Basic validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  // TODO: Wire to email service (Resend, SendGrid, etc.) or store in database.
  // For now, log and acknowledge.
  console.log('Contact form submission:', { name, email, subject, message, ts: new Date().toISOString() });

  return res.status(200).json({ ok: true, message: 'Thank you. Your message has been received.' });
}
