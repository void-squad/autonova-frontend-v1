// Simple demo data used by progressService when projectId === 'demo'
// Keep shapes minimal and purposely loose to avoid tight coupling with API types.

export const DEMO_PROJECT = {
  id: 'demo',
  name: 'Demo Renovation Project',
  customerName: 'Acme Co',
  description: 'A short demo project to preview progress UI and attachments.',
  status: 'In Progress',
  startDate: '2025-10-01',
  endDate: '2025-12-15',
  budget: 15000,
};

export const DEMO_PROGRESS = {
  projectId: 'demo',
  status: 'In Progress',
  progressPercentage: 42,
  messages: [
    {
      id: 'm1',
      authorName: 'Samantha (PM)',
      content: 'Installed initial wiring and inspected site. Waiting on parts for HVAC.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      attachmentUrl: 'https://placehold.co/600x400?text=site-photo-1',
    },
    {
      id: 'm2',
      authorName: 'Carlos (Electrician)',
      content: 'Completed breaker panel and labeled circuits.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
      attachmentUrl: null,
    },
    {
      id: 'm3',
      authorName: 'System',
      content: 'Project created and kickoff completed.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      attachmentUrl: null,
    },
  ],
};

export function createDemoMessage(content: string, authorName = 'Demo User', attachmentUrl?: string) {
  return {
    id: `dm_${Date.now()}`,
    authorName,
    content,
    createdAt: new Date().toISOString(),
    attachmentUrl: attachmentUrl ?? null,
  };
}
