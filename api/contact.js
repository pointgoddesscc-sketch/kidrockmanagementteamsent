export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, organization, category, subject, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  console.log('Contact form submission:', {
    name, email, organization, category, subject, message, ts: new Date().toISOString()
  });

  return res.status(200).json({ ok: true, message: 'Thank you. Your inquiry has been received and will be reviewed.' });
}
