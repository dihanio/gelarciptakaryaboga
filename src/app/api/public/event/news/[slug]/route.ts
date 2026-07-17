import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { News } from '@/models/News';
import type { INews, ApiResponse } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse<ApiResponse<INews>>> {
  try {
    await connectDB();
    const { slug } = await params;

    const news = await News.findOne({ slug, status: 'published', deletedAt: null })
      .populate('author', 'name avatar')
      .lean();

    if (!news) {
      return NextResponse.json(
        { success: false, message: 'Berita tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: news as unknown as INews });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
