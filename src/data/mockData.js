export const user = {
  name: 'Alex Johnson',
  employer: 'Riverside Medical Center',
  avatar: null,
  hourlyRate: 24.50,
  hoursWorked: 18.5,
  payPeriodStart: '2026-06-01',
  payPeriodEnd: '2026-06-15',
  nextPayday: 'Jun 15',
  bankLast4: '4821',
  bankName: 'Chase',
}

export const earned = {
  total: 453.25,
  available: 340.00,
  transferred: 113.25,
  maxAdvance: 340.00,
}

export const transactions = [
  {
    id: 1,
    type: 'transfer',
    amount: -80.00,
    date: 'Jun 9',
    description: 'Instant transfer to Chase ••4821',
    status: 'completed',
    fee: 3.99,
  },
  {
    id: 2,
    type: 'transfer',
    amount: -33.25,
    date: 'Jun 6',
    description: 'Instant transfer to Chase ••4821',
    status: 'completed',
    fee: 2.99,
  },
  {
    id: 3,
    type: 'repay',
    amount: 80.00,
    date: 'Jun 1',
    description: 'Repayment from paycheck',
    status: 'completed',
    fee: 0,
  },
  {
    id: 4,
    type: 'transfer',
    amount: -50.00,
    date: 'May 28',
    description: 'Standard transfer to Chase ••4821',
    status: 'completed',
    fee: 0,
  },
  {
    id: 5,
    type: 'repay',
    amount: 50.00,
    date: 'May 15',
    description: 'Repayment from paycheck',
    status: 'completed',
    fee: 0,
  },
]

export const tips = [
  { label: 'No tip', value: 0 },
  { label: '$1', value: 1 },
  { label: '$2', value: 2 },
  { label: '$3', value: 3 },
]
