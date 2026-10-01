import { z } from 'zod'

// ─── Status Enums ────────────────────────────────────────────────────────────
export const eventStatusSchema = z.enum([
  'draft',
  'submitted',
  'pending_review',
  'published',
  'sent_back',
  'rejected',
  'cancelled',
  'completed',
])

export const checklistItemStatusSchema = z.enum(['pending', 'looks_good', 'flagged'])

export const checklistKeySchema = z.enum([
  'banner_images',
  'details_description',
  'datetime_venue',
  'ticket_pricing',
  'organizer_info',
  'policies_terms',
  'content_guidelines',
])

// ─── List ────────────────────────────────────────────────────────────────────
export const eventListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  organizerId: z.string(),
  organizerName: z.string(),
  category: z.string(),
  city: z.string(),
  dateFrom: z.string(),
  dateTo: z.string(),
  status: eventStatusSchema,
  venueType: z.enum(['offline', 'online', 'hybrid']),
  ticketCount: z.number().int().nonnegative(),
  totalRevenue: z.number().nonnegative(),
  bannerUrl: z.string().optional(),
  submittedAt: z.string().optional(),
})

export const eventPaginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})

export const eventsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    events: z.array(eventListItemSchema),
    pagination: eventPaginationSchema,
  }),
})

export const eventKpiSchema = z.object({
  total: z.number(),
  published: z.number(),
  pendingReview: z.number(),
  completed: z.number(),
  cancelled: z.number(),
})

// ─── Detail / Review ─────────────────────────────────────────────────────────
export const ticketTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().nonnegative(),
  quantity: z.number().int().nonnegative(),
  sold: z.number().int().nonnegative(),
  description: z.string().optional(),
})

export const eventDetailSchema = eventListItemSchema.extend({
  description: z.string(),
  venueName: z.string().optional(),
  venueAddress: z.string().optional(),
  venueLatLng: z.object({ lat: z.number(), lng: z.number() }).optional(),
  bannerImages: z.array(z.string()),
  galleryImages: z.array(z.string()),
  ticketTypes: z.array(ticketTypeSchema),
  tags: z.array(z.string()),
  refundPolicy: z.string().optional(),
  termsAndConditions: z.string().optional(),
  ageRestriction: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
})

export const checklistItemSchema = z.object({
  key: checklistKeySchema,
  label: z.string(),
  status: checklistItemStatusSchema,
  comment: z.string().optional(),
})

export const reviewCycleSchema = z.object({
  id: z.string(),
  cycleNumber: z.number().int().positive(),
  submittedAt: z.string(),
  resolvedAt: z.string().optional(),
  action: z.enum(['pending', 'approved', 'sent_back', 'rejected']),
  adminId: z.string().optional(),
  adminName: z.string().optional(),
  notes: z.string().optional(),
  reason: z.string().optional(),
})

export const eventReviewSchema = z.object({
  event: eventDetailSchema,
  checklist: z.array(checklistItemSchema),
  adminNotes: z.string(),
  reviewHistory: z.array(reviewCycleSchema),
})

export const eventReviewResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    review: eventReviewSchema,
  }),
})

// ─── Form Schemas ─────────────────────────────────────────────────────────────
export const sendBackSchema = z.object({
  notes: z.string().min(10, 'Notes must be at least 10 characters.'),
})

export const rejectEventSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters.'),
})

export const updateChecklistItemSchema = z.object({
  item: checklistKeySchema,
  status: checklistItemStatusSchema,
  comment: z.string().optional(),
})
