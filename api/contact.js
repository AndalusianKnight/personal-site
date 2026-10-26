/* POST /api/contact: delivers a message from the contact form or the terminal to Jesse's inbox through Resend.
   Until RESEND_API_KEY is set in Vercel, it answers 501 and the site falls back to an email draft instead.
   Optional settings: CONTACT_TO (defaults to the public address) and CONTACT_FROM (a sender on a domain verified in Resend). */
const TO = 'jessethe@alumni.harvard.edu';

function clean(v, max) { return String(v == null ? '' : v).replace(/\r\n?/g, '\n').trim().slice(0, max); }

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false, error: 'method' }); }
  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(501).json({ ok: false, error: 'not-configured' });

  let body = req.body || {};
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const name = clean(body.name, 100), email = clean(body.email, 200), reason = clean(body.reason, 60) || 'Hello', message = clean(body.message, 5000);

  /* bots fill the hidden field, or submit within a second of the page loading: say thanks and drop it */
  if (body.website || Number(body.t) < 1500) return res.status(200).json({ ok: true });
  if (!name) return res.status(400).json({ ok: false, error: 'name' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ ok: false, error: 'address' });
  if (!message) return res.status(400).json({ ok: false, error: 'message' });

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM || 'jessethe.com <onboarding@resend.dev>',
      to: [process.env.CONTACT_TO || TO],
      reply_to: email,
      subject: '[jessethe.com] ' + reason + ' · ' + name,
      text: message + '\n\n— ' + name + ' <' + email + '>\nSent from the ' + (reason === 'From the terminal' ? 'terminal' : 'contact form') + ' on jessethe.com'
    })
  }).catch(() => null);
  if (!r || !r.ok) return res.status(502).json({ ok: false, error: 'send' });
  return res.status(200).json({ ok: true });
};
