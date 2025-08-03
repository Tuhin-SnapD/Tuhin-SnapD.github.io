import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('Add TIL API called');
    
    // Check content type
    const contentType = request.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
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
    
    const title = jsonData.title as string;
    const description = jsonData.description as string;
    const date = jsonData.date as string;
    const category = jsonData.category as string;
    const tags = (jsonData.tags as string)?.split(',').map(tag => tag.trim()).filter(tag => tag) || [];
    const content = jsonData.content as string;
    
    console.log('Form data parsed:', { title, description, date, category, tags, contentLength: content?.length });

    if (!title || !date || !category || !content) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Missing required fields: title, date, category, and content are required' 
      }), { status: 400 });
    }

    // Create a slug from the title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Create the frontmatter
    const frontmatter = `---
title: "${title}"
${description ? `description: "${description}"` : ''}
tags: ${JSON.stringify(tags)}
date: "${date}"
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
      message: 'TIL note created successfully!',
      slug: slug
    }), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error creating TIL note:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: `Error creating TIL note: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }), { status: 500 });
  }
}; 