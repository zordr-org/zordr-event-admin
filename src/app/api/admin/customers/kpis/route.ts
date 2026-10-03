import { NextResponse } from 'next/server'
import { mockCustomersList } from '@/features/customers/api'

export async function GET() {
  const totalCustomers = mockCustomersList.length
  const activeCustomers = mockCustomersList.filter((c) => c.status === 'active').length
  const blockedCustomers = mockCustomersList.filter((c) => c.status === 'blocked').length
  
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const newThisMonth = mockCustomersList.filter((c) => new Date(c.joinedOn) >= firstDayOfMonth).length
  
  const repeatCustomers = mockCustomersList.filter((c) => c.eventsAttended > 1).length
  
  return NextResponse.json({
    totalCustomers,
    activeCustomers,
    newThisMonth,
    repeatCustomers,
    blockedCustomers
  })
}
