'use client';

import { AppLayout } from '@/components/layout';
import { BorrowInterface } from '@/components/borrow/borrow-interface';

export default function BorrowPage() {
  return (
    <AppLayout>
      <div className="flex items-start justify-center min-h-[calc(100vh-64px)] px-12 py-10">
        <div className="w-full max-w-[650px]">
          <BorrowInterface />
        </div>
      </div>
    </AppLayout>
  );
}
