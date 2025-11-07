import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Props {
  status: string;
  percent?: number;
}

export const ProjectProgressBar = ({ status, percent = 0 }: Props) => {
  const formatted = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Project progress</CardTitle>
          <Badge className="uppercase">{status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Overall completion</span>
            <span className="text-sm font-medium">{formatted}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary"
              style={{ width: `${formatted}%` }}
              aria-hidden
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectProgressBar;
