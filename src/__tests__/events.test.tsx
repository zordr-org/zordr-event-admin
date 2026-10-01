import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EventsList } from '@/features/events/components/EventsList'
import { EventReviewView } from '@/features/events/components/EventReviewView'
import * as apiModule from '@/features/events/api'
import { isChecklistComplete, getBlockingItems } from '@/features/events/lib/status'

// ── Mock next/navigation ───────────────────────────────────────────────────────
const mockPush = vi.fn()
const mockBack = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack, replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/events',
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/providers/SessionProvider', () => ({
  useSession: () => ({ can: () => true })
}))

// ── Helpers ────────────────────────────────────────────────────────────────────
// Note: NEXT_PUBLIC_USE_MOCK_API=true is set in vitest.config.ts, so getEventsApi()
// returns the real MockEventsApi backed by mockEventsList / mockReviewStore.
function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: 0 }, mutations: { retry: 0 } },
  })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

// ── Unit tests: lib/status ─────────────────────────────────────────────────────
describe('lib/status helpers', () => {
  it('isChecklistComplete returns false for all-pending checklist', () => {
    expect(isChecklistComplete([{ status: 'pending' }, { status: 'pending' }])).toBe(false)
  })

  it('isChecklistComplete returns true when all items are looks_good', () => {
    expect(isChecklistComplete([{ status: 'looks_good' }, { status: 'looks_good' }])).toBe(true)
  })

  it('isChecklistComplete returns false when any item is flagged', () => {
    expect(isChecklistComplete([{ status: 'looks_good' }, { status: 'flagged' }])).toBe(false)
  })

  it('getBlockingItems returns labels of non-looks_good items', () => {
    const checklist = [
      { label: 'Banner & Images', status: 'looks_good' as const },
      { label: 'Details & Description', status: 'pending' as const },
      { label: 'Date, Time & Venue', status: 'flagged' as const },
    ]
    expect(getBlockingItems(checklist)).toEqual(['Details & Description', 'Date, Time & Venue'])
  })

  it('getBlockingItems returns empty array when checklist complete', () => {
    expect(getBlockingItems([{ label: 'Banner', status: 'looks_good' }])).toEqual([])
  })
})

vi.mock('@/features/events/api', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/features/events/api')>()
  return {
    ...mod,
    getEventsApi: vi.fn(() => new mod.MockEventsApi())
  }
})

// ── Events List ────────────────────────────────────────────────────────────────
describe('EventsList', () => {
  beforeEach(() => { 
    mockPush.mockClear()
    mockBack.mockClear() 
  })

  it('renders KPI strip and event rows from mock data', async () => {
    renderWithClient(<EventsList />)
    expect(await screen.findByText(/Total Events/i)).toBeInTheDocument()
    expect(await screen.findByText(/Techverse Summit 2026/i)).toBeInTheDocument()
  })

  it('shows Review button for pending_review events', async () => {
    renderWithClient(<EventsList />)
    const reviewBtns = await screen.findAllByRole('button', { name: /review/i })
    expect(reviewBtns.length).toBeGreaterThan(0)
  })

  it('shows View button for non-reviewable events', async () => {
    renderWithClient(<EventsList />)
    const viewBtns = await screen.findAllByRole('button', { name: /^view$/i })
    expect(viewBtns.length).toBeGreaterThan(0)
  })

  it('navigates to review page on Review button click', async () => {
    renderWithClient(<EventsList />)
    const user = userEvent.setup()
    const reviewBtns = await screen.findAllByRole('button', { name: /review/i })
    await user.click(reviewBtns[0])
    expect(mockPush).toHaveBeenCalledWith(expect.stringMatching(/\/events\/evt-\d+\/review/))
  })
})

// ── Event Review View ──────────────────────────────────────────────────────────
describe('EventReviewView', () => {
  beforeEach(() => { 
    mockPush.mockClear()
    mockBack.mockClear() 
  })

  it('renders event title and all 7 checklist items', async () => {
    renderWithClient(<EventReviewView id="evt-4" />)
    expect(await screen.findAllByText(/Design Systems Workshop/i)).not.toHaveLength(0)
    expect(await screen.findAllByText(/Banner & Images/i)).not.toHaveLength(0)
    expect(await screen.findAllByText(/Details & Description/i)).not.toHaveLength(0)
    expect(await screen.findAllByText(/Date, Time & Venue/i)).not.toHaveLength(0)
    expect(await screen.findAllByText(/Ticket Types & Pricing/i)).not.toHaveLength(0)
    expect(await screen.findAllByText(/Organizer Info/i)).not.toHaveLength(0)
    expect(await screen.findAllByText(/Policies & Terms/i)).not.toHaveLength(0)
    expect(await screen.findAllByText(/Content Guidelines/i)).not.toHaveLength(0)
  })

  it('shows Approve button as disabled when checklist is incomplete', async () => {
    renderWithClient(<EventReviewView id="evt-4" />)
    const approveBtns = await screen.findAllByRole('button', { name: /Approve & Publish/i })
    expect(approveBtns[0]).toBeDisabled()
  })

  it('shows Approve button as enabled when all checklist items are looks_good', async () => {
    renderWithClient(<EventReviewView id="evt-6" />) // all looks_good
    const approveBtns = await screen.findAllByRole('button', { name: /Approve & Publish/i })
    expect(approveBtns[0]).not.toBeDisabled()
  })

  it('shows multi-cycle review history for evt-6', async () => {
    renderWithClient(<EventReviewView id="evt-6" />)
    expect(await screen.findAllByText(/Cycle 1/i)).not.toHaveLength(0)
    expect(await screen.findAllByText(/Cycle 2/i)).not.toHaveLength(0)
    expect(await screen.findByText(/Sent Back to Organizer/i)).toBeInTheDocument()
  })

  it('checklist toggle fires updateChecklist mutation', async () => {
    const mockApi = new apiModule.MockEventsApi()
    const originalUpdate = mockApi.updateChecklist.bind(mockApi)
    const mockUpdate = vi.fn().mockImplementation(originalUpdate)
    mockApi.updateChecklist = mockUpdate
    vi.mocked(apiModule.getEventsApi).mockReturnValue(mockApi)

    renderWithClient(<EventReviewView id="evt-5" />)
    const user = userEvent.setup()

    const looksGoodBtns = await screen.findAllByTitle('Looks Good')
    // Click the 2nd one (which is for details_description, currently pending)
    await user.click(looksGoodBtns[1])

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled()
    })

    vi.restoreAllMocks()
  })

  it('Send Back dialog is disabled without notes (< 10 chars)', async () => {
    renderWithClient(<EventReviewView id="evt-4" />)
    const user = userEvent.setup()

    const sendBackBtns = await screen.findAllByRole('button', { name: /Send Back/i })
    await user.click(sendBackBtns[0])

    const dialog = await screen.findByRole('dialog')
    // The confirm button should be disabled while reason is empty
    const confirmButtons = within(dialog).getAllByRole('button')
    const confirmBtn = confirmButtons.find((b) => b.textContent?.includes('Send Back'))!
    expect(confirmBtn).toBeDisabled()
  })

  it('Send Back flow with valid notes fires sendBack mutation', async () => {
    const mockSendBack = vi.fn().mockResolvedValue(undefined)
    const mockApi = new apiModule.MockEventsApi()
    mockApi.sendBack = mockSendBack
    vi.mocked(apiModule.getEventsApi).mockReturnValue(mockApi)

    renderWithClient(<EventReviewView id="evt-4" />)
    const user = userEvent.setup()

    const sendBackBtns = await screen.findAllByRole('button', { name: /Send Back/i })
    await user.click(sendBackBtns[0])
    const dialog = await screen.findByRole('dialog')
    const textarea = within(dialog).getByRole('textbox')
    await user.type(textarea, 'Please fix the banner image resolution.')

    const confirmBtns = within(dialog).getAllByRole('button')
    const confirmBtn = confirmBtns.find((b) => b.textContent?.includes('Send Back') && !b.hasAttribute('disabled'))!
    await user.click(confirmBtn!)

    await waitFor(() => {
      expect(mockSendBack).toHaveBeenCalledWith('evt-4', expect.objectContaining({
        notes: expect.stringContaining('banner image'),
      }))
    })
    vi.restoreAllMocks()
  })

  it('Reject flow fires rejectEvent mutation with reason', async () => {
    const mockReject = vi.fn().mockResolvedValue(undefined)
    const mockApi = new apiModule.MockEventsApi()
    mockApi.rejectEvent = mockReject
    vi.mocked(apiModule.getEventsApi).mockReturnValue(mockApi)

    renderWithClient(<EventReviewView id="evt-4" />)
    const user = userEvent.setup()

    const rejectBtns = await screen.findAllByRole('button', { name: /^Reject$/i })
    await user.click(rejectBtns[0])
    const dialog = await screen.findByRole('dialog')
    const textarea = within(dialog).getByRole('textbox')
    await user.type(textarea, 'Content violates platform guidelines.')

    const confirmBtns = within(dialog).getAllByRole('button')
    const confirmBtn = confirmBtns.find((b) => b.textContent?.includes('Reject Event') && !b.hasAttribute('disabled'))!
    await user.click(confirmBtn!)

    await waitFor(() => {
      expect(mockReject).toHaveBeenCalledWith('evt-4', expect.objectContaining({
        reason: expect.stringContaining('guidelines'),
      }))
    })
    vi.restoreAllMocks()
  })

  it('Preview button calls getPreview and opens modal', async () => {
    const mockGetPreview = vi.fn().mockResolvedValue(apiModule.mockReviewStore['evt-4']!.event)
    const mockApi = new apiModule.MockEventsApi()
    mockApi.getPreview = mockGetPreview
    vi.mocked(apiModule.getEventsApi).mockReturnValue(mockApi)

    renderWithClient(<EventReviewView id="evt-4" />)
    const user = userEvent.setup()

    await user.click(await screen.findByRole('button', { name: /Preview/i }))
    expect(mockGetPreview).toHaveBeenCalledWith('evt-4')
    expect(await screen.findByText(/Customer Preview/i)).toBeInTheDocument()
    expect(screen.getByText(/Admin Preview — Not Live/i)).toBeInTheDocument()

    vi.restoreAllMocks()
  })

  it('hides review action buttons for published event', async () => {
    renderWithClient(<EventReviewView id="evt-8" />) // published
    await screen.findAllByText(/Tech Conference 2026/i)
    expect(screen.queryAllByRole('button', { name: /Approve & Publish/i })).toHaveLength(0)
    expect(screen.queryAllByRole('button', { name: /Send Back/i })).toHaveLength(0)
    expect(screen.queryAllByRole('button', { name: /^Reject$/i })).toHaveLength(0)
  })
})
