'use strict';

const crypto = require('crypto');
const { db } = require('./db');

/** Half-hour appointment slots, 9:00–17:30 (Saturday mornings only). */
const TIME_SLOTS = [];
for (let minutes = 9 * 60; minutes <= 17 * 60 + 30; minutes += 30) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  const label = `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
  TIME_SLOTS.push({ value, label });
}

const SATURDAY_SLOTS = TIME_SLOTS.filter((s) => s.value <= '13:30');
const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

const STATUS_META = {
  pending: { label: 'Pending review', tone: 'pending' },
  confirmed: { label: 'Confirmed', tone: 'confirmed' },
  completed: { label: 'Completed', tone: 'completed' },
  cancelled: { label: 'Cancelled', tone: 'cancelled' },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

function isSunday(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.getDay() === 0;
}
function isSaturday(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.getDay() === 6;
}

/**
 * Validate an appointment request. Returns { ok, errors, clean }.
 * Errors are keyed by field so the form can place them inline.
 */
function validateAppointment(body, serviceNames = []) {
  const errors = {};
  const clean = {
    name: String(body.name || '').trim().slice(0, 80),
    phone: String(body.phone || '').trim().slice(0, 30),
    email: String(body.email || '').trim().slice(0, 120),
    service: String(body.service || '').trim().slice(0, 120),
    dentist: String(body.dentist || '').trim().slice(0, 120),
    date: String(body.date || '').trim(),
    time: String(body.time || '').trim(),
    notes: String(body.notes || '').trim().slice(0, 1000),
  };

  if (clean.name.length < 2) errors.name = 'Please tell us your full name.';

  const digits = clean.phone.replace(/[\s().-]/g, '');
  if (!/^(\+|00)?\d{7,15}$/.test(digits)) {
    errors.phone = 'Please enter a valid phone number, including the country code.';
  }

  if (clean.email && !EMAIL_RE.test(clean.email)) {
    errors.email = 'That email address does not look quite right.';
  }

  if (!clean.service) errors.service = 'Please choose the care you are interested in.';

  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean.date)) {
    errors.date = 'Please choose a preferred date.';
  } else {
    const chosen = new Date(`${clean.date}T23:59:59`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(chosen.getTime())) {
      errors.date = 'That date could not be understood.';
    } else if (chosen < today) {
      errors.date = 'Please choose a date in the future.';
    } else if (chosen > new Date(Date.now() + 365 * 864e5)) {
      errors.date = 'Please choose a date within the next twelve months.';
    } else if (isSunday(clean.date)) {
      errors.date = 'The clinic rests on Sundays — please choose another day.';
    }
  }

  const allowed = isSaturday(clean.date) ? SATURDAY_SLOTS : TIME_SLOTS;
  if (!clean.time) {
    errors.time = 'Please choose a preferred time.';
  } else if (!allowed.some((s) => s.value === clean.time)) {
    errors.time = isSaturday(clean.date)
      ? 'On Saturdays we see patients until 1:30 pm.'
      : 'Please choose one of the available times.';
  }

  if (clean.service && serviceNames.length && !serviceNames.includes(clean.service)) {
    errors.service = 'Please choose one of the listed treatments.';
  }

  return { ok: Object.keys(errors).length === 0, errors, clean };
}

function makeReference() {
  return `SS-${Date.now().toString(36).toUpperCase().slice(-4)}${crypto
    .randomBytes(2)
    .toString('hex')
    .toUpperCase()}`;
}

/** Guard against accidental double-submits: same phone, date and time within 10 minutes. */
function findRecentDuplicate(clean) {
  return db
    .prepare(
      `SELECT reference FROM appointments
       WHERE phone = ? AND date = ? AND time = ? AND created_at >= datetime('now', '-10 minutes')`
    )
    .get(clean.phone, clean.date, clean.time);
}

function createAppointment(clean) {
  const reference = makeReference();
  db.prepare(
    `INSERT INTO appointments (reference, name, phone, email, service, dentist, date, time, notes)
     VALUES (?,?,?,?,?,?,?,?,?)`
  ).run(
    reference,
    clean.name,
    clean.phone,
    clean.email,
    clean.service,
    clean.dentist,
    clean.date,
    clean.time,
    clean.notes
  );
  return reference;
}

function prettyDate(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function prettyTime(value) {
  const slot = TIME_SLOTS.find((s) => s.value === value);
  return slot ? slot.label : value;
}

module.exports = {
  TIME_SLOTS,
  SATURDAY_SLOTS,
  STATUSES,
  STATUS_META,
  validateAppointment,
  createAppointment,
  findRecentDuplicate,
  prettyDate,
  prettyTime,
};
