'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock data - would be fetched from API in real app
const recentFiles = [
  { id: 1, name: 'Logo Design Final.png', date: '2023-06-12', type: 'PNG', size: '1.2 MB' },
  { id: 2, name: 'Business Card.pdf', date: '2023-06-10', type: 'PDF', size: '856 KB' },
  { id: 3, name: 'Website Mockup.jpg', date: '2023-06-08', type: 'JPG', size: '3.7 MB' },
];

export function RecentFiles() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Files</CardTitle>
        <CardDescription>Recently delivered designs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentFiles.length === 0 ? (
            <p className="text-sm text-center py-4 text-muted-foreground">No files yet</p>
          ) : (
            <div className="space-y-3">
              {recentFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 bg-slate-100 text-slate-500`}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{file.type} • {file.size}</p>
                    </div>
                  </div>
                  <div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/designs/${file.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Link href="/dashboard/designs" className="w-full">
          <Button variant="outline" className="w-full">View All Files</Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 