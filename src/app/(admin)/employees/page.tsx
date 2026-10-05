import { Metadata } from 'next'
import { EmployeesList } from '@/features/employees'

export const metadata: Metadata = {
  title: 'Employees | Zordr Admin',
}

export default function EmployeesPage() {
  return <EmployeesList />
}