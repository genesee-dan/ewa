/*
 * Random scenario generator — every demo run gets a different worker,
 * different earnings, and a differently-shuffled dark-pattern gauntlet.
 */

export const rand = (min, max) => min + Math.random() * (max - min)
export const randInt = (min, max) => Math.floor(rand(min, max + 1))
export const chance = p => Math.random() < p
export const pick = arr => arr[randInt(0, arr.length - 1)]
export const shuffle = arr => [...arr].sort(() => Math.random() - 0.5)
const round2 = n => Math.round(n * 100) / 100

const JOBS = [
  { employer: 'Riverside Medical Center', short: 'Riverside', sub: 'Medical', role: 'Nursing Assistant', rate: [17, 24] },
  { employer: 'Maplewood Diner', short: 'Maplewood', sub: 'Diner', role: 'Server', rate: [11, 15] },
  { employer: 'QuickShip Fulfillment', short: 'QuickShip', sub: 'Warehouse', role: 'Warehouse Associate', rate: [16, 20] },
  { employer: 'Brightside Retail', short: 'Brightside', sub: 'Retail', role: 'Sales Associate', rate: [13, 17] },
  { employer: 'Java Junction Coffee', short: 'Java Junction', sub: 'Coffee', role: 'Barista', rate: [12, 16] },
  { employer: 'Sunrise Senior Care', short: 'Sunrise', sub: 'Senior Care', role: 'Caregiver', rate: [15, 21] },
  { employer: 'City Transit Authority', short: 'City Transit', sub: 'Authority', role: 'Bus Driver', rate: [19, 26] },
  { employer: 'Pine Valley Hotel', short: 'Pine Valley', sub: 'Hotel', role: 'Housekeeper', rate: [13, 16] },
  { employer: 'Golden Wok Kitchen', short: 'Golden Wok', sub: 'Kitchen', role: 'Line Cook', rate: [14, 18] },
  { employer: 'SafeRide Logistics', short: 'SafeRide', sub: 'Logistics', role: 'Delivery Driver', rate: [15, 22] },
]

export function makeScenario() {
  const job = pick(JOBS)
  const rate = round2(randInt(job.rate[0] * 2, job.rate[1] * 2) / 2)
  const hours = randInt(28, 76) / 2 // 14–38 hrs
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
  const advancesPerYear = randInt(22, 34)

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
  }
}

/* ---------------- gauntlet generator ---------------- */

const GUILT_POOL = [
  {
    art: { main: '🥰', minis: ['💚', '🌱', '💚', '🫶'], from: '#dcfce7', to: '#bbf7d0' },
    title: 'Tips keep EarnNow free for everyone',
    body: "Without tips, we couldn't offer 0% interest advances. Even a small tip makes a big difference.",
    acceptLabel: 'Add $4 tip',
    tipValue: 4,
    declineLabel: 'No thanks',
  },
  {
    art: { main: '🫂', minis: ['🎉', '🤝', '💚', '🙌'], from: '#dbeafe', to: '#bfdbfe' },
    title: () => `${pick(['9 out of 10', '87% of', '4 out of 5'])} members tip`,
    body: 'Join millions of members who pay it forward so everyone can access their pay early.',
    acceptLabel: 'Tip $3 — most popular',
    tipValue: 3,
    declineLabel: "I can't tip today",
  },
  {
    art: { main: '🍬', minis: ['✨', '🤏', '🪙', '😊'], from: '#fce7f3', to: '#fbcfe8' },
    title: 'Even $1 makes a difference',
    body: "That's less than a pack of gum. Your $1 helps another member get paid early today.",
    acceptLabel: 'Tip $1',
    tipValue: 1,
    declineLabel: 'Continue without tipping',
  },
  {
    art: { main: '☕', minis: ['🥐', '😋', '✨', '💛'], from: '#fef3c7', to: '#fde68a' },
    title: 'Less than your morning coffee',
    body: 'A $3 tip costs less than a latte — and it keeps payday in your pocket, not the bank\'s.',
    acceptLabel: 'Tip $3',
    tipValue: 3,
    declineLabel: 'Skip the tip',
  },
  {
    art: { main: '🦸', minis: ['⭐', '💚', '🏅', '💪'], from: '#e0e7ff', to: '#c7d2fe' },
    title: 'Be a community hero',
    body: 'Members who tip get a gold heart on their profile and our eternal gratitude. 💛',
    acceptLabel: 'Tip $2 & get my heart',
    tipValue: 2,
    declineLabel: "I don't need a heart",
  },
  {
    art: { main: '👩‍🍳', minis: ['🏠', '💜', '🙏', '✨'], from: '#fae8ff', to: '#f3e8ff' },
    title: 'Your tip helps members like Maria',
    body: 'Last month, tips helped thousands of members cover rent before it was due. Pay it forward?',
    acceptLabel: 'Tip $2 for Maria',
    tipValue: 2,
    declineLabel: 'Not this time',
  },
  {
    art: { main: '⚡', minis: ['🚀', '⏱️', '💨', '✨'], from: '#cffafe', to: '#a5f3fc' },
    title: 'Keep instant transfers alive',
    body: 'Tips fund the infrastructure that gets money to your bank in minutes instead of days.',
    acceptLabel: 'Tip $3 to keep it fast',
    tipValue: 3,
    declineLabel: "I'll risk it",
  },
  {
    art: { main: '🥇', minis: ['👑', '✨', '💎', '🏆'], from: '#fef9c3', to: '#fef08a' },
    title: 'Top members tip 10%',
    body: 'Our most valued members tip a percentage of every advance. Want to join them?',
    acceptLabel: 'Tip 10%',
    tipValue: 'pct10',
    declineLabel: 'Maybe next time',
  },
  {
    art: { main: '🌧️', minis: ['☔', '💧', '🌈', '🍀'], from: '#e0f2fe', to: '#bae6fd' },
    title: 'Help us weather the rainy days',
    body: "Some members can't repay on time. Tips cover the gap so we never charge late fees.",
    acceptLabel: 'Tip $2',
    tipValue: 2,
    declineLabel: 'Continue without tipping',
  },
]

const SURVEYS = [
  {
    question: "Help us understand — why aren't you tipping today?",
    options: ["I can't afford it right now", "I don't believe in tipping an app", 'I tip sometimes, just not today', 'Other'],
  },
  {
    question: 'Quick feedback — what would make you tip next time?',
    options: ['Lower fees', 'Nothing, I never tip', "If I had more money left over", 'Other'],
  },
]

export function makeGauntlet() {
  const guilt = shuffle(GUILT_POOL)
    .slice(0, randInt(2, 5))
    .map(g => ({ kind: 'guilt', ...g, title: typeof g.title === 'function' ? g.title() : g.title }))

  const seq = [...guilt]
  if (chance(0.7)) seq.splice(randInt(0, seq.length), 0, { kind: 'tipstreak' })
  if (chance(0.8)) seq.push({ kind: 'survey', ...pick(SURVEYS) })
  if (chance(0.7)) seq.push({ kind: 'roundup' })

  const menu = shuffle([2, 3, 4, 5, 7]).slice(0, 4).sort((a, b) => b - a)
  return {
    seq,
    tipMenu: menu,
    popularTip: menu[randInt(1, 2)],
    resuggest: chance(0.8) ? randInt(1, 3) : 0,
    lastChance: chance(0.75),
    lastChanceDelay: randInt(2, 5),
    confirmSneak: chance(0.7) ? pick([0.5, 1, 1.5]) : 0,
    checkbox: chance(0.8),
    finalModal: chance(0.8),
  }
}
