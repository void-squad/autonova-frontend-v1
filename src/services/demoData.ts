// Simple sample data used by progressService when projectId === 'demo'
// Kept minimal and loosely typed to avoid tight coupling with API types.

export const DEMO_PROJECT = {
  id: 'PROJ-1234-001',
  name: '1969 Mustang Restoration Project',
  customerName: 'Saman Perera',
  description:
    'Full mechanical and cosmetic restoration of a 1969 Ford Mustang Fastback, including engine rebuild, paint, and interior refurbishment.',
  status: 'In Progress',
  startDate: '2025-09-15',
  endDate: '2025-12-20',
  budget: 42000,
};

export const DEMO_PROGRESS = {
  projectId: 'demo',
  status: 'In Progress',
  progressPercentage: 58,
  messages: [
    {
      id: 'm1',
      authorName: 'Daniel (Lead Mechanic)',
      content:
        'Engine block has been machined and reassembled with new pistons and bearings. Next step is installing the transmission and testing alignment.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      attachmentUrl: 'https://placehold.co/600x400?text=Engine+Assembly',
    },
    {
      id: 'm2',
      authorName: 'Maria (Body Specialist)',
      content:
        'Body panels repaired and primer applied. Waiting for paint booth availability to start the final coat.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
      attachmentUrl: 'https://placehold.co/600x400?text=Body+Primer',
    },
    {
      id: 'm3',
      authorName: 'System',
      content: 'Project initialized and teardown completed successfully.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      attachmentUrl: null,
    },
  ],
};

export function createDemoMessage(content: string, authorName = 'Workshop Member', attachmentUrl?: string) {
  return {
    id: `dm_${Date.now()}`,
    authorName,
    content,
    createdAt: new Date().toISOString(),
    attachmentUrl: attachmentUrl ?? null,
  };
}
