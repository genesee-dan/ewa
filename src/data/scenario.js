/*
 * Random scenario generator — every demo run gets a different worker,
 * different earnings, and a differently-shuffled dark-pattern gauntlet.
 *
 * User-facing text for the generated content (jobs, crises, guilt screens,
 * surveys, transactions) lives in the i18n dictionaries under the `data.*`
 * namespace, keyed by the stable `id` on each item here. Components translate
 * at render time via t('data.<...>').
 */

export const rand = (min, max) => min + Math.random() * (max - min)
export const randInt = (min, max) => Math.floor(rand(min, max + 1))
export const chance = p => Math.random() < p
export const pick = arr => arr[randInt(0, arr.length - 1)]
export const shuffle = arr => [...arr].sort(() => Math.random() - 0.5)
const round2 = n => Math.round(n * 100) / 100

const JOBS = [
  { id: 'nurse',     employer: 'Riverside Medical Center', short: 'Riverside', sub: 'Medical', role: 'Nursing Assistant', rate: [17, 24] },
  { id: 'server',    employer: 'Maplewood Diner', short: 'Maplewood', sub: 'Diner', role: 'Server', rate: [11, 15] },
  { id: 'warehouse', employer: 'QuickShip Fulfillment', short: 'QuickShip', sub: 'Warehouse', role: 'Warehouse Associate', rate: [16, 20] },
  { id: 'retail',    employer: 'Brightside Retail', short: 'Brightside', sub: 'Retail', role: 'Sales Associate', rate: [13, 17] },
  { id: 'barista',   employer: 'Java Junction Coffee', short: 'Java Junction', sub: 'Coffee', role: 'Barista', rate: [12, 16] },
  { id: 'caregiver', employer: 'Sunrise Senior Care', short: 'Sunrise', sub: 'Senior Care', role: 'Caregiver', rate: [15, 21] },
  { id: 'driver',    employer: 'City Transit Authority', short: 'City Transit', sub: 'Authority', role: 'Bus Driver', rate: [19, 26] },
  { id: 'housekeep', employer: 'Pine Valley Hotel', short: 'Pine Valley', sub: 'Hotel', role: 'Housekeeper', rate: [13, 16] },
  { id: 'cook',      employer: 'Golden Wok Kitchen', short: 'Golden Wok', sub: 'Kitchen', role: 'Line Cook', rate: [14, 18] },
  { id: 'delivery',  employer: 'SafeRide Logistics', short: 'SafeRide', sub: 'Logistics', role: 'Delivery Driver', rate: [15, 22] },
]

// Player-selectable professions for the simulation setup. Each maps to a
// JOBS entry so makeScenario can build a matching scenario.
export const PROFESSIONS = JOBS.map(j => ({
  id: j.id,
  role: j.role,
  employer: j.employer,
  rate: j.rate,
  defaultRate: Math.round((j.rate[0] + j.rate[1]) / 2),
  job: j,
}))

const CRISES_SMALL = [
  { id: 's1', emoji: '⚡', what: "Your electric bill is three weeks overdue. They'll shut it off tomorrow morning.", amount: 89 },
  { id: 's2', emoji: '💊', what: "Your kid needs a prescription refilled. Insurance won't cover it this time.", amount: 65 },
  { id: 's3', emoji: '🚌', what: "Your bus pass expired. You need it to get to work tomorrow — no other way there.", amount: 78 },
  { id: 's4', emoji: '👟', what: "Your work shoes literally fell apart mid-shift. You can't show up like this tomorrow.", amount: 94 },
  { id: 's5', emoji: '🐾', what: "Your dog needs heartworm meds. The vet won't refill prescriptions without them.", amount: 58 },
  { id: 's6', emoji: '🅿️', what: "You got a parking ticket outside work. Pay by Friday or it doubles to $150.", amount: 75 },
  { id: 's7', emoji: '📱', what: "Your phone bill is 10 days past due. They'll cut service at midnight.", amount: 82 },
  { id: 's8', emoji: '🎒', what: "Your kid's field trip payment is due tomorrow. Non-payment means they sit it out alone.", amount: 45 },
  { id: 's9', emoji: '🛒', what: "It's Tuesday. You get paid Friday. The fridge is empty and you've got two kids at home.", amount: 65 },
  { id: 's10', emoji: '⛽', what: "Your tank is on E. Three days until payday and you need to get to work.", amount: 52 },
  { id: 's11', emoji: '📱', what: "Your phone bill is due today. They'll suspend your service at midnight if you don't pay.", amount: 78 },
]

const CRISES_MEDIUM = [
  { id: 'm1', emoji: '🚗', what: 'Your car insurance auto-renewed last night. Your account just hit zero.', amount: 187 },
  { id: 'm2', emoji: '🏠', what: 'Your landlord just texted — a check bounced. You owe a $150 NSF fee by Friday.', amount: 150 },
  { id: 'm3', emoji: '🔧', what: 'Your car needs a new tire. The sidewall blew out. You need it to get to work.', amount: 140 },
  { id: 'm4', emoji: '🦷', what: "You cracked a molar. The dental clinic wants a copay before they'll see you.", amount: 175 },
  { id: 'm5', emoji: '🐕', what: "Your dog ate something. Emergency vet says it's $220 to be safe — or you wait and hope.", amount: 220 },
  { id: 'm6', emoji: '💡', what: "Utility company says you owe a reconnect deposit or service stays off.", amount: 180 },
  { id: 'm7', emoji: '📋', what: "Your registration expired. You just got a fix-it ticket. Pay or lose your plates.", amount: 145 },
  { id: 'm8', emoji: '🌡️', what: "Your kid has had an ear infection for three days. Urgent care wants payment at check-in.", amount: 160 },
  { id: 'm9', emoji: '🏥', what: "Urgent care bill from two months ago finally arrived. Collections in 10 days.", amount: 195 },
  { id: 'm10', emoji: '🏠', what: "Rent comes out Friday. Payday is Monday. Your landlord doesn't do extensions.", amount: 180 },
  { id: 'm11', emoji: '🛒', what: "It's the end of the month. Rent cleared and wiped you out. You still need groceries for the week.", amount: 140 },
]

const CRISES_LARGE = [
  { id: 'l1', emoji: '🔩', what: "Check engine light came on. It's the alternator. You can't drive to work without it.", amount: 385 },
  { id: 'l2', emoji: '✈️', what: "Your mom had a fall. You need a last-minute flight home this weekend.", amount: 380 },
  { id: 'l3', emoji: '💻', what: "Your laptop died. You need it for work. The cheapest replacement is $449.", amount: 449 },
  { id: 'l4', emoji: '🛠️', what: "Your apartment's water heater failed. Landlord says it's a tenant repair.", amount: 320 },
  { id: 'l5', emoji: '🚑', what: "ER copay from last week. Hospital says pay in 10 days or it goes to collections.", amount: 420 },
  { id: 'l6', emoji: '🏚️', what: "New place needs first + last month deposit. Your lease is up next week.", amount: 550 },
]

const CRISES = [...CRISES_SMALL, ...CRISES_MEDIUM, ...CRISES_LARGE]

export function pickRoundCrises(numRounds) {
  if (numRounds === 2) return [pick(CRISES_MEDIUM), pick(CRISES_LARGE)]
  return [pick(CRISES_SMALL), pick(CRISES_MEDIUM), pick(CRISES_LARGE)]
}

export function makeScenario(overrides = {}) {
  const job = overrides.job || pick(JOBS)
  const rate = overrides.rate != null ? round2(overrides.rate) : round2(randInt(job.rate[0] * 2, job.rate[1] * 2) / 2)
  // weeklyPay override drives hours so the player's chosen take-home is honored
  const hours = overrides.weeklyPay != null ? round2(overrides.weeklyPay / rate) : randInt(28, 76) / 2 // 14–38 hrs
  const total = round2(rate * hours)
  const transferredPrior = chance(0.7) ? Math.round(total * rand(0.1, 0.3)) : 0
  // real EWA apps let you access a percentage of earned wages, capped
  const accessPct = randInt(50, 75)
  const limit = Math.min(Math.round((total * accessPct) / 100 / 5) * 5, 750)
  const available = Math.max(20, limit - transferredPrior)
  const daysToPayday = randInt(3, 9)
  const payday = `Jun ${10 + daysToPayday}`
  const progress = Math.min(0.85, Math.max(0.3, 1 - daysToPayday / 14))
  const streak = randInt(3, 9)
  const last4 = String(randInt(1000, 9999))
  const advancesPerYear = 26 // biweekly pay cycle; heavy users advance nearly every payday

  const dates = ['Jun 9', 'Jun 6', 'Jun 3', 'Jun 1', 'May 28', 'May 22', 'May 15']
  const transactions = []
  let id = 1
  if (transferredPrior > 0) {
    const split = chance(0.5) && transferredPrior > 60
    const amts = split
      ? [Math.round(transferredPrior * 0.6), transferredPrior - Math.round(transferredPrior * 0.6)]
      : [transferredPrior]
    amts.forEach((a, i) => {
      const instant = chance(0.7)
      transactions.push({
        id: id++,
        type: 'transfer',
        amount: -a,
        date: dates[i],
        descKind: instant ? 'instant' : 'standard',
        last4,
        description: `${instant ? 'Instant' : 'Standard'} transfer to ••${last4}`,
        status: 'completed',
        fee: instant ? pick([2.99, 3.99, 4.99]) : 0,
      })
    })
  }
  const nOld = randInt(2, 3)
  for (let i = 0; i < nOld; i++) {
    const a = randInt(30, 120)
    const repay = i % 2 === 0
    const instant = chance(0.6)
    transactions.push({
      id: id++,
      type: repay ? 'repay' : 'transfer',
      amount: repay ? a : -a,
      date: dates[3 + i],
      descKind: repay ? 'repay' : (instant ? 'instant' : 'standard'),
      last4,
      description: repay ? 'Repayment from paycheck' : `${instant ? 'Instant' : 'Standard'} transfer to ••${last4}`,
      status: 'completed',
      fee: repay || !instant ? 0 : pick([2.99, 3.99]),
    })
  }

  return {
    job,
    rate,
    hours,
    accessPct,
    limit,
    earned: { total, available, transferred: transferredPrior },
    transactions,
    daysToPayday,
    payday,
    progress,
    streak,
    last4,
    advancesPerYear,
    crisis: pick(CRISES),
  }
}

/* ---------------- gauntlet generator ---------------- */

// Text for each guilt screen lives in i18n under data.guilt.<id>.*
// Here we keep only the art, the tip value, and (for the social-proof screen)
// a flag that a random fraction phrase gets injected at build time.
const GUILT_POOL = [
  { id: 'tipsfree',   art: { main: '🥰', minis: ['💚', '🌱', '💚', '🫶'], from: '#dcfce7', to: '#bbf7d0' }, tipValue: 4 },
  { id: 'social',     art: { main: '🫂', minis: ['🎉', '🤝', '💚', '🙌'], from: '#dbeafe', to: '#bfdbfe' }, tipValue: 3, dynamicFrac: true },
  { id: 'dollar',     art: { main: '🍬', minis: ['✨', '🤏', '🪙', '😊'], from: '#fce7f3', to: '#fbcfe8' }, tipValue: 1 },
  { id: 'coffee',     art: { main: '☕', minis: ['🥐', '😋', '✨', '💛'], from: '#fef3c7', to: '#fde68a' }, tipValue: 3 },
  { id: 'hero',       art: { main: '🦸', minis: ['⭐', '💚', '🏅', '💪'], from: '#e0e7ff', to: '#c7d2fe' }, tipValue: 2 },
  { id: 'maria',      art: { main: '👩‍🍳', minis: ['🏠', '💜', '🙏', '✨'], from: '#fae8ff', to: '#f3e8ff' }, tipValue: 2 },
  { id: 'instant',    art: { main: '⚡', minis: ['🚀', '⏱️', '💨', '✨'], from: '#cffafe', to: '#a5f3fc' }, tipValue: 3 },
  { id: 'top10',      art: { main: '🥇', minis: ['👑', '✨', '💎', '🏆'], from: '#fef9c3', to: '#fef08a' }, tipValue: 'pct10' },
  { id: 'rainy',      art: { main: '🌧️', minis: ['☔', '💧', '🌈', '🍀'], from: '#e0f2fe', to: '#bae6fd' }, tipValue: 2 },
]

// Number of social-proof fraction phrases available (data.guilt.social.frac.0..N-1)
export const SOCIAL_FRAC_COUNT = 3

// Survey text lives in i18n under data.survey.<id>.* (question + opt.0..3)
const SURVEYS = [
  { id: 'whynot' },
  { id: 'feedback' },
]
export const SURVEY_OPTION_COUNT = 4

export function makeGauntlet() {
  const guilt = shuffle(GUILT_POOL)
    .slice(0, randInt(2, 5))
    .map(g => ({
      kind: 'guilt',
      id: g.id,
      art: g.art,
      tipValue: g.tipValue,
      fracIndex: g.dynamicFrac ? randInt(0, SOCIAL_FRAC_COUNT - 1) : undefined,
    }))

  const seq = [...guilt]
  if (chance(0.7)) seq.splice(randInt(0, seq.length), 0, { kind: 'tipstreak' })
  if (chance(0.8)) seq.push({ kind: 'survey', ...pick(SURVEYS) })
  if (chance(0.7)) seq.push({ kind: 'roundup' })

  const menu = shuffle([2, 3, 4, 5, 7]).slice(0, 4).sort((a, b) => b - a)
  return {
    seq,
    tipMenu: menu,
    popularTip: menu[randInt(1, 2)],
    resuggest: 2,
    lastChance: true,
    lastChanceDelay: 2,
    confirmSneak: 1,
    checkbox: true,
    finalModal: true,
  }
}
