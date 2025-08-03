import { getCollection } from 'astro:content';

export async function GET() {
  const notes = await getCollection('notes');
  const tilPosts = await getCollection('til');

  const publishedNotes = notes.filter(note => note.data.published);
  const publishedTilPosts = tilPosts.filter(post => post.data.published);

  const baseUrl = 'https://tuhin-snapd.github.io';

  // Combine and sort all content by date
  const allContent = [
    ...publishedNotes.map(note => ({
      ...note,
      type: 'note',
      url: `/notes/${note.slug}`,
    })),
    ...publishedTilPosts.map(post => ({
      ...post,
      type: 'til',
      url: `/til/${post.slug}`,
    }))
  ].sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>DevNotes - Your Public Knowledge Garden</title>
    <description>Technical notes, cheat sheets, and learning paths</description>
    <link>${baseUrl}</link>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${allContent.map(item => `    <item>
      <title>${item.data.title}</title>
      <description>${item.data.description}</description>
      <link>${baseUrl}${item.url}</link>
      <guid>${baseUrl}${item.url}</guid>
      <pubDate>${new Date(item.data.date).toUTCString()}</pubDate>
      <category>${item.data.category}</category>
    </item>`).join('\n')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
} 