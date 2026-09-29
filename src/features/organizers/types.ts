import { z } from 'zod'
import {
  organizerStatusSchema,
  kycStatusSchema,
  organizerListSchema,
  organizerPaginationSchema,
  organizersResponseSchema,
  organizerKpiSchema,
  rejectOrganizerSchema,
  suspendOrganizerSchema,
  addNoteSchema,
  organizerNoteSchema,
  organizerDocumentSchema,
  organizerDetailSchema,
  organizerDetailResponseSchema
} from './schemas'

export type OrganizerStatus = z.infer<typeof organizerStatusSchema>
export type KycStatus = z.infer<typeof kycStatusSchema>
export type OrganizerList = z.infer<typeof organizerListSchema>
export type OrganizerPagination = z.infer<typeof organizerPaginationSchema>
export type OrganizersResponse = z.infer<typeof organizersResponseSchema>
export type OrganizerKpi = z.infer<typeof organizerKpiSchema>

export type RejectOrganizerFormValues = z.infer<typeof rejectOrganizerSchema>
export type SuspendOrganizerFormValues = z.infer<typeof suspendOrganizerSchema>
export type AddNoteFormValues = z.infer<typeof addNoteSchema>

export type OrganizerNote = z.infer<typeof organizerNoteSchema>
export type OrganizerDocument = z.infer<typeof organizerDocumentSchema>
export type OrganizerDetail = z.infer<typeof organizerDetailSchema>
export type OrganizerDetailResponse = z.infer<typeof organizerDetailResponseSchema>

// List query params
export interface OrganizerFilters {
  page?: number
  limit?: number
  q?: string
  status?: OrganizerStatus
  kyc?: KycStatus
  city?: string
  sort?: string
}
