import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, tags, apiKey } = body;

    if (!title || !content || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, apiKey' },
        { status: 400 }
      );
    }

    // First, get the user's Medium ID
    const userResponse = await fetch('https://api.medium.com/v1/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!userResponse.ok) {
      const error = await userResponse.text();
      console.error('Failed to get Medium user:', error);
      return NextResponse.json(
        { error: 'Invalid Medium API key or failed to authenticate' },
        { status: 401 }
      );
    }

    const userData = await userResponse.json();
    const userId = userData.data.id;

    // Prepare the post data for Medium
    const postData = {
      title,
      contentFormat: 'html',
      content,
      tags: Array.isArray(tags) ? tags.slice(0, 5) : [], // Medium allows max 5 tags
      publishStatus: 'public',
      license: 'all-rights-reserved',
      notifyFollowers: false,
    };

    // Create the post on Medium
    const postResponse = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    if (!postResponse.ok) {
      const error = await postResponse.text();
      console.error('Failed to create Medium post:', error);
      return NextResponse.json(
        { error: 'Failed to publish post to Medium' },
        { status: 500 }
      );
    }

    const postResult = await postResponse.json();
    const post = postResult.data;

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        title: post.title,
        url: post.url,
        publishStatus: post.publishStatus,
        publishedAt: post.publishedAt,
        tags: post.tags,
      },
      message: 'Post published successfully to Medium',
    });

  } catch (error) {
    console.error('Medium publishing error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to publish to Medium',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 