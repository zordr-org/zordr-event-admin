import {
  LayoutDashboard,
  Users,
  Calendar,
  ShoppingCart,
  UserCircle,
  Banknote,
  RotateCcw,
  Headphones,
  BarChart3,
  UserCheck,
  Settings,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Module } from '@/types/auth'

export interface NavItem {
  key: Module
  label: string
  href: string
  icon: LucideIcon
  /** Sidebar bottom tagline shown when this item is active. */
  tagline: string
  requiredAction: 'view'
}

/**
 * Single source of truth for admin navigation.
 * Sidebar and CommandPalette both render from this array.
 * 'roles' is a module in the type system but has no top-level nav entry
 * (accessed as a sub-page from Employees).
 */
export const NAV_ITEMS: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    tagline: 'Building bigger experiences together.',
    requiredAction: 'view',
  },
  {
    key: 'organizers',
    label: 'Organizers',
    href: '/organizers',
    icon: Users,
    tagline: 'Better events. Stronger communities.',
    requiredAction: 'view',
  },
  {
    key: 'events',
    label: 'Events',
    href: '/events',
    icon: Calendar,
    tagline: 'More events. Stronger communities.',
    requiredAction: 'view',
  },
  {
    key: 'orders',
    label: 'Orders',
    href: '/orders',
    icon: ShoppingCart,
    tagline: 'Every order, tracked and accounted for.',
    requiredAction: 'view',
  },
  {
    key: 'customers',
    label: 'Customers',
    href: '/customers',
    icon: UserCircle,
    tagline: 'Serving every attendee, seamlessly.',
    requiredAction: 'view',
  },
  {
    key: 'settlements',
    label: 'Settlements',
    href: '/settlements',
    icon: Banknote,
    tagline: 'Every rupee, settled on time.',
    requiredAction: 'view',
  },
  {
    key: 'refunds',
    label: 'Refunds',
    href: '/refunds',
    icon: RotateCcw,
    tagline: 'Fair and fast, every time.',
    requiredAction: 'view',
  },
  {
    key: 'support',
    label: 'Support',
    href: '/support',
    icon: Headphones,
    tagline: 'Every issue resolved with care.',
    requiredAction: 'view',
  },
  {
    key: 'analytics',
    label: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    tagline: 'Data drives better events. Bigger communities.',
    requiredAction: 'view',
  },
  {
    key: 'employees',
    label: 'Employees',
    href: '/employees',
    icon: UserCheck,
    tagline: 'Empower great teams. Bigger events.',
    requiredAction: 'view',
  },
  {
    key: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    tagline: 'Your platform, your rules.',
    requiredAction: 'view',
  },
]

/** Map from pathname prefix to Module key. */
export const PATH_TO_MODULE: Record<string, Module> = Object.fromEntries(
  NAV_ITEMS.map((item) => [item.href, item.key]),
)