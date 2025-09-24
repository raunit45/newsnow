import { NextRequest, NextResponse } from 'next/server';

const MEDIASTACK_API_KEY = process.env.MEDIASTACK_API_KEY;

export async function GET(request: NextRequest) {
  console.log('🔥 Mediastack API called - fetching data');

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'general';
    const limit = parseInt(searchParams.get('pageSize') || '50', 10);

    if (!MEDIASTACK_API_KEY) {
      return NextResponse.json(
        { error: 'MEDIASTACK_API_KEY not set' },
        { status: 500 }
      );
    }

    const url = `http://api.mediastack.com/v1/news?access_key=${MEDIASTACK_API_KEY}&categories=${category}&countries=us&languages=en&limit=${limit}`;

    console.log('📡 Mediastack Request:', url);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'NewsNow/1.0',
        'Accept': 'application/json',
      },
    });

    console.log('📡 Mediastack Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Mediastack Error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to fetch from Mediastack' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Mediastack Success! Articles:', data.data?.length || 0);

    if (data.data && data.data.length > 0) {
      // Transform Mediastack format to match NewsAPI-like format
      const transformedData = {
        status: 'ok',
        totalResults: data.pagination?.total || data.data.length,
        articles: data.data.map((article: any) => ({
          source: { name: article.source || 'Mediastack' },
          author: article.author || null,
          title: article.title,
          description: article.description,
          url: article.url,
          urlToImage: article.image,
          publishedAt: article.published_at,
          content: article.description,
        })),
      };

      return NextResponse.json(transformedData);
    }

    return NextResponse.json(
      { status: 'ok', totalResults: 0, articles: [] },
      { status: 200 }
    );
  } catch (error) {
    console.error('💥 Critical Mediastack error:', error);
    return NextResponse.json(
      { error: 'Server error while fetching Mediastack news' },
      { status: 500 }
    );
  }
}
