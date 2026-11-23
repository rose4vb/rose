/* ==========================================================================
   Sakura Smile — progressive enhancement
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ------------------------------------------------------------ header */

  var header = $('[data-header]');
  var progress = $('[data-scroll-progress]');
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      var y = window.scrollY || window.pageYOffset;
      if (header) header.classList.toggle('is-stuck', y > 18);
      if (progress) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.setProperty('--progress', max > 0 ? Math.min(1, y / max) : 0);
      }
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --------------------------------------------------------- mobile nav */

  var toggle = $('[data-nav-toggle]');
  var mobileNav = $('[data-mobile-nav]');

  function closeNav() {
    if (!toggle || !mobileNav) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    mobileNav.hidden = true;
    document.body.classList.remove('is-locked');
  }

  function openNav() {
    if (!toggle || !mobileNav) return;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    mobileNav.hidden = false;
    document.body.classList.add('is-locked');
    var first = $('.mobile-nav__link', mobileNav);
    if (first) first.focus({ preventScroll: true });
  }

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      if (mobileNav.hidden) openNav();
      else closeNav();
    });
    $$('a', mobileNav).forEach(function (link) {
      link.addEventListener('click', closeNav);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !mobileNav.hidden) {
        closeNav();
        toggle.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 980 && !mobileNav.hidden) closeNav();
    });
  }

  /* ------------------------------------------------------------- reveal */

  var revealables = $$('.reveal');
  if (revealables.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealables.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              io.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
      );
      revealables.forEach(function (el) { io.observe(el); });
    }
  }

  /* --------------------------------------------------------------- faq */

  var faqButtons = $$('[data-faq]');
  faqButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var panel = document.getElementById(button.getAttribute('aria-controls'));
      var isOpen = button.getAttribute('aria-expanded') === 'true';

      faqButtons.forEach(function (other) {
        if (other === button) return;
        other.setAttribute('aria-expanded', 'false');
        var otherPanel = document.getElementById(other.getAttribute('aria-controls'));
        if (otherPanel) otherPanel.hidden = true;
      });

      button.setAttribute('aria-expanded', String(!isOpen));
      if (panel) {
        panel.hidden = isOpen;
        if (!isOpen) {
          panel.classList.add('is-opening');
          window.setTimeout(function () { panel.classList.remove('is-opening'); }, 450);
        }
      }
    });
  });

  /* ---------------------------------------------------------- carousel */

  var carousel = $('[data-carousel]');
  if (carousel) {
    var track = $('[data-carousel-track]', carousel);
    var slides = track ? Array.prototype.slice.call(track.children) : [];
    var current = $('[data-carousel-current]');
    var total = $('[data-carousel-total]');
    var prev = $('[data-carousel-prev]');
    var next = $('[data-carousel-next]');

    if (total) total.textContent = String(slides.length);

    function slideIndex() {
      if (!slides.length) return 0;
      var width = carousel.clientWidth || 1;
      return Math.max(0, Math.min(slides.length - 1, Math.round(carousel.scrollLeft / width)));
    }

    function updateCount() {
      if (current) current.textContent = String(slideIndex() + 1);
    }

    function goTo(index) {
      var clamped = Math.max(0, Math.min(slides.length - 1, index));
      carousel.scrollTo({
        left: clamped * carousel.clientWidth,
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
      updateCount();
    }

    if (prev) prev.addEventListener('click', function () { goTo(slideIndex() - 1); });
    if (next) next.addEventListener('click', function () { goTo(slideIndex() + 1); });

    var scrollTick = false;
    carousel.addEventListener('scroll', function () {
      if (scrollTick) return;
      scrollTick = true;
      window.requestAnimationFrame(function () {
        updateCount();
        scrollTick = false;
      });
    }, { passive: true });

    carousel.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(slideIndex() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(slideIndex() - 1); }
    });

    updateCount();
  }

  /* ---------------------------------------------------- compare sliders */

  $$('[data-compare]').forEach(function (compare) {
    var range = $('[data-compare-range]', compare);
    if (!range) return;
    var sync = function () {
      compare.style.setProperty('--pos', range.value + '%');
    };
    range.addEventListener('input', sync);
    range.addEventListener('change', sync);
    sync();
  });

  /* ------------------------------------------------------ case filters */

  var filterButtons = $$('[data-filter]');
  var caseCards = $$('[data-cases] .case');
  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var filter = button.getAttribute('data-filter');
      filterButtons.forEach(function (b) {
        var active = b === button;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      caseCards.forEach(function (card) {
        var match = filter === 'all' || card.getAttribute('data-category') === filter;
        card.hidden = !match;
      });
    });
  });

  /* ----------------------------------------------------------- lightbox */

  var dialog = $('[data-lightbox-dialog]');
  if (dialog) {
    var triggers = $$('[data-lightbox]');
    var dialogImg = $('[data-lightbox-img]', dialog);
    var dialogTitle = $('[data-lightbox-title]', dialog);
    var dialogText = $('[data-lightbox-text]', dialog);
    var dialogCount = $('[data-lightbox-count]', dialog);
    var activeIndex = 0;

    function render(index) {
      if (!triggers.length) return;
      activeIndex = (index + triggers.length) % triggers.length;
      var el = triggers[activeIndex];
      dialogImg.src = el.getAttribute('data-full');
      dialogImg.alt = el.getAttribute('data-title') || '';
      dialogTitle.textContent = el.getAttribute('data-title') || '';
      dialogText.textContent = el.getAttribute('data-caption') || '';
      if (dialogCount) dialogCount.textContent = (activeIndex + 1) + ' / ' + triggers.length;
    }

    function open(index) {
      render(index);
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
      document.body.classList.add('is-locked');
    }

    function close() {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
      document.body.classList.remove('is-locked');
    }

    triggers.forEach(function (trigger, i) {
      trigger.addEventListener('click', function () { open(i); });
    });

    var closeBtn = $('[data-lightbox-close]', dialog);
    var prevBtn = $('[data-lightbox-prev]', dialog);
    var nextBtn = $('[data-lightbox-next]', dialog);
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (prevBtn) prevBtn.addEventListener('click', function () { render(activeIndex - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { render(activeIndex + 1); });

    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) close();
    });
    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); render(activeIndex + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); render(activeIndex - 1); }
    });
    dialog.addEventListener('close', function () {
      document.body.classList.remove('is-locked');
    });
  }

  /* ------------------------------------------------------ worry toggle */

  $$('[data-worry-toggle]').forEach(function (button) {
    button.addEventListener('click', function () {
      var panel = document.getElementById(button.getAttribute('aria-controls'));
      var open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!open));
      if (panel) panel.hidden = open;
    });
  });

  /* --------------------------------------------------------- validation */

  var EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  function setError(form, field, message) {
    var holder = $('[data-error-for="' + field + '"]', form);
    var input = form.querySelector('[name="' + field + '"]');
    if (holder) holder.textContent = message || '';
    if (input) {
      if (message) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    }
  }

  function clearErrors(form) {
    $$('[data-error-for]', form).forEach(function (el) { el.textContent = ''; });
    $$('[aria-invalid]', form).forEach(function (el) { el.removeAttribute('aria-invalid'); });
  }

  function isSunday(value) {
    var d = new Date(value + 'T12:00:00');
    return d.getDay() === 0;
  }

  function validateBooking(form) {
    var data = {
      name: (form.name.value || '').trim(),
      phone: (form.phone.value || '').trim(),
      email: (form.email.value || '').trim(),
      service: form.service.value,
      dentist: form.dentist.value,
      date: form.date.value,
      time: form.time.value,
      notes: (form.notes.value || '').trim()
    };
    var errors = {};
    if (data.name.length < 2) errors.name = 'Please tell us your full name.';

    var digits = data.phone.replace(/[\s().-]/g, '');
    if (!/^(\+|00)?\d{7,15}$/.test(digits)) {
      errors.phone = 'Please enter a valid phone number, including the country code.';
    }
    if (data.email && !EMAIL.test(data.email)) {
      errors.email = 'That email address does not look quite right.';
    }
    if (!data.service) errors.service = 'Please choose the care you are interested in.';
    if (!data.date) {
      errors.date = 'Please choose a preferred date.';
    } else if (isSunday(data.date)) {
      errors.date = 'The clinic rests on Sundays — please choose another day.';
    } else {
      var chosen = new Date(data.date + 'T23:59:59');
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      if (chosen < today) errors.date = 'Please choose a date in the future.';
    }
    if (!data.time) errors.time = 'Please choose a preferred time.';
    return { data: data, errors: errors };
  }

  function validateContact(form) {
    var data = {
      name: (form.name.value || '').trim(),
      email: (form.email.value || '').trim(),
      phone: (form.phone.value || '').trim(),
      message: (form.message.value || '').trim()
    };
    var errors = {};
    if (data.name.length < 2) errors.name = 'Please tell us your name.';
    if (!data.email && !data.phone) errors.email = 'Please leave an email or a phone number.';
    else if (data.email && !EMAIL.test(data.email)) errors.email = 'That email address does not look quite right.';
    if (data.message.length < 10) errors.message = 'A sentence or two is plenty — just a little more detail.';
    return { data: data, errors: errors };
  }

  function showErrors(form, errors) {
    var first = null;
    Object.keys(errors).forEach(function (field) {
      setError(form, field, errors[field]);
      if (!first) first = form.querySelector('[name="' + field + '"]');
    });
    var alertBox = $('[data-form-alert]', form) || $('[data-contact-alert]', form);
    if (alertBox) {
      alertBox.textContent = 'Please check the highlighted fields and try again.';
      alertBox.hidden = false;
    }
    if (first) {
      first.focus({ preventScroll: false });
      first.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }

  function hideAlert(form) {
    var alertBox = $('[data-form-alert]', form) || $('[data-contact-alert]', form);
    if (alertBox) alertBox.hidden = true;
  }

  function postJSON(url, payload) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (response) {
      return response.json().then(function (body) {
        return { status: response.status, body: body };
      });
    });
  }

  /* --------------------------------------------------------- booking form */

  var bookingForm = $('[data-booking-form]');
  if (bookingForm) {
    var submitBtn = $('[data-submit]', bookingForm);
    var successBox = $('[data-booking-success]');

    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors(bookingForm);
      hideAlert(bookingForm);
      var result = validateBooking(bookingForm);
      if (Object.keys(result.errors).length) {
        showErrors(bookingForm, result.errors);
        return;
      }

      if (submitBtn) {
        submitBtn.classList.add('is-loading');
        submitBtn.setAttribute('aria-busy', 'true');
        submitBtn.disabled = true;
      }

      postJSON('/api/appointments', result.data)
        .then(function (res) {
          if (res.status === 201 || (res.status === 409 && res.body && res.body.ok)) {
            var ref = res.body.reference || '';
            var refEl = $('[data-success-ref]', successBox);
            if (refEl) refEl.textContent = ref;
            bookingForm.hidden = true;
            if (successBox) {
              successBox.hidden = false;
              successBox.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
              successBox.setAttribute('tabindex', '-1');
              successBox.focus({ preventScroll: true });
            }
            return;
          }
          if (res.status === 422 && res.body && res.body.errors) {
            showErrors(bookingForm, res.body.errors);
          } else {
            var alertBox = $('[data-form-alert]', bookingForm);
            if (alertBox) {
              alertBox.textContent =
                (res.body && res.body.message) ||
                'We could not send that request just now. Please call the clinic instead.';
              alertBox.hidden = false;
            }
          }
        })
        .catch(function () {
          var alertBox = $('[data-form-alert]', bookingForm);
          if (alertBox) {
            alertBox.textContent =
              'We could not reach the clinic just now. Please try again, or call +44 20 7946 0182.';
            alertBox.hidden = false;
          }
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.classList.remove('is-loading');
            submitBtn.removeAttribute('aria-busy');
            submitBtn.disabled = false;
          }
        });
    });

    $$('input, select, textarea', bookingForm).forEach(function (field) {
      field.addEventListener('input', function () {
        if (field.name) setError(bookingForm, field.name, '');
      });
    });
  }

  /* --------------------------------------------------------- contact form */

  var contactForm = $('[data-contact-form]');
  if (contactForm) {
    var contactBtn = $('[data-submit]', contactForm);
    var contactSuccess = $('[data-contact-success]');

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors(contactForm);
      hideAlert(contactForm);
      var result = validateContact(contactForm);
      if (Object.keys(result.errors).length) {
        showErrors(contactForm, result.errors);
        return;
      }

      if (contactBtn) {
        contactBtn.classList.add('is-loading');
        contactBtn.setAttribute('aria-busy', 'true');
        contactBtn.disabled = true;
      }

      postJSON('/api/contact', result.data)
        .then(function (res) {
          if (res.status === 201) {
            contactForm.reset();
            if (contactSuccess) {
              contactSuccess.hidden = false;
              contactSuccess.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
            }
            return;
          }
          if (res.status === 422 && res.body && res.body.errors) {
            showErrors(contactForm, res.body.errors);
          } else {
            var alertBox = $('[data-contact-alert]', contactForm);
            if (alertBox) {
              alertBox.textContent =
                (res.body && res.body.message) || 'We could not send that message just now. Please call instead.';
              alertBox.hidden = false;
            }
          }
        })
        .catch(function () {
          var alertBox = $('[data-contact-alert]', contactForm);
          if (alertBox) {
            alertBox.textContent = 'We could not reach the clinic just now. Please call +44 20 7946 0182.';
            alertBox.hidden = false;
          }
        })
        .finally(function () {
          if (contactBtn) {
            contactBtn.classList.remove('is-loading');
            contactBtn.removeAttribute('aria-busy');
            contactBtn.disabled = false;
          }
        });
    });

    $$('input, textarea', contactForm).forEach(function (field) {
      field.addEventListener('input', function () {
        if (field.name) setError(contactForm, field.name, '');
      });
    });
  }
})();
