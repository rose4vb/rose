'use strict';

/**
 * Editorial content for Sakura Smile Dental Clinic.
 * Seeded into SQLite on first boot; afterwards the clinic edits it from /admin.
 */

const u = (id, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
const p = (id, w = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

const IMG = {
  hero: p(3845983, 1400),
  dentist: p(5355856, 1100),
  consult: p(4269693, 1100),
  team: p(6812542, 1200),
  scan: u('1600170311833-c2cf5280ce49'),
  aligner: u('1609840114035-3c981b782dfe'),
  implant: u('1593022356769-11f762e25ed9'),
  xray: u('1588776814546-1ffcf47267a5'),
  mirror: u('1606265752439-1f18756aa5fc'),
  smileWoman: u('1524504388940-b1c1722653e1'),
  smileMan: u('1517841905240-472988babdf9'),
  toothbrush: u('1607613009820-a29f7bb81c04'),
  room: u('1616391182219-e080b4d1043a'),
  lounge: u('1596079890744-c1a0462d0975'),
  clinicWide: u('1629909613654-28e377c37b09'),
  tools: p(305566),
  procedure: p(6528909),
  gardenRoom: u('1598256989800-fe5f95da9787'),
  woman1: u('1494790108377-be9c29b29330', 400),
  man1: u('1517841905240-472988babdf9', 400),
  woman2: u('1544005313-94ddf0286df2', 400),
  man2: u('1507003211169-0a1dd7228f2d', 400),
  woman3: u('1573496359142-b8d87734a5a2', 400),
  woman4: u('1438761681033-6461ffad8d80', 400),
  clinician: u('1622253692010-333f2da6031d', 800),
  doctor: u('1612349317150-e413f6a5b16d', 800),
  talk: u('1581056771107-24ca5f033842'),
};

const clinic = {
  name: 'Sakura Smile',
  subtitle: 'Dental Clinic',
  tagline: 'Gentle dentistry, thoughtfully designed around you.',
  address: '24 Wimpole Street, Marylebone, London W1G 8GP',
  phone: '+44 20 7946 0182',
  phoneHref: '+442079460182',
  whatsapp: '447700900123',
  email: 'hello@sakurasmile.clinic',
  hours: [
    { day: 'Monday – Thursday', time: '9:00 — 18:00' },
    { day: 'Friday', time: '9:00 — 17:00' },
    { day: 'Saturday', time: '9:00 — 14:00' },
    { day: 'Sunday', time: 'Closed' },
  ],
  social: [
    { label: 'Instagram', href: 'https://www.instagram.com/' },
    { label: 'Facebook', href: 'https://www.facebook.com/' },
  ],
  map: 'https://www.openstreetmap.org/export/embed.html?bbox=-0.1512%2C51.5142%2C-0.1402%2C51.5212&layer=mapnik&marker=51.5177%2C-0.1457',
  mapLink: 'https://www.openstreetmap.org/?mlat=51.5177&mlon=-0.1457#map=17/51.5177/-0.1457',
};

const services = [
  {
    slug: 'preventive-dentistry',
    name: 'Preventive Dentistry',
    icon: 'shield',
    tagline: 'Quiet, regular care that keeps small things small.',
    blurb:
      'Routine examinations, hygienist cleanings and honest guidance for a smile that stays well.',
    image: IMG.mirror,
    price: 'From £85',
    duration: '45 minutes',
    featured: 1,
    sort: 1,
    description:
      'Most dental problems begin quietly. Our preventive programme is built around noticing them early — with unhurried examinations, gentle hygiene appointments and a plan you actually understand.\n\nWe take time to look at the whole picture: how you bite, how you sleep, what you eat, and what you would like to change. Nothing is decided for you; everything is explained before it is recommended.',
    benefits: [
      'Comprehensive examination with digital X-rays only where needed',
      'Gentle scale and polish with our hygienist',
      'Personal coaching on brushing, flossing and diet',
      'A written prevention plan you can keep',
    ],
    steps: [
      { title: 'A conversation first', text: 'We begin by listening — your concerns, your history, your goals.' },
      { title: 'A careful examination', text: 'Teeth, gums, bite and soft tissue, checked calmly and thoroughly.' },
      { title: 'A clear plan', text: 'You leave with a written summary, priorities and honest costs.' },
      { title: 'Gentle maintenance', text: 'Hygiene visits at the rhythm that suits your mouth, not a fixed schedule.' },
    ],
    faqs: [
      { q: 'How often should I visit?', a: 'For most patients every six months is right. If your gums need more support we may suggest three or four visits a year, and we will always explain why.' },
      { q: 'Do you use X-rays at every visit?', a: 'No. We take images only when they will change a decision, and we discuss the reason with you first.' },
      { q: 'I am nervous about the hygienist. Can you help?', a: 'Yes. We work at your pace, explain each instrument before it is used, and can offer topical numbing gel.' },
    ],
    worry: {
      q: 'Worried the visit will feel rushed?',
      a: 'Appointments are booked with generous time — 45 minutes for a first preventive visit, never a conveyor belt.',
    },
  },
  {
    slug: 'cosmetic-dentistry',
    name: 'Cosmetic Dentistry',
    icon: 'sparkle',
    tagline: 'Refinement that still looks like you.',
    blurb:
      'Whitening, composite bonding, veneers and smile design with a light, natural hand.',
    image: IMG.smileWoman,
    price: 'From £240',
    duration: '60 minutes',
    featured: 1,
    sort: 2,
    description:
      'A beautiful smile is not a template. We design around your face, your colouring and the way you speak — then choose the least invasive treatment that gets you there.\n\nOften that means whitening and a little bonding rather than a full set of veneers. We will always show you the conservative option first, and we are happy to say when nothing needs doing.',
    benefits: [
      'Shade assessment in natural light, not under surgery lamps',
      'Digital smile preview before treatment begins',
      'Conservative preparation — as much enamel kept as possible',
      'Staged plans that let you stop at any point',
    ],
    steps: [
      { title: 'Design consultation', text: 'Photographs, a shade match and a conversation about what you want to change.' },
      { title: 'Digital preview', text: 'See a realistic mock-up of the result before any treatment starts.' },
      { title: 'Treatment', text: 'One comfortable visit for whitening or bonding; veneers over two.' },
      { title: 'Polish & review', text: 'A follow-up to refine edges, check bite and protect the result.' },
    ],
    faqs: [
      { q: 'Will whitening damage my enamel?', a: 'Professionally supervised whitening is safe. We check sensitivity first and use a concentration suited to your teeth.' },
      { q: 'How long does bonding last?', a: 'Typically five to eight years with good care. We can repair or refresh it without starting again.' },
      { q: 'Do veneers always mean drilling?', a: 'No. Many veneers are no-prep or minimal-prep. We will tell you honestly whether yours can be.' },
    ],
    worry: {
      q: 'Worried it will look artificial?',
      a: 'We build in translucency and slight asymmetry. The goal is a smile people notice without being able to say why.',
    },
  },
  {
    slug: 'dental-implants',
    name: 'Dental Implants',
    icon: 'implant',
    tagline: 'A quiet, permanent answer to a missing tooth.',
    blurb:
      'Titanium implants planned digitally, placed gently and restored to match your natural teeth.',
    image: IMG.implant,
    price: 'From £2,400',
    duration: '90 minutes',
    featured: 1,
    sort: 3,
    description:
      'A missing tooth changes more than a smile — it shifts how you eat and how the neighbouring teeth wear. An implant replaces the root itself, so the bone stays supported and the result feels like your own tooth.\n\nWe plan every implant on a 3D scan before we begin, which means fewer surprises, smaller incisions and a calmer recovery. Sedation is available if you would like it.',
    benefits: [
      'CBCT-guided planning for precise placement',
      'Single tooth, bridge or full-arch options',
      'Sedation available for anxious patients',
      'Restored by the same clinician who placed it',
    ],
    steps: [
      { title: '3D assessment', text: 'A scan shows bone volume, nerve position and the ideal implant site.' },
      { title: 'Placement', text: 'A gentle procedure under local anaesthetic, usually 45–60 minutes.' },
      { title: 'Healing', text: 'The implant integrates quietly over eight to twelve weeks.' },
      { title: 'Restoration', text: 'A custom crown, shaped and shaded to match its neighbours.' },
    ],
    faqs: [
      { q: 'Does implant placement hurt?', a: 'The procedure itself is numb. Most patients describe mild tenderness for two or three days, managed with ordinary pain relief.' },
      { q: 'Am I too old for an implant?', a: 'Age is rarely the deciding factor — bone health and general health matter more. We assess both honestly.' },
      { q: 'What if I do not have enough bone?', a: 'A graft can often create the volume needed. We will explain the added time and cost before you commit.' },
    ],
    worry: {
      q: 'Worried about the cost of a surprise?',
      a: 'Your written plan includes the implant, the abutment and the crown as one fixed figure. No staged extras.',
    },
  },
  {
    slug: 'restorative-dentistry',
    name: 'Restorative Dentistry',
    icon: 'crown',
    tagline: 'Rebuilding strength, quietly and conservatively.',
    blurb:
      'Fillings, crowns and root canal treatment that protect what is healthy and restore what is not.',
    image: IMG.procedure,
    price: 'From £165',
    duration: '45–90 minutes',
    featured: 0,
    sort: 4,
    description:
      'Restorative work should be invisible — in how it feels, how it looks and how long it lasts. We use tooth-coloured materials and remove only what genuinely needs to go.\n\nWhere a tooth is heavily worn or cracked, we plan the restoration digitally so the fit, bite and colour are right the first time.',
    benefits: [
      'Mercury-free, tooth-coloured materials',
      'Digital scanning instead of putty impressions',
      'Same-day crowns available for selected teeth',
      'Careful bite balancing to protect the result',
    ],
    steps: [
      { title: 'Diagnosis', text: 'We identify why the tooth failed, not just where it hurts.' },
      { title: 'Planning', text: 'A scan and shade match guide the restoration.' },
      { title: 'Treatment', text: 'Comfortable, conservative preparation under anaesthetic.' },
      { title: 'Fit & review', text: 'Bite checked carefully, then reviewed at your next visit.' },
    ],
    faqs: [
      { q: 'Do you use silver fillings?', a: 'No. We place tooth-coloured composite and ceramic restorations only.' },
      { q: 'Is root canal treatment painful?', a: 'Modern root canal treatment is done under anaesthetic and is usually more comfortable than the toothache that brought you in.' },
      { q: 'How long does a crown take?', a: 'Usually two visits, or one longer visit with our digital milling unit.' },
    ],
    worry: {
      q: 'Worried about repeated repair work?',
      a: 'We diagnose the cause — grinding, acid, a high bite — so the same tooth does not keep failing.',
    },
  },
  {
    slug: 'orthodontics',
    name: 'Orthodontics',
    icon: 'braces',
    tagline: 'Straighter teeth, without the noise.',
    blurb:
      'Clear aligners and discreet fixed braces for adults and teenagers, planned digitally.',
    image: IMG.aligner,
    price: 'From £1,950',
    duration: '6–18 months',
    featured: 1,
    sort: 5,
    description:
      'Alignment is about more than appearance: crowded teeth are harder to clean, and an uneven bite wears enamel unevenly. Clear aligners let us correct both discreetly.\n\nWe scan your teeth, show you the projected movement, and give you a realistic timeline before you decide. Retainers are included, because the result only lasts if it is held.',
    benefits: [
      'Digital scan and 3D treatment simulation',
      'Removable aligners — no food restrictions',
      'Fewer review visits than fixed braces',
      'Retainers included in the plan',
    ],
    steps: [
      { title: 'Scan & simulation', text: 'See your projected smile before committing to treatment.' },
      { title: 'Aligner fitting', text: 'Small attachments are bonded, and your first set is fitted.' },
      { title: 'Progress reviews', text: 'Short checks every six to eight weeks, in person or by photo.' },
      { title: 'Retention', text: 'Custom retainers protect the new position long-term.' },
    ],
    faqs: [
      { q: 'Can aligners fix every case?', a: 'No. Complex bite problems may need fixed braces or a combined approach. We will tell you at consultation.' },
      { q: 'How many hours a day?', a: 'Twenty to twenty-two hours, removed only to eat, drink anything other than water, and brush.' },
      { q: 'Will people notice?', a: 'Aligners are clear and thin. Most people do not notice until you tell them.' },
    ],
    worry: {
      q: 'Worried about wearing them at work?',
      a: 'Aligners are barely visible at conversation distance, and we plan review visits around your schedule.',
    },
  },
  {
    slug: 'pediatric-dentistry',
    name: 'Pediatric Dentistry',
    icon: 'child',
    tagline: 'First visits that feel like a good memory.',
    blurb:
      'Child-friendly examinations and prevention, paced gently so children stay curious, not fearful.',
    image: IMG.toothbrush,
    price: 'From £65',
    duration: '30 minutes',
    featured: 0,
    sort: 6,
    description:
      'A child’s first dental memory shapes the next twenty years of their oral health. We keep early visits short, playful and free of surprises — a ride in the chair, a look in the mirror, a sticker on the way out.\n\nParents stay alongside. We explain what we are doing to the child, not over them, and we never rush a nervous first appointment.',
    benefits: [
      'Meet-and-greet visits with no treatment',
      'Fluoride varnish and fissure sealants',
      'Habit and diet guidance for parents',
      'A calm, unhurried pace for anxious children',
    ],
    steps: [
      { title: 'Hello visit', text: 'A short, playful introduction to the chair and the team.' },
      { title: 'Gentle examination', text: 'Teeth counted, gums checked, nothing forced.' },
      { title: 'Prevention', text: 'Sealants or varnish where they will genuinely help.' },
      { title: 'Growing habit', text: 'A simple routine the child can own, reviewed as they grow.' },
    ],
    faqs: [
      { q: 'When should my child first visit?', a: 'When the first tooth appears, or by their first birthday — whichever comes first.' },
      { q: 'Can I stay in the room?', a: 'Always. Children settle faster with a familiar face nearby.' },
      { q: 'What if my child will not open their mouth?', a: 'We stop. A second visit often goes differently, and there is no charge for a visit that ends early.' },
    ],
    worry: {
      q: 'Worried your child will be frightened?',
      a: 'Our first appointment involves no instruments at all. We build trust before we build a treatment plan.',
    },
  },
  {
    slug: 'oral-medicine',
    name: 'Oral & Maxillofacial Medicine',
    icon: 'scan',
    tagline: 'Answers for the things that do not feel right.',
    blurb:
      'Diagnosis and management for ulcers, dry mouth, jaw pain and other oral conditions.',
    image: IMG.xray,
    price: 'From £120',
    duration: '45 minutes',
    featured: 0,
    sort: 7,
    description:
      'Not every problem is a tooth. Persistent ulcers, burning sensations, jaw joint pain, dry mouth and soft-tissue changes all deserve a careful look and a clear explanation.\n\nWe examine, investigate where needed, and either treat or refer promptly — with the reasoning shared openly, so you are never left wondering.',
    benefits: [
      'Detailed soft-tissue and jaw examination',
      'Biopsy and referral pathways when indicated',
      'Management plans for dry mouth and TMJ pain',
      'Direct liaison with your GP or specialist',
    ],
    steps: [
      { title: 'History', text: 'A careful conversation about timing, triggers and general health.' },
      { title: 'Examination', text: 'Soft tissue, salivary glands and jaw joints checked systematically.' },
      { title: 'Investigation', text: 'Imaging or tests only where they change the plan.' },
      { title: 'Plan & review', text: 'Treatment, monitoring or a fast specialist referral.' },
    ],
    faqs: [
      { q: 'My ulcer has lasted three weeks — should I worry?', a: 'Any ulcer persisting beyond three weeks should be examined. Most are harmless, but it is worth checking.' },
      { q: 'Do you treat jaw clicking?', a: 'Often yes, with splints, exercises and habit change. Severe cases are referred to a maxillofacial specialist.' },
      { q: 'Can you help with dry mouth?', a: 'Yes. We identify the cause — medication, autoimmune, age-related — and build a management plan.' },
    ],
    worry: {
      q: 'Worried it might be something serious?',
      a: 'We examine promptly and refer within days when needed. You will not be left waiting for an answer.',
    },
  },
  {
    slug: 'digital-dentistry',
    name: 'Digital Dentistry',
    icon: 'sparkle',
    tagline: 'Precision you can see before we begin.',
    blurb:
      'Intraoral scanning, 3D imaging and digital planning for calmer, more predictable treatment.',
    image: IMG.scan,
    price: 'Included in consultation',
    duration: '20 minutes',
    featured: 0,
    sort: 8,
    description:
      'Digital tools do not replace judgement — they make it visible. An intraoral scan replaces the putty impression, a CBCT scan shows anatomy in three dimensions, and a digital plan lets you see the destination before the journey.\n\nIt also means fewer remakes, shorter visits and a record of your teeth that we can compare year after year.',
    benefits: [
      'No impression trays or gag reflex',
      '3D scans for implant and root canal planning',
      'Milled restorations in a single visit',
      'A visual record to track changes over time',
    ],
    steps: [
      { title: 'Scan', text: 'A five-minute, powder-free digital impression.' },
      { title: 'Plan', text: 'Your clinician models the outcome in 3D and shares it with you.' },
      { title: 'Make', text: 'Restorations milled in-house or crafted by our laboratory.' },
      { title: 'Record', text: 'Your scan is stored securely for future comparison.' },
    ],
    faqs: [
      { q: 'Is scanning comfortable?', a: 'Much easier than traditional impressions — no trays, no setting material, no retakes in most cases.' },
      { q: 'Is the scan safe?', a: 'Intraoral scanning uses light, not radiation. CBCT scans use a low dose and only when justified.' },
      { q: 'Can I see my own scan?', a: 'Yes. We are happy to show you your teeth on screen and explain what we are looking at.' },
    ],
    worry: {
      q: 'Worried technology makes it impersonal?',
      a: 'The scan takes minutes; the conversation around it takes the rest of the appointment.',
    },
  },
];

const testimonials = [
  {
    name: 'Aiko M.',
    treatment: 'Porcelain veneers',
    rating: 5,
    avatar: IMG.woman1,
    quote:
      'I had put off treatment for years because I was frightened of being judged. Nobody here made me feel like a problem to be fixed — they just asked what I wanted and showed me how to get there.',
  },
  {
    name: 'Kenji S.',
    treatment: 'Clear aligners',
    rating: 5,
    avatar: IMG.man1,
    quote:
      'Fourteen months of aligners, and not one person at work noticed I was wearing them. The reviews were quick, the plan was honest about timings, and my bite finally feels even.',
  },
  {
    name: 'Maya R.',
    treatment: 'Hygiene & whitening',
    rating: 5,
    avatar: IMG.woman2,
    quote:
      'The hygienist explained every instrument before using it. That sounds small, but it is the first time I have left a dental appointment without my shoulders up by my ears.',
  },
  {
    name: 'Daniel O.',
    treatment: 'Implant consultation',
    rating: 5,
    avatar: IMG.man2,
    quote:
      'I came in expecting a hard sell and left with a written plan, a scan I could actually see, and permission to go away and think. That honesty is why I booked.',
  },
  {
    name: 'Priya N.',
    treatment: 'Composite bonding',
    rating: 5,
    avatar: IMG.woman3,
    quote:
      'Two hours, no drilling, and a chipped front tooth that I can no longer find in the mirror. The colour match is better than I thought possible.',
  },
  {
    name: 'Elena K.',
    treatment: 'Family dentistry',
    rating: 5,
    avatar: IMG.woman4,
    quote:
      'My daughter asked when we could go back to the dentist. I never thought I would hear that sentence. The whole visit felt more like a quiet café than a surgery.',
  },
];

const gallery = [
  { title: 'The reading lounge', caption: 'A quiet corner for the minutes before your visit.', image: IMG.lounge, category: 'Reception', sort: 1 },
  { title: 'Treatment room 02', caption: 'Morning light, and a chair that reclines properly.', image: IMG.room, category: 'Treatment', sort: 2 },
  { title: 'The garden room', caption: 'Where consultations begin, with the window open.', image: IMG.gardenRoom, category: 'Interior', sort: 3 },
  { title: 'Precision instruments', caption: 'Sterilised, checked and laid out before you arrive.', image: IMG.tools, category: 'Equipment', sort: 4 },
  { title: 'The team at work', caption: 'Four-handed dentistry, without the theatre.', image: IMG.team, category: 'Team', sort: 5 },
  { title: 'Digital scanning', caption: 'Three-dimensional planning at the chair.', image: IMG.scan, category: 'Equipment', sort: 6 },
];

const cases = [
  {
    title: 'The Whitening Series',
    category: 'Teeth Whitening',
    before: IMG.smileWoman,
    after: IMG.smileWoman,
    note: 'Demonstration content — not a real patient result.',
    sort: 1,
  },
  {
    title: 'The Bonding Study',
    category: 'Composite Bonding',
    before: IMG.smileMan,
    after: IMG.smileMan,
    note: 'Demonstration content — not a real patient result.',
    sort: 2,
  },
  {
    title: 'The Veneer Chapters',
    category: 'Veneers',
    before: IMG.woman2,
    after: IMG.woman2,
    note: 'Demonstration content — not a real patient result.',
    sort: 3,
  },
  {
    title: 'The Implant Record',
    category: 'Dental Implants',
    before: IMG.man2,
    after: IMG.man2,
    note: 'Demonstration content — not a real patient result.',
    sort: 4,
  },
  {
    title: 'The Alignment Series',
    category: 'Smile Design',
    before: IMG.woman4,
    after: IMG.woman4,
    note: 'Demonstration content — not a real patient result.',
    sort: 5,
  },
];

const faqs = [
  {
    question: 'How can I book an appointment?',
    answer:
      'Request an appointment through the form on this site, call reception on +44 20 7946 0182, or message us on WhatsApp. We reply to online requests within one working day and always confirm by phone before the visit is final.',
    sort: 1,
  },
  {
    question: 'What should I expect during my first visit?',
    answer:
      'A conversation first, then a gentle examination of your teeth, gums and bite. We take photographs and, if needed, a digital scan. You will leave with a written summary, honest options and costs — no treatment is carried out on the first visit unless it is urgent.',
    sort: 2,
  },
  {
    question: 'Do you offer cosmetic dental treatments?',
    answer:
      'Yes. Whitening, composite bonding, porcelain veneers and full smile design are all available. We always present the most conservative option first, and we are comfortable telling you when nothing needs changing.',
    sort: 3,
  },
  {
    question: 'How long does teeth whitening take?',
    answer:
      'In-chair whitening takes about ninety minutes and gives an immediate result. Home whitening, worn over two to three weeks, is gentler on sensitivity and often reaches a similar shade. Many patients combine the two.',
    sort: 4,
  },
  {
    question: 'Are dental implants suitable for everyone?',
    answer:
      'Most healthy adults are suitable, but bone volume, gum health and general health all matter. We assess with a 3D scan and tell you honestly if a bridge or denture would serve you better.',
    sort: 5,
  },
  {
    question: 'How can I find out the cost of treatment?',
    answer:
      'Every consultation ends with a written plan showing each item and its cost. Prices on this site are starting points; the plan is the accurate figure, and it does not change unless you ask for something different.',
    sort: 6,
  },
  {
    question: 'Do you accept insurance?',
    answer:
      'We work with most major dental insurers and can provide itemised invoices for reimbursement. Please tell us your provider when booking so we can confirm cover before your appointment.',
    sort: 7,
  },
  {
    question: 'What should I do in case of a dental emergency?',
    answer:
      'Call the clinic during opening hours and we will see you the same day where possible. Out of hours, our answering service will reach the on-call clinician. For facial swelling affecting breathing or swallowing, go to A&E immediately.',
    sort: 8,
  },
];

const reasons = [
  { icon: 'users', title: 'Clinicians who listen first', text: 'Every appointment begins with a conversation, not a clipboard. Treatment follows your priorities.' },
  { icon: 'scan', title: 'Modern diagnostics', text: 'Intraoral scanning and 3D imaging mean fewer impressions, fewer remakes and fewer surprises.' },
  { icon: 'leaf', title: 'A calmer environment', text: 'Natural light, quiet rooms and no clinical blue. The space is designed to lower your shoulders.' },
  { icon: 'shield', title: 'Strict sterilisation', text: 'Single-use instruments where possible, traceable autoclave cycles and audited hygiene protocols.' },
  { icon: 'heart', title: 'Gentle by default', text: 'Topical numbing, slower pacing and sedation available for patients who need it.' },
  { icon: 'award', title: 'Transparent pricing', text: 'A written plan with fixed figures before treatment starts. No staged surprises.' },
  { icon: 'clock', title: 'Appointments that fit life', text: 'Early mornings, late Thursdays and Saturday sessions — with reminders that actually help.' },
  { icon: 'flower', title: 'One team, whole care', text: 'Preventive, cosmetic and restorative clinicians working from the same plan and the same notes.' },
];

const team = [
  {
    name: 'Dr. Ren Takahashi',
    role: 'Principal Dentist · DDS, MClinDent',
    bio: 'Cosmetic and restorative dentistry, with a particular interest in minimally invasive veneers.',
    image: IMG.dentist,
    lead: 1,
  },
  {
    name: 'Dr. Hana Mori',
    role: 'Orthodontist · BDS, MSc',
    bio: 'Clear aligner therapy for adults and teenagers, and complex bite correction.',
    image: IMG.woman3,
    lead: 0,
  },
  {
    name: 'Yuki Sato',
    role: 'Clinical Lead · Dental Hygienist',
    bio: 'Preventive care, periodontal maintenance and coaching nervous patients through hygiene visits.',
    image: IMG.doctor,
    lead: 0,
  },
];

const dentist = {
  name: 'Dr. Ren Takahashi',
  credentials: 'DDS, Cosmetic & Restorative Dentistry',
  image: IMG.dentist,
  philosophy:
    'I became a dentist because I liked the precision of it. I stayed because of the people — the moment someone sees their own smile without flinching is the whole job, really.',
  bio: 'Ren founded Sakura Smile in 2014 after a decade in restorative practice across Tokyo and London. He teaches minimally invasive veneer work to postgraduate dentists and still takes his own emergency rota.',
  stats: [
    { icon: 'award', value: '12', label: 'Years in practice' },
    { icon: 'users', value: '4,800+', label: 'Patients cared for' },
    { icon: 'flower', value: '9', label: 'Postgraduate qualifications' },
  ],
  education: [
    'DDS — Tokyo Medical and Dental University',
    'MClinDent, Prosthodontics — King’s College London',
    'Diploma in Conscious Sedation — SAAD',
  ],
};

module.exports = { clinic, services, testimonials, gallery, cases, faqs, reasons, team, dentist, IMG };
