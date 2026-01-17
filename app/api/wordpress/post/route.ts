import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { title, content, userId } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Check if WordPress credentials are configured
    if (!process.env.WP_URL || !process.env.WP_USER || !process.env.WP_APP_PASSWORD) {
      return NextResponse.json(
        { error: 'WordPress integration not configured' },
        { status: 400 }
      );
    }

    // Create WordPress post
    const wpResponse = await fetch(`${process.env.WP_URL}/wp-json/wp/v2/posts`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(
          `${process.env.WP_USER}:${process.env.WP_APP_PASSWORD}`
        ).toString('base64'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title,
        content: content,
        status: 'publish', // or 'draft' for review
        author: 1, // WordPress user ID
        categories: [1], // Default category
        tags: [], // Add tags if needed
        meta: {
          generated_by: 'BlogAI',
          user_id: userId,
          generated_at: new Date().toISOString(),
        }
      }),
    });

    if (!wpResponse.ok) {
      const errorData = await wpResponse.text();
      console.error('WordPress API Error:', errorData);
      return NextResponse.json(
        { error: 'Failed to publish to WordPress' },
        { status: 500 }
      );
    }

    const wpPost = await wpResponse.json();

    return NextResponse.json({
      success: true,
      postId: wpPost.id,
      postUrl: wpPost.link,
      message: 'Blog post successfully published to WordPress!',
    });

  } catch (error: any) {
    console.error('Error posting to WordPress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}