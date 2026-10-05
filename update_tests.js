const fs = require('fs');
const files = ['src/__tests__/settings-ui.test.tsx', 'src/__tests__/roles-ui.test.tsx', 'src/__tests__/support-ui.test.tsx'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes(`vi.mock('@/providers/SessionProvider'`)) {
    // Add the mock
    content = content.replace(`import { SessionProvider } from '@/providers/SessionProvider'`, 
`import { SessionProvider } from '@/providers/SessionProvider'

const mockCan = vi.fn().mockReturnValue(true)
vi.mock('@/providers/SessionProvider', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSession: () => ({ user: null, isLoading: false, can: mockCan }),
}))`);

    // Fix wrappers to not redefine SessionProvider and allow setting mockCan
    if (file.includes('settings')) {
      content = content.replace(/function createWrapper\(canEdit = true\) \{[\s\S]*?Wrapper\.displayName/m, 
`function createWrapper(canEdit = true) {
  mockCan.mockImplementation((mod, action) => {
    if (mod === 'settings' && action === 'edit') return canEdit;
    return true;
  });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
          {children}
      </QueryClientProvider>
    )
  }
  Wrapper.displayName`);
    }

    if (file.includes('roles')) {
      content = content.replace(/function createWrapper\(canCreate = true\) \{[\s\S]*?Wrapper\.displayName/m, 
`function createWrapper(canCreate = true) {
  mockCan.mockImplementation((mod, action) => {
    if (mod === 'roles' && action === 'create') return canCreate;
    return true;
  });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
          {children}
      </QueryClientProvider>
    )
  }
  Wrapper.displayName`);
    }
    
    if (file.includes('support')) {
      content = content.replace(/function createWrapper\(\) \{[\s\S]*?Wrapper\.displayName/m, 
`function createWrapper() {
  mockCan.mockReturnValue(true);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
          {children}
      </QueryClientProvider>
    )
  }
  Wrapper.displayName`);
    }

    fs.writeFileSync(file, content);
  }
}
