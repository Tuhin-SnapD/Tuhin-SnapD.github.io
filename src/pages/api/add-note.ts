import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('Add Note API called');
    
    // Check content type
    const contentType = request.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    // Log all headers for debugging
    console.log('All headers:');
    for (const [key, value] of request.headers.entries()) {
      console.log(`${key}: ${value}`);
    }
    
    let formData;
    try {
      // Try to parse as FormData first
      console.log('Attempting to parse as FormData...');
      formData = await request.formData();
      console.log('Form data received successfully');
    } catch (formDataError) {
      console.error('FormData parsing error:', formDataError);
      
      // Fallback: try to parse as JSON if FormData fails
      try {
        console.log('Attempting to parse as JSON...');
        const bodyText = await request.text();
        console.log('Request body as text:', bodyText);
        
        // Try to parse as JSON
        const jsonData = JSON.parse(bodyText);
        console.log('Parsed JSON data:', jsonData);
        
        // Create a FormData-like object from JSON
        const mockFormData = {
          get: (key: string) => jsonData[key] || null
        };
        formData = mockFormData;
      } catch (jsonError) {
        console.error('JSON parsing also failed:', jsonError);
        return new Response(JSON.stringify({ 
          success: false, 
          message: `FormData parsing error: ${formDataError instanceof Error ? formDataError.message : 'Unknown error'}. Also failed to parse as JSON.` 
        }), { status: 400 });
      }
    }
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const date = formData.get('date') as string;
    const tags = (formData.get('tags') as string)?.split(',').map(tag => tag.trim()).filter(tag => tag) || [];
    const category = formData.get('category') as string;
    const difficulty = formData.get('difficulty') as string;
    const content = formData.get('content') as string;
    
    console.log('Form data parsed:', { title, description, date, category, difficulty, tags, contentLength: content?.length });

    if (!title || !date || !category || !difficulty || !content) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Missing required fields' 
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
description: "${description || ''}"
tags: ${JSON.stringify(tags)}
date: "${date}"
readTime: "5 min read"
category: "${category}"
difficulty: "${difficulty}"
published: true
featured: false
---

`;

    // Create the full markdown content
    const markdownContent = frontmatter + content;

    // Create the file path
    const notesDir = join(process.cwd(), 'src', 'content', 'notes');
    const fileName = `${slug}.md`;
    const filePath = join(notesDir, fileName);

    // Ensure directory exists
    try {
      await mkdir(notesDir, { recursive: true });
    } catch (error) {
      console.error('Error creating directory:', error);
    }

    // Write the file
    await writeFile(filePath, markdownContent, 'utf-8');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Note created successfully!',
      slug: slug
    }), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error creating note:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: `Error creating note: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }), { status: 500 });
  }
}; 