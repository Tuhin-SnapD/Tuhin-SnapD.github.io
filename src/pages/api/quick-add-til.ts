import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('Quick-add TIL API called');
    
    let jsonData;
    try {
      const bodyText = await request.text();
      console.log('Request body as text:', bodyText);
      console.log('Body length:', bodyText.length);
      
      if (!bodyText || bodyText.trim() === '') {
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'Request body is empty' 
        }), { status: 400 });
      }
      
      jsonData = JSON.parse(bodyText);
      console.log('Parsed JSON data:', jsonData);
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      return new Response(JSON.stringify({ 
        success: false, 
        message: `Failed to parse request body as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}` 
      }), { status: 400 });
    }
    
    const title = jsonData['quick-title'] as string;
    const category = jsonData['quick-category'] as string;
    const content = jsonData['quick-content'] as string;
    
    console.log('Final data:', { title, category, contentLength: content?.length });

    if (!title || !category || !content) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Missing required fields: quick-title, quick-category, and quick-content are required' 
      }), { status: 400 });
    }

    // Create a slug from the title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Get current date
    const today = new Date().toISOString().split('T')[0];

    // Create the frontmatter
    const frontmatter = `---
title: "${title}"
tags: []
date: "${today}"
category: "${category}"
published: true
---

`;

    // Create the full markdown content
    const markdownContent = frontmatter + content;

    // Create the file path
    const tilDir = join(process.cwd(), 'src', 'content', 'til');
    const fileName = `${slug}.md`;
    const filePath = join(tilDir, fileName);

    // Ensure directory exists
    try {
      await mkdir(tilDir, { recursive: true });
    } catch (error) {
      console.error('Error creating directory:', error);
    }

    // Write the file
    await writeFile(filePath, markdownContent, 'utf-8');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Quick TIL note created successfully!',
      slug: slug
    }), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error creating quick TIL note:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: `Error creating TIL note: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }), { status: 500 });
  }
}; 