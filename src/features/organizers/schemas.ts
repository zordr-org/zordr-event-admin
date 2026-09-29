import { z } from 'zod'

export const organizerStatusSchema = z.enum(['approved', 'pending', 'rejected', 'suspended'])
export const kycStatusSchema = z.enum(['verified', 'pending', 'not_submitted', 'rejected'])

export const organizerListSchema = z.object({
  id: z.string().uuid(),
  orgName: z.string(),
  kycStatus: kycStatusSchema,
  activeEvents: z.number().int().nonnegative(),
  totalRevenue: z.number().nonnegative(),
  status: organizerStatusSchema,
  // Added from design
  city: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  joinedOn: z.string(), // ISO date
  avatarUrl: z.string().optional(),
  handle: z.string().optional()
})

export const organizerPaginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})

export const organizersResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    organizers: z.array(organizerListSchema),
    pagination: organizerPaginationSchema
  })
})

export const organizerKpiSchema = z.object({
  total: z.number(),
  approved: z.number(),
  pending: z.number(),
  rejected: z.number(),
  blocked: z.number(),
})

export const rejectOrganizerSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters.'),
})

export const suspendOrganizerSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters.'),
})

export const addNoteSchema = z.object({
  note: z.string().min(5, 'Note must be at least 5 characters.').max(1000, 'Note is too long.'),
})

// Detail schemas
export const organizerNoteSchema = z.object({
  id: z.string().uuid(),
  authorId: z.string(),
  authorName: z.string(),
  note: z.string(),
  createdAt: z.string(),
})

export const organizerDocumentSchema = z.object({
  id: z.string().uuid(),
  docType: z.enum(['pan', 'gst', 'registration', 'other']),
  status: z.enum(['pending_review', 'verified', 'rejected']),
  fileUrl: z.string(),
  uploadedAt: z.string(),
})

export const organizerDetailSchema = organizerListSchema.extend({
  contact: z.object({
    name: z.string(),
    role: z.string(),
    phone: z.string(),
    email: z.string(),
  }),
  orgType: z.string(),
  address: z.string().optional(),
  website: z.string().optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  payoutAccount: z.object({
    id: z.string().uuid(),
    accountHolder: z.string(),
    bankName: z.string(),
    branch: z.string(),
    maskedAccountNumber: z.string(),
    ifsc: z.string(),
    verificationStatus: z.enum(['verified', 'pending', 'failed'])
  }).optional(),
  notes: z.array(organizerNoteSchema),
  documents: z.array(organizerDocumentSchema),
})

export const organizerDetailResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    organizer: organizerDetailSchema
  })
})
