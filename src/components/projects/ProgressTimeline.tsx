import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { ProgressMessage } from '@/services/progressService';

interface Props {
  messages: ProgressMessage[];
}

function formatDate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString();
}

export const ProgressTimeline = ({ messages }: Props) => {
  const sorted = [...messages].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress updates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sorted.length === 0 && <div className="text-sm text-muted-foreground">No updates yet.</div>}
          {sorted.map((m) => (
            <div key={m.id} className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                {m.authorName ? m.authorName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{m.authorName ?? 'Unknown'}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(m.createdAt)}</div>
                </div>
                <div className="mt-1 text-sm text-foreground">{m.content}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressTimeline;
