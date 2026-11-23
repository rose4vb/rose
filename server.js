'use strict';

const path = require('path');
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const db = require('./lib/db');
const { IMG } = require('./lib/content');
const { icon, logomark } = require('./lib/icons');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false, limit: '200kb' }));
app.use(express.json({ limit: '200kb' }));
app.use(
  express.static(path.join(__dirname, 'public'), {
    maxAge: process.env.NODE_ENV === 'production' ? '7d' : 0,
  })
);

app.use(
  session({
    name: 'sakura.sid',
    secret: process.env.SESSION_SECRET || 'sakura-smile-development-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 8,
    },
  })
);

app.use((req, res, next) => {
  if (!req.session.csrf) req.session.csrf = crypto.randomBytes(16).toString('hex');
  res.locals.clinic = db.getClinic();
  res.locals.services = db.getServices();
  res.locals.icon = icon;
  res.locals.logomark = logomark;
  res.locals.IMG = IMG;
  res.locals.origin =
    process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
  res.locals.currentPath = req.path;
  res.locals.year = new Date().getFullYear();
  res.locals.csrfToken = req.session.csrf;
  res.locals.admin = req.session.admin || null;
  res.locals.seo = { title: 'Sakura Smile Dental Clinic', description: '', path: req.path, image: '' };
  res.locals.jsonLd = [];
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use('/', require('./routes/site'));
app.use('/admin', require('./routes/admin'));

app.use((req, res) => {
  res.status(404).render('404', {
    seo: {
      title: 'Page not found — Sakura Smile Dental Clinic',
      description: 'The page you were looking for has moved or no longer exists.',
      path: req.path,
      image: '',
    },
  });
});

app.use((err, req, res, next) => {
  console.error('[sakura]', err);
  if (res.headersSent) return next(err);
  res.status(500).render('error', {
    seo: { title: 'Something went wrong — Sakura Smile', description: '', path: req.path, image: '' },
    message: 'Something went wrong at our end. Please try again, or call the clinic on +44 20 7946 0182.',
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Sakura Smile running on http://0.0.0.0:${PORT}`);
});
