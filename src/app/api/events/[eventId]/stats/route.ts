import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Ticket } from '@/models/Ticket';
import { CheckInLog } from '@/models/CheckInLog';
import { Participant } from '@/models/Participant';
import { Booth } from '@/models/Booth';
import { News } from '@/models/News';
import type { ApiResponse } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
): Promise<NextResponse<ApiResponse<Record<string, unknown>>>> {
  try {
    await connectDB();
    const { eventId } = await params;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 1. Total Tickets Sold & Quota
    const totalTicketsSold = await Ticket.countDocuments({ event: eventId, status: { $ne: 'cancelled' } });
    
    // 2. Total Check-Ins
    const totalCheckIns = await CheckInLog.countDocuments({ event: eventId, status: 'success' });
    const checkInsToday = await CheckInLog.countDocuments({
      event: eventId,
      status: 'success',
      checkedInAt: { $gte: startOfToday },
    });

    // 3. Participants & Booths
    // Soft delete check
    const totalParticipants = await Participant.countDocuments({ event: eventId, deletedAt: null });
    const totalBooths = await Booth.countDocuments({ event: eventId, deletedAt: null });
    const assignedBooths = await Booth.countDocuments({ event: eventId, status: 'assigned', deletedAt: null });

    // 4. News Articles
    const publishedNews = await News.countDocuments({ event: eventId, status: 'published', deletedAt: null });

    // 5. Check-In Rate Percentage
    const checkInRate = totalTicketsSold > 0 ? Math.round((totalCheckIns / totalTicketsSold) * 100) : 0;

    // 6. Recent Activity Feed
    const recentLogs = await CheckInLog.find({ event: eventId, status: 'success' })
      .populate('visitor', 'name email')
      .populate('checkedInBy', 'name')
      .sort({ checkedInAt: -1 })
      .limit(6)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        ticketsSold: totalTicketsSold,
        totalCheckIns,
        checkInsToday,
        checkInRate,
        participants: totalParticipants,
        booths: { total: totalBooths, assigned: assignedBooths },
        newsPublished: publishedNews,
        recentActivity: recentLogs,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
