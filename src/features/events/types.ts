import { z } from 'zod'
import {
  eventStatusSchema,
  checklistItemStatusSchema,
  checklistKeySchema,
  eventListItemSchema,
  eventPaginationSchema,
  eventsResponseSchema,
  eventKpiSchema,
  ticketTypeSchema,
  eventDetailSchema,
  checklistItemSchema,
  reviewCycleSchema,
  eventReviewSchema,
  eventReviewResponseSchema,
  sendBackSchema,
  rejectEventSchema,
  updateChecklistItemSchema,
} from './schemas'

export type EventStatus = z.infer<typeof eventStatusSchema>
export type ChecklistItemStatus = z.infer<typeof checklistItemStatusSchema>
export type ChecklistKey = z.infer<typeof checklistKeySchema>

export type EventListItem = z.infer<typeof eventListItemSchema>
export type EventPagination = z.infer<typeof eventPaginationSchema>
export type EventsResponse = z.infer<typeof eventsResponseSchema>
export type EventKpi = z.infer<typeof eventKpiSchema>

export type TicketType = z.infer<typeof ticketTypeSchema>
export type EventDetail = z.infer<typeof eventDetailSchema>
export type ChecklistItem = z.infer<typeof checklistItemSchema>
export type ReviewCycle = z.infer<typeof reviewCycleSchema>
export type EventReview = z.infer<typeof eventReviewSchema>
export type EventReviewResponse = z.infer<typeof eventReviewResponseSchema>

export type SendBackFormValues = z.infer<typeof sendBackSchema>
export type RejectEventFormValues = z.infer<typeof rejectEventSchema>
export type UpdateChecklistItemValues = z.infer<typeof updateChecklistItemSchema>

// List query filters
export interface EventFilters {
  page?: number
  limit?: number
  q?: string
  status?: EventStatus
  category?: string
  city?: string
  organizerId?: string
  dateFrom?: string
  dateTo?: string
}
