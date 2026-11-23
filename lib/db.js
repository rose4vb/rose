'use strict';

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const seed = require('./content');

const DATA_DIR = path.join(__dirname, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'sakura.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'sparkle',
    tagline TEXT NOT NULL DEFAULT '',
    blurb TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL DEFAULT '',
    price TEXT NOT NULL DEFAULT '',
    duration TEXT NOT NULL DEFAULT '',
    featured INTEGER NOT NULL DEFAULT 0,
    sort INTEGER NOT NULL DEFAULT 0,
    benefits TEXT NOT NULL DEFAULT '[]',
    steps TEXT NOT NULL DEFAULT '[]',
    faqs TEXT NOT NULL DEFAULT '[]',
    worry_q TEXT NOT NULL DEFAULT '',
    worry_a TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    treatment TEXT NOT NULL DEFAULT '',
    rating INTEGER NOT NULL DEFAULT 5,
    avatar TEXT NOT NULL DEFAULT '',
    quote TEXT NOT NULL,
    published INTEGER NOT NULL DEFAULT 1,
    sort INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    caption TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT '',
    sort INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    before_image TEXT NOT NULL,
    after_image TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    sort INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS faqs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL DEFAULT '',
    service TEXT NOT NULL DEFAULT '',
    dentist TEXT NOT NULL DEFAULT '',
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    message TEXT NOT NULL,
    handled INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
  CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
`);

function seedOnce() {
  const clinicRow = db.prepare("SELECT value FROM settings WHERE key = 'clinic'").get();
  if (!clinicRow) {
    db.prepare("INSERT INTO settings (key, value) VALUES ('clinic', ?)").run(
      JSON.stringify(seed.clinic)
    );
  }

  const hasServices = db.prepare('SELECT COUNT(*) AS n FROM services').get().n > 0;
  if (!hasServices) {
    const insert = db.prepare(`
      INSERT INTO services (slug, name, icon, tagline, blurb, description, image, price, duration,
        featured, sort, benefits, steps, faqs, worry_q, worry_a)
      VALUES (@slug, @name, @icon, @tagline, @blurb, @description, @image, @price, @duration,
        @featured, @sort, @benefits, @steps, @faqs, @worry_q, @worry_a)
    `);
    const insertMany = db.transaction((rows) => {
      for (const s of rows) {
        insert.run({
          slug: s.slug,
          name: s.name,
          icon: s.icon,
          tagline: s.tagline,
          blurb: s.blurb,
          description: s.description,
          image: s.image,
          price: s.price,
          duration: s.duration,
          featured: s.featured ? 1 : 0,
          sort: s.sort,
          benefits: JSON.stringify(s.benefits),
          steps: JSON.stringify(s.steps),
          faqs: JSON.stringify(s.faqs),
          worry_q: s.worry.q,
          worry_a: s.worry.a,
        });
      }
    });
    insertMany(seed.services);
  }

  if (db.prepare('SELECT COUNT(*) AS n FROM testimonials').get().n === 0) {
    const insert = db.prepare(
      'INSERT INTO testimonials (name, treatment, rating, avatar, quote, published, sort) VALUES (?,?,?,?,?,1,?)'
    );
    const many = db.transaction((rows) => {
      rows.forEach((t, i) => insert.run(t.name, t.treatment, t.rating, t.avatar, t.quote, i + 1));
    });
    many(seed.testimonials);
  }

  if (db.prepare('SELECT COUNT(*) AS n FROM gallery').get().n === 0) {
    const insert = db.prepare(
      'INSERT INTO gallery (title, caption, image, category, sort) VALUES (?,?,?,?,?)'
    );
    const many = db.transaction((rows) => {
      rows.forEach((g) => insert.run(g.title, g.caption, g.image, g.category, g.sort));
    });
    many(seed.gallery);
  }

  if (db.prepare('SELECT COUNT(*) AS n FROM cases').get().n === 0) {
    const insert = db.prepare(
      'INSERT INTO cases (title, category, before_image, after_image, note, sort) VALUES (?,?,?,?,?,?)'
    );
    const many = db.transaction((rows) => {
      rows.forEach((c) => insert.run(c.title, c.category, c.before, c.after, c.note, c.sort));
    });
    many(seed.cases);
  }

  if (db.prepare('SELECT COUNT(*) AS n FROM faqs').get().n === 0) {
    const insert = db.prepare('INSERT INTO faqs (question, answer, sort) VALUES (?,?,?)');
    const many = db.transaction((rows) => {
      rows.forEach((f) => insert.run(f.question, f.answer, f.sort));
    });
    many(seed.faqs);
  }

  if (db.prepare('SELECT COUNT(*) AS n FROM admin_users').get().n === 0) {
    const email = process.env.ADMIN_EMAIL || 'admin@sakurasmile.clinic';
    const password = process.env.ADMIN_PASSWORD || 'sakura2024';
    db.prepare('INSERT INTO admin_users (email, password_hash, name) VALUES (?,?,?)').run(
      email,
      bcrypt.hashSync(password, 10),
      'Clinic Team'
    );
  }
}
seedOnce();

/* ------------------------------------------------------------------ queries */

function parseService(row) {
  if (!row) return null;
  return {
    ...row,
    featured: !!row.featured,
    benefits: JSON.parse(row.benefits || '[]'),
    steps: JSON.parse(row.steps || '[]'),
    faqs: JSON.parse(row.faqs || '[]'),
    worry: { q: row.worry_q, a: row.worry_a },
  };
}

const getServices = () =>
  db.prepare('SELECT * FROM services ORDER BY sort, id').all().map(parseService);
const getService = (slug) =>
  parseService(db.prepare('SELECT * FROM services WHERE slug = ?').get(slug));
const getServiceById = (id) =>
  parseService(db.prepare('SELECT * FROM services WHERE id = ?').get(id));
const getTestimonials = (all = false) =>
  db
    .prepare(
      `SELECT * FROM testimonials ${all ? '' : 'WHERE published = 1'} ORDER BY sort, id`
    )
    .all();
const getGallery = () => db.prepare('SELECT * FROM gallery ORDER BY sort, id').all();
const getCases = () =>
  db
    .prepare('SELECT * FROM cases ORDER BY sort, id')
    .all()
    .map((row) => ({ ...row, before: row.before_image, after: row.after_image }));
const getFaqs = () => db.prepare('SELECT * FROM faqs ORDER BY sort, id').all();
const getClinic = () => JSON.parse(db.prepare("SELECT value FROM settings WHERE key = 'clinic'").get().value);
const saveClinic = (clinic) =>
  db
    .prepare("INSERT INTO settings (key, value) VALUES ('clinic', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .run(JSON.stringify(clinic));

const getAppointments = ({ status = '', date = '' } = {}) => {
  const where = [];
  const params = [];
  if (status) {
    where.push('status = ?');
    params.push(status);
  }
  if (date) {
    where.push('date = ?');
    params.push(date);
  }
  const sql = `SELECT * FROM appointments ${
    where.length ? 'WHERE ' + where.join(' AND ') : ''
  } ORDER BY date DESC, time DESC, id DESC`;
  return db.prepare(sql).all(...params);
};
const getAppointment = (id) => db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);

const getMessages = () => db.prepare('SELECT * FROM messages ORDER BY handled, id DESC').all();

module.exports = {
  db,
  getServices,
  getService,
  getServiceById,
  getTestimonials,
  getGallery,
  getCases,
  getFaqs,
  getClinic,
  saveClinic,
  getAppointments,
  getAppointment,
  getMessages,
};
