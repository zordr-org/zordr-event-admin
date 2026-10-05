export const generateMockOverview = (dateFrom: string, dateTo: string) => ({
  totalGmv: 450000000, // ₹45,00,000
  totalOrders: 1250,
  ticketsSold: 3400,
  activeEvents: 45,
  uniqueCustomers: 1100,
  conversionRate: 8.5
})

export const generateMockTrend = (metric: string, granularity: string, dateFrom: string, dateTo: string) => {
  const isWeekly = granularity === 'weekly'
  const count = isWeekly ? 12 : 30
  const data = []
  const now = new Date(dateTo)
  
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now)
    if (isWeekly) d.setDate(d.getDate() - (i * 7))
    else d.setDate(d.getDate() - i)
    
    if (metric === 'gmv') {
      data.push({ date: d.toISOString(), value: Math.floor(Math.random() * 5000000) + 1000000 })
    } else if (metric === 'orders_customers') {
      data.push({ 
        date: d.toISOString(), 
        value: Math.floor(Math.random() * 50) + 20, // orders
        secondaryValue: Math.floor(Math.random() * 40) + 15 // customers
      })
    } else if (metric === 'user_growth') {
      data.push({ date: d.toISOString(), value: Math.floor(Math.random() * 100) + 50 })
    }
  }
  return data
}

export const generateMockBreakdown = (type: string) => {
  if (type === 'payment_method') {
    return [
      { label: 'UPI', value: 250000000, percentage: 55.5 },
      { label: 'Credit Card', value: 125000000, percentage: 27.8 },
      { label: 'Net Banking', value: 50000000, percentage: 11.1 },
      { label: 'Wallets', value: 25000000, percentage: 5.6 },
    ]
  }
  if (type === 'order_status') {
    return [
      { label: 'Captured', value: 1100, percentage: 88.0 },
      { label: 'Failed', value: 100, percentage: 8.0 },
      { label: 'Refunded', value: 50, percentage: 4.0 },
    ]
  }
  if (type === 'settlement_status') {
    return [
      { label: 'Paid', value: 300000000, percentage: 66.7 },
      { label: 'Pending', value: 100000000, percentage: 22.2 },
      { label: 'On Hold', value: 50000000, percentage: 11.1 },
    ]
  }
  return []
}

export const generateMockLeaderboard = (type: string, limit: number = 10) => {
  const data = []
  if (type === 'top_events') {
    const events = ['Techverse Summit', 'Music Fest', 'Startup Pitch', 'Comedy Night', 'Yoga Retreat']
    for (let i = 0; i < Math.min(limit, events.length); i++) {
      data.push({ rank: i + 1, label: events[i], metric: Math.floor(10000000 / (i + 1)) })
    }
  } else if (type === 'top_organizers') {
    const orgs = ['Zordr Internal', 'Eventify', 'LiveNation IN', 'Local Gigs', 'Tech Meetups']
    for (let i = 0; i < Math.min(limit, orgs.length); i++) {
      data.push({ rank: i + 1, label: orgs[i], metric: Math.floor(20000000 / (i + 1)) })
    }
  } else if (type === 'customers_by_city') {
    const cities = ['Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune']
    for (let i = 0; i < Math.min(limit, cities.length); i++) {
      data.push({ rank: i + 1, label: cities[i], metric: Math.floor(5000 / (i + 1)) })
    }
  }
  return data
}
