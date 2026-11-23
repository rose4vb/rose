'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../lib/db');
const { STATUSES, STATUS_META, prettyDate, prettyTime } = require('../lib/booking');

const attempts = new Map();

function requireAdmin(req, res, next) {
  if (req.session && req.session.admin) return next();
  return res.redirect('/admin/login');
}

function checkCsrf(req, res, next) {
  if (req.body && req.body._csrf && req.body._csrf === req.session.csrf) return next();
  return res.status(403).render('admin/error', {
    message: 'That form expired. Please go back, refresh the page and try again.',
  });
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

const parseLines = (text) =>
  String(text || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

const parsePairs = (text) =>
  parseLines(text)
    .map((line) => {
      const [a, ...rest] = line.split('|');
      return { title: (a || '').trim(), text: rest.join('|').trim() };
    })
    .filter((p) => p.title && p.text);

const parseFaqs = (text) =>
  parseLines(text)
    .map((line) => {
      const [q, ...rest] = line.split('|');
      return { q: (q || '').trim(), a: rest.join('|').trim() };
    })
    .filter((f) => f.q && f.a);

/* ------------------------------------------------------------------- login */

router.get('/login', (req, res) => {
  if (req.session.admin) return res.redirect('/admin');
  res.render('admin/login', { error: null, email: '' });
});

router.post('/login', (req, res) => {
  const ip = req.ip || 'unknown';
  const record = attempts.get(ip) || { count: 0, until: 0 };
  if (record.until > Date.now()) {
    return res.status(429).render('admin/login', {
      error: 'Too many attempts. Please wait a few minutes and try again.',
      email: req.body.email || '',
    });
  }

  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const user = db.db.prepare('SELECT * FROM admin_users WHERE lower(email) = ?').get(email);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    record.count += 1;
    if (record.count >= 5) {
      record.until = Date.now() + 5 * 60 * 1000;
      record.count = 0;
    }
    attempts.set(ip, record);
    return res.status(401).render('admin/login', {
      error: 'That email and password do not match our records.',
      email,
    });
  }

  attempts.delete(ip);
  req.session.regenerate((err) => {
    if (err) return res.status(500).render('admin/login', { error: 'Please try again.', email });
    req.session.admin = { id: user.id, name: user.name, email: user.email };
    req.session.csrf = require('crypto').randomBytes(16).toString('hex');
    res.redirect('/admin');
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

/* --------------------------------------------------------------- dashboard */

router.use(requireAdmin);

router.get('/', (req, res) => {
  const status = STATUSES.includes(req.query.status) ? req.query.status : '';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(req.query.date || '') ? req.query.date : '';
  const appointments = db.getAppointments({ status, date });
  const counts = db.db
    .prepare('SELECT status, COUNT(*) AS n FROM appointments GROUP BY status')
    .all()
    .reduce((acc, row) => ({ ...acc, [row.status]: row.n }), {});
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = db.db.prepare('SELECT COUNT(*) AS n FROM appointments WHERE date = ?').get(today).n;
  const unread = db.db.prepare('SELECT COUNT(*) AS n FROM messages WHERE handled = 0').get().n;

  res.render('admin/dashboard', {
    appointments,
    counts,
    todayCount,
    unread,
    filters: { status, date },
    STATUS_META,
    prettyDate,
    prettyTime,
    flash: req.query.saved ? 'Appointment updated.' : null,
    active: 'appointments',
  });
});

router.post('/appointments/:id/status', checkCsrf, (req, res) => {
  const status = String(req.body.status || '');
  const appointment = db.getAppointment(req.params.id);
  if (!appointment || !STATUSES.includes(status)) {
    return res.status(400).render('admin/error', { message: 'That appointment could not be updated.' });
  }
  db.db
    .prepare("UPDATE appointments SET status = ?, updated_at = datetime('now') WHERE id = ?")
    .run(status, appointment.id);
  res.redirect(req.body.redirect || '/admin?saved=1');
});

/* ---------------------------------------------------------------- services */

router.get('/services', (req, res) => {
  res.render('admin/services', {
    services: db.getServices(),
    active: 'services',
    flash: req.query.saved ? 'Service saved.' : null,
  });
});

router.get('/services/:id', (req, res) => {
  const isNew = req.params.id === 'new';
  const service = isNew
    ? {
        id: null,
        slug: '',
        name: '',
        icon: 'sparkle',
        tagline: '',
        blurb: '',
        description: '',
        image: '',
        price: '',
        duration: '',
        featured: false,
        sort: 99,
        benefits: [],
        steps: [],
        faqs: [],
        worry: { q: '', a: '' },
      }
    : db.getServiceById(req.params.id);
  if (!service) return res.status(404).render('admin/error', { message: 'Service not found.' });
  res.render('admin/service-edit', {
    service,
    isNew,
    active: 'services',
    error: null,
  });
});

router.post('/services/:id', (req, res) => {
  const isNew = req.params.id === 'new';
  const existing = isNew ? null : db.getServiceById(req.params.id);
  if (!isNew && !existing) return res.status(404).render('admin/error', { message: 'Service not found.' });

  const name = String(req.body.name || '').trim();
  if (!name) {
    return res.status(422).render('admin/service-edit', {
      service: { ...(existing || {}), ...req.body, id: req.params.id },
      isNew,
      active: 'services',
      error: 'A service needs a name.',
    });
  }

  let slug = slugify(req.body.slug || name);
  const clash = db.db.prepare('SELECT id FROM services WHERE slug = ?').get(slug);
  if (clash && (!existing || clash.id !== existing.id)) slug = `${slug}-${Date.now().toString(36).slice(-3)}`;

  const record = {
    slug,
    name,
    icon: String(req.body.icon || 'sparkle'),
    tagline: String(req.body.tagline || ''),
    blurb: String(req.body.blurb || ''),
    description: String(req.body.description || ''),
    image: String(req.body.image || ''),
    price: String(req.body.price || ''),
    duration: String(req.body.duration || ''),
    featured: req.body.featured ? 1 : 0,
    sort: Number(req.body.sort) || 0,
    benefits: JSON.stringify(parseLines(req.body.benefits)),
    steps: JSON.stringify(parsePairs(req.body.steps)),
    faqs: JSON.stringify(parseFaqs(req.body.faqs)),
    worry_q: String(req.body.worry_q || ''),
    worry_a: String(req.body.worry_a || ''),
  };

  if (existing) {
    db.db
      .prepare(
        `UPDATE services SET slug=@slug, name=@name, icon=@icon, tagline=@tagline, blurb=@blurb,
          description=@description, image=@image, price=@price, duration=@duration,
          featured=@featured, sort=@sort, benefits=@benefits, steps=@steps, faqs=@faqs,
          worry_q=@worry_q, worry_a=@worry_a WHERE id=@id`
      )
      .run({ ...record, id: existing.id });
  } else {
    db.db
      .prepare(
        `INSERT INTO services (slug, name, icon, tagline, blurb, description, image, price,
          duration, featured, sort, benefits, steps, faqs, worry_q, worry_a)
         VALUES (@slug, @name, @icon, @tagline, @blurb, @description, @image, @price,
          @duration, @featured, @sort, @benefits, @steps, @faqs, @worry_q, @worry_a)`
      )
      .run(record);
  }
  res.redirect('/admin/services?saved=1');
});

router.post('/services/:id/delete', checkCsrf, (req, res) => {
  db.db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
  res.redirect('/admin/services?saved=1');
});

/* ------------------------------------------------------------ testimonials */

router.get('/testimonials', (req, res) => {
  res.render('admin/testimonials', {
    testimonials: db.getTestimonials(true),
    active: 'testimonials',
    flash: req.query.saved ? 'Patient story saved.' : null,
    editId: req.query.edit || null,
  });
});

router.post('/testimonials/save', checkCsrf, (req, res) => {
  const name = String(req.body.name || '').trim();
  const quote = String(req.body.quote || '').trim();
  if (name.length < 2 || quote.length < 10) {
    return res.redirect('/admin/testimonials?error=1');
  }
  const record = {
    name,
    treatment: String(req.body.treatment || '').trim(),
    rating: Math.min(5, Math.max(1, Number(req.body.rating) || 5)),
    avatar: String(req.body.avatar || '').trim(),
    quote,
    published: req.body.published ? 1 : 0,
  };
  if (req.body.id) {
    db.db
      .prepare(
        'UPDATE testimonials SET name=@name, treatment=@treatment, rating=@rating, avatar=@avatar, quote=@quote, published=@published WHERE id=@id'
      )
      .run({ ...record, id: req.body.id });
  } else {
    db.db
      .prepare(
        'INSERT INTO testimonials (name, treatment, rating, avatar, quote, published, sort) VALUES (@name, @treatment, @rating, @avatar, @quote, @published, 99)'
      )
      .run(record);
  }
  res.redirect('/admin/testimonials?saved=1');
});

router.post('/testimonials/:id/toggle', checkCsrf, (req, res) => {
  db.db
    .prepare('UPDATE testimonials SET published = 1 - published WHERE id = ?')
    .run(req.params.id);
  res.redirect('/admin/testimonials?saved=1');
});

router.post('/testimonials/:id/delete', checkCsrf, (req, res) => {
  db.db.prepare('DELETE FROM testimonials WHERE id = ?').run(req.params.id);
  res.redirect('/admin/testimonials?saved=1');
});

/* --------------------------------------------------------- content & FAQs */

router.get('/content', (req, res) => {
  res.render('admin/content', {
    clinic: db.getClinic(),
    faqs: db.getFaqs(),
    active: 'content',
    flash: req.query.saved ? 'Content saved.' : null,
    editId: req.query.edit || null,
  });
});

router.post('/content/clinic', checkCsrf, (req, res) => {
  const clinic = db.getClinic();
  const hours = [0, 1, 2, 3].map((i) => ({
    day: String(req.body[`day_${i}`] || clinic.hours[i].day),
    time: String(req.body[`time_${i}`] || clinic.hours[i].time),
  }));
  db.saveClinic({
    ...clinic,
    name: String(req.body.name || clinic.name).trim(),
    tagline: String(req.body.tagline || clinic.tagline),
    address: String(req.body.address || clinic.address),
    phone: String(req.body.phone || clinic.phone),
    phoneHref: String(req.body.phone || clinic.phone).replace(/[^\d+]/g, ''),
    whatsapp: String(req.body.whatsapp || clinic.whatsapp).replace(/[^\d]/g, ''),
    email: String(req.body.email || clinic.email),
    hours,
  });
  res.redirect('/admin/content?saved=1');
});

router.post('/faqs/save', checkCsrf, (req, res) => {
  const question = String(req.body.question || '').trim();
  const answer = String(req.body.answer || '').trim();
  if (!question || !answer) return res.redirect('/admin/content?error=1');
  if (req.body.id) {
    db.db
      .prepare('UPDATE faqs SET question = ?, answer = ? WHERE id = ?')
      .run(question, answer, req.body.id);
  } else {
    db.db.prepare('INSERT INTO faqs (question, answer, sort) VALUES (?,?,99)').run(question, answer);
  }
  res.redirect('/admin/content?saved=1');
});

router.post('/faqs/:id/delete', checkCsrf, (req, res) => {
  db.db.prepare('DELETE FROM faqs WHERE id = ?').run(req.params.id);
  res.redirect('/admin/content?saved=1');
});

/* --------------------------------------------------------------- messages */

router.get('/messages', (req, res) => {
  res.render('admin/messages', {
    messages: db.getMessages(),
    active: 'messages',
    flash: req.query.saved ? 'Message updated.' : null,
  });
});

router.post('/messages/:id/handled', checkCsrf, (req, res) => {
  db.db.prepare('UPDATE messages SET handled = 1 - handled WHERE id = ?').run(req.params.id);
  res.redirect('/admin/messages?saved=1');
});

module.exports = router;
