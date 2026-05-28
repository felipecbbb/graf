const nodemailer = require('nodemailer');

const BUDGET_LABELS = {
  '2-6': '2.000 € – 6.000 €',
  '6-15': '6.000 € – 15.000 €',
  '15-30': '15.000 € – 30.000 €',
  '30+': 'Más de 30.000 €',
  open: 'Aún por definir',
};

const TIMELINE_LABELS = {
  urgent: 'Urgente · ya',
  '1-3m': 'En 1–3 meses',
  '3-6m': 'En 3–6 meses',
  exploring: 'Sin prisa · explorando',
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const { name, email, company, budget, timeline, message, website } = body;

  // Honeypot: si un bot rellena el campo oculto, fingimos éxito y no enviamos.
  if (website) return res.status(200).json({ ok: true });

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Faltan campos obligatorios.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Email no válido.' });
  }

  const budgetLabel = BUDGET_LABELS[budget] || budget || '—';
  const timelineLabel = TIMELINE_LABELS[timeline] || timeline || '—';

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const text = [
    `Nombre: ${name}`,
    `Email: ${email}`,
    `Empresa: ${company || '—'}`,
    `Presupuesto: ${budgetLabel}`,
    `Plazo: ${timelineLabel}`,
    '',
    'Mensaje:',
    message,
  ].join('\n');

  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1a1a1a;line-height:1.6">
      <h2 style="margin:0 0 16px">Nuevo contacto desde la web</h2>
      <table style="border-collapse:collapse;font-size:15px">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Nombre</td><td><strong>${escapeHtml(name)}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Email</td><td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Empresa</td><td>${escapeHtml(company || '—')}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Presupuesto</td><td>${escapeHtml(budgetLabel)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Plazo</td><td>${escapeHtml(timelineLabel)}</td></tr>
      </table>
      <p style="margin:16px 0 4px;color:#666">Mensaje</p>
      <p style="margin:0;white-space:pre-wrap;background:#f5f1ea;padding:16px;border-radius:8px">${escapeHtml(message)}</p>
    </div>`;

  try {
    await transporter.sendMail({
      from: `"GRAF · Web" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_TO || process.env.SMTP_USER,
      replyTo: `"${name}" <${email}>`,
      subject: `Nuevo contacto web — ${name}`,
      text,
      html,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error enviando correo:', err);
    return res.status(500).json({ error: 'No se pudo enviar el mensaje.' });
  }
};
