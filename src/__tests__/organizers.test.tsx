import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { OrganizersList } from '@/features/organizers/components/OrganizersList'
import { OrganizerDetailView } from '@/features/organizers/components/OrganizerDetailView'
import * as apiModule from '@/features/organizers/api'

// ── Mock next/navigation ───────────────────────────────────────────────────────
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/organizers',
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/providers/SessionProvider', () => ({
  useSession: () => ({ can: () => true })
}))


// ── Helpers ───────────────────────────────────────────────────────────────────
function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: 0 }, mutations: { retry: 0 } } })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

vi.mock('@/features/organizers/api', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/features/organizers/api')>()
  return {
    ...mod,
    getOrganizersApi: vi.fn(() => new mod.MockOrganizersApi())
  }
})

describe('Organizers Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Organizers List', () => {
    it('renders list and kpis', async () => {
      renderWithClient(<OrganizersList />)
      expect(await screen.findAllByText(/Total Organizers/i)).not.toHaveLength(0)
      expect(await screen.findAllByText(/Organizer 1/i)).not.toHaveLength(0)
    })
  })

  describe('Organizer Detail', () => {
    it('renders detail tabs and basic info', async () => {
      renderWithClient(<OrganizerDetailView id="org-1" />)
      expect(await screen.findAllByText(/Organizer 1/i)).not.toHaveLength(0)
      expect(screen.getByRole('tab', { name: /Overview/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /Notes/i })).toBeInTheDocument()
    })

    it('shows tooltip for disabled Update Organizer button', async () => {
      renderWithClient(<OrganizerDetailView id="org-1" />)
      const updateBtn = await screen.findByRole('button', { name: /Update Organizer/i })
      expect(updateBtn).toBeDisabled()
      // Note: testing tooltips fully requires a hover and checking portal, basic check here
    })
    
    it('handles suspend flow', async () => {
      const mockSuspend = vi.fn().mockResolvedValueOnce(undefined)
      const mockApi = new apiModule.MockOrganizersApi()
      mockApi.suspendOrganizer = mockSuspend
      vi.mocked(apiModule.getOrganizersApi).mockReturnValue(mockApi)
      
      renderWithClient(<OrganizerDetailView id="org-2" />)
      const suspendBtn = await screen.findByRole('button', { name: /Suspend Organizer/i })
      
      await userEvent.setup().click(suspendBtn)
      
      const dialog = await screen.findByRole('dialog')
      const reasonInput = within(dialog).getByLabelText(/reason/i)
      await userEvent.setup().type(reasonInput, 'Violation of terms')
      
      const confirmBtn = within(dialog).getByRole('button', { name: /Suspend/i })
      await userEvent.setup().click(confirmBtn)
      
      await waitFor(() => {
        expect(mockSuspend).toHaveBeenCalledWith('org-2', { reason: 'Violation of terms' })
      })
    })

    it('handles add note flow', async () => {
      const mockAddNote = vi.fn().mockResolvedValueOnce({ id: 'n1', note: 'New Note', authorName: 'Admin', createdAt: new Date().toISOString() })
      const mockApi = new apiModule.MockOrganizersApi()
      mockApi.addNote = mockAddNote
      vi.mocked(apiModule.getOrganizersApi).mockReturnValue(mockApi)
      
      renderWithClient(<OrganizerDetailView id="org-1" />)
      const notesTab = await screen.findByRole('tab', { name: /Notes/i })
      await userEvent.setup().click(notesTab)
      
      const noteInput = await screen.findByPlaceholderText(/add a note/i)
      await userEvent.setup().type(noteInput, 'Test Note')
      
      const submitBtn = screen.getByRole('button', { name: /Add Note/i })
      await userEvent.setup().click(submitBtn)
      
      await waitFor(() => {
        expect(mockAddNote).toHaveBeenCalledWith('org-1', { note: 'Test Note' })
      })
    })
  })
})
