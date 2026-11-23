'use strict';

const express = require('express');
const router = express.Router();
const db = require('../lib/db');
const seed = require('../lib/content');
const {
  TIME_SLOTS,
  validateAppointment,
  createAppointment,
  findRecentDuplicate,
  prettyDate,
  prettyTime,
} = require('../lib/booking');

/* A small in-memory limiter keeps the public forms from being hammered. */
const submissions = new Map();
function rateLimited(ip, max = 8, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const hits = (submissions.get(ip) || []).filter((t) => now - t < windowMs);
  hits.push(now);
  submissions.set(ip, hits);
  return hits.length > max;
}

const baseUrl = (req) =>
  process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;

function openingHours(clinic) {
  const map = {
    'Monday – Thursday': ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    Friday: ['Friday'],
    Saturday: ['Saturday'],
  };
  return clinic.hours
    .filter((h) => map[h.day])
    .map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: map[h.day],
      opens: h.time.split('—')[0].trim(),
      closes: h.time.split('—')[1] ? h.time.split('—')[1].trim() : '',
    }));
}

function dentistSchema(req, clinic) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    name: `${clinic.name} ${clinic.subtitle}`,
    description:
      'A calm, modern dental clinic in Marylebone offering preventive, cosmetic and restorative dentistry.',
    image: seed.IMG.hero,
    url: baseUrl(req),
    telephone: clinic.phone,
    email: clinic.email,
    priceRange: '££',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '24 Wimpole Street',
      addressLocality: 'London',
      postalCode: 'W1G 8GP',
      addressCountry: 'GB',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 51.5177, longitude: -0.1457 },
    openingHoursSpecification: openingHours(clinic),
    sameAs: clinic.social.map((s) => s.href),
  };
}

function faqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

const bookingContext = (clinic, services) => ({
  services,
  dentists: [seed.dentist.name, ...seed.team.filter((t) => !t.lead).map((t) => t.name)],
  slots: TIME_SLOTS,
  clinic,
});

/* ------------------------------------------------------------------- pages */

router.get('/', (req, res) => {
  const services = db.getServices();
  const faqs = db.getFaqs();
  const clinic = db.getClinic();
  res.render('home', {
    seo: {
      title: 'Sakura Smile Dental Clinic — Gentle Dentistry in Marylebone',
      description:
        'Thoughtful dental care in Marylebone: preventive, cosmetic and restorative dentistry with a gentle, personalised touch.',
      path: '/',
      image: seed.IMG.hero,
    },
    services,
    testimonials: db.getTestimonials(),
    gallery: db.getGallery(),
    cases: db.getCases(),
    faqs,
    reasons: seed.reasons,
    dentist: seed.dentist,
    team: seed.team,
    booking: bookingContext(clinic, services),
    jsonLd: [dentistSchema(req, clinic), faqSchema(faqs)],
  });
});

router.get('/services', (req, res) => {
  const services = db.getServices();
  res.render('services', {
    seo: {
      title: 'Dental Services — Sakura Smile Dental Clinic',
      description:
        'Preventive, cosmetic, restorative and digital dentistry, orthodontics, implants and gentle care for children.',
      path: '/services',
      image: seed.IMG.room,
    },
    services,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: services.map((s, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${baseUrl(req)}/services/${s.slug}`,
          name: s.name,
        })),
      },
    ],
  });
});

router.get('/services/:slug', (req, res, next) => {
  const service = db.getService(req.params.slug);
  if (!service) return next();
  const services = db.getServices();
  const related = services.filter((s) => s.slug !== service.slug).slice(0, 3);
  const clinic = db.getClinic();
  res.render('service', {
    seo: {
      title: `${service.name} — Sakura Smile Dental Clinic`,
      description: service.blurb,
      path: `/services/${service.slug}`,
      image: service.image,
    },
    service,
    related,
    booking: bookingContext(clinic, services),
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: service.name,
        description: service.blurb,
        provider: { '@type': 'Dentist', name: 'Sakura Smile Dental Clinic' },
        areaServed: 'London',
        url: `${baseUrl(req)}/services/${service.slug}`,
      },
      faqSchema(service.faqs),
    ],
  });
});

router.get('/about', (req, res) => {
  res.render('about', {
    seo: {
      title: 'About the Clinic — Sakura Smile Dental Clinic',
      description:
        'Our story, our philosophy and the clinicians behind Sakura Smile: Dr. Ren Takahashi and the team.',
      path: '/about',
      image: seed.IMG.dentist,
    },
    dentist: seed.dentist,
    team: seed.team,
    reasons: seed.reasons,
    gallery: db.getGallery().slice(0, 4),
  });
});

router.get('/patient-stories', (req, res) => {
  res.render('testimonials', {
    seo: {
      title: 'Patient Stories — Sakura Smile Dental Clinic',
      description:
        'Sample patient stories from the clinic. Real, verified reviews will be published here as they are collected.',
      path: '/patient-stories',
      image: seed.IMG.lounge,
    },
    testimonials: db.getTestimonials(),
  });
});

router.get('/smile-gallery', (req, res) => {
  res.render('smile-gallery', {
    seo: {
      title: 'Smile Gallery — Sakura Smile Dental Clinic',
      description:
        'Before and after smile transformations across whitening, bonding, veneers, implants and smile design. Demonstration content.',
      path: '/smile-gallery',
      image: seed.IMG.smileWoman,
    },
    cases: db.getCases(),
    gallery: db.getGallery(),
  });
});

router.get('/contact', (req, res) => {
  res.render('contact', {
    seo: {
      title: 'Contact & Directions — Sakura Smile Dental Clinic',
      description:
        'Find us on Wimpole Street in Marylebone. Opening hours, phone, WhatsApp, map and contact form.',
      path: '/contact',
      image: seed.IMG.lounge,
    },
    contactSent: req.query.sent === '1',
    contactErrors: {},
    contactOld: {},
  });
});

/* Progressive-enhancement fallback for the contact form. */
router.post('/contact', (req, res) => {
  const ip = req.ip || 'unknown';
  const name = String(req.body.name || '').trim().slice(0, 80);
  const email = String(req.body.email || '').trim().slice(0, 120);
  const phone = String(req.body.phone || '').trim().slice(0, 30);
  const message = String(req.body.message || '').trim().slice(0, 2000);
  const errors = {};
  if (name.length < 2) errors.name = 'Please tell us your name.';
  if (!email && !phone) errors.email = 'Please leave an email or a phone number.';
  else if (email && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email))
    errors.email = 'That email address does not look quite right.';
  if (message.length < 10) errors.message = 'A sentence or two is plenty — just a little more detail.';

  if (Object.keys(errors).length || rateLimited(ip)) {
    return res.status(422).render('contact', {
      seo: {
        title: 'Contact & Directions — Sakura Smile Dental Clinic',
        description: 'Contact the clinic, find directions and opening hours.',
        path: '/contact',
        image: seed.IMG.lounge,
      },
      contactSent: false,
      contactErrors: errors,
      contactOld: { name, email, phone, message },
    });
  }

  db.db
    .prepare('INSERT INTO messages (name, email, phone, message) VALUES (?,?,?,?)')
    .run(name, email, phone, message);
  res.redirect('/contact?sent=1');
});

router.get('/book', (req, res) => {
  const services = db.getServices();
  const clinic = db.getClinic();
  res.render('book', {
    seo: {
      title: 'Book an Appointment — Sakura Smile Dental Clinic',
      description:
        'Request an appointment at Sakura Smile. Choose a treatment, a preferred date and time, and we will confirm by phone.',
      path: '/book',
      image: seed.IMG.consult,
    },
    booking: bookingContext(clinic, services),
    errors: {},
    old: {},
    success: req.query.ref ? { reference: req.query.ref } : null,
  });
});

/* Progressive-enhancement fallback: the same form works without JavaScript. */
router.post('/book', (req, res) => {
  const services = db.getServices();
  const clinic = db.getClinic();
  const { ok, errors, clean } = validateAppointment(
    req.body,
    services.map((s) => s.name)
  );

  if (!ok) {
    return res.status(422).render('book', {
      seo: {
        title: 'Book an Appointment — Sakura Smile Dental Clinic',
        description: 'Request an appointment at Sakura Smile Dental Clinic.',
        path: '/book',
        image: seed.IMG.consult,
      },
      booking: bookingContext(clinic, services),
      errors,
      old: req.body,
      success: null,
    });
  }

  const duplicate = findRecentDuplicate(clean);
  const reference = duplicate ? duplicate.reference : createAppointment(clean);
  res.redirect(`/book?ref=${encodeURIComponent(reference)}`);
});

router.get('/privacy', (req, res) => {
  res.render('legal', {
    seo: {
      title: 'Privacy Policy — Sakura Smile Dental Clinic',
      description: 'How Sakura Smile collects, uses and protects your personal information.',
      path: '/privacy',
      image: seed.IMG.clinicWide,
    },
    doc: 'privacy',
  });
});

router.get('/terms', (req, res) => {
  res.render('legal', {
    seo: {
      title: 'Terms & Conditions — Sakura Smile Dental Clinic',
      description: 'The terms that apply to using this website and requesting appointments.',
      path: '/terms',
      image: seed.IMG.clinicWide,
    },
    doc: 'terms',
  });
});

/* --------------------------------------------------------------------- api */

router.post('/api/appointments', (req, res) => {
  const ip = req.ip || 'unknown';
  if (rateLimited(ip)) {
    return res.status(429).json({
      ok: false,
      message: 'Too many requests just now. Please call the clinic instead.',
    });
  }

  const services = db.getServices();
  const { ok, errors, clean } = validateAppointment(
    req.body,
    services.map((s) => s.name)
  );
  if (!ok) {
    return res.status(422).json({ ok: false, errors });
  }

  const duplicate = findRecentDuplicate(clean);
  if (duplicate) {
    return res.status(409).json({
      ok: true,
      duplicate: true,
      reference: duplicate.reference,
      date: prettyDate(clean.date),
      time: prettyTime(clean.time),
    });
  }

  const reference = createAppointment(clean);
  res.status(201).json({
    ok: true,
    reference,
    date: prettyDate(clean.date),
    time: prettyTime(clean.time),
  });
});

router.post('/api/contact', (req, res) => {
  const ip = req.ip || 'unknown';
  if (rateLimited(ip)) {
    return res.status(429).json({ ok: false, message: 'Too many messages just now. Please call us.' });
  }

  const name = String(req.body.name || '').trim().slice(0, 80);
  const email = String(req.body.email || '').trim().slice(0, 120);
  const phone = String(req.body.phone || '').trim().slice(0, 30);
  const message = String(req.body.message || '').trim().slice(0, 2000);
  const errors = {};
  if (name.length < 2) errors.name = 'Please tell us your name.';
  if (!email && !phone) errors.email = 'Please leave an email or a phone number.';
  else if (email && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email))
    errors.email = 'That email address does not look quite right.';
  if (message.length < 10) errors.message = 'A sentence or two is plenty — just a little more detail.';

  if (Object.keys(errors).length) return res.status(422).json({ ok: false, errors });

  db.db
    .prepare('INSERT INTO messages (name, email, phone, message) VALUES (?,?,?,?)')
    .run(name, email, phone, message);
  res.status(201).json({ ok: true });
});

/* -------------------------------------------------------------- meta files */

router.get('/sitemap.xml', (req, res) => {
  const base = baseUrl(req);
  const urls = [
    { loc: '/', priority: '1.0' },
    { loc: '/services', priority: '0.9' },
    { loc: '/about', priority: '0.8' },
    { loc: '/patient-stories', priority: '0.7' },
    { loc: '/smile-gallery', priority: '0.7' },
    { loc: '/contact', priority: '0.8' },
    { loc: '/book', priority: '0.9' },
    { loc: '/privacy', priority: '0.3' },
    { loc: '/terms', priority: '0.3' },
  ].concat(db.getServices().map((s) => ({ loc: `/services/${s.slug}`, priority: '0.8' })));

  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${base}${u.loc}</loc><changefreq>monthly</changefreq><priority>${u.priority}</priority></url>`
  )
  .join('\n')}
</urlset>`
  );
});

router.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${baseUrl(req)}/sitemap.xml\n`);
});

module.exports = router;
