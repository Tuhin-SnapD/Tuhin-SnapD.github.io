import { getCollection } from 'astro:content';

export async function GET() {
  const notes = await getCollection('notes');
  const tilPosts = await getCollection('til');

  const publishedNotes = notes.filter(note => note.data.published);
  const publishedTilPosts = tilPosts.filter(post => post.data.published);

  const baseUrl = 'https://tuhin-snapd.github.io';

  const pages = [
    '',
    '/notes',
    '/til',
  ];

  const noteUrls = publishedNotes.map(note => `/notes/${note.slug}`);
  const tilUrls = publishedTilPosts.map(post => `/til/${post.slug}`);

  const allUrls = [...pages, ...noteUrls, ...tilUrls];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${baseUrl}${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${url === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
} 