import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Event } from '@/models/Event';
import { User } from '@/models/User';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { EventSwitcher } from '@/components/admin/EventSwitcher';

async function getAdminData(userId: string) {
  await connectDB();

  const userDoc = await User.findById(userId).lean();
  const events = await Event.find().sort({ date: -1 }).select('_id name status slug').lean();

  return {
    user: userDoc ? JSON.parse(JSON.stringify(userDoc)) : null,
    events: JSON.parse(JSON.stringify(events)),
  };
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect('/login?redirect=/admin');
  }

  const { user, events } = await getAdminData(session.userId);

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <AdminSidebar
        userRole={session.role}
        activeEventId={events[0]?._id}
        activeEventName={events[0]?.name}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          user={user}
          eventSwitcher={
            <EventSwitcher events={events} currentEventId={events[0]?._id} />
          }
        />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
