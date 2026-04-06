import { config } from 'dotenv';
config({ path: '.env.local' });

import { scrapeInstagramPosts } from '../src/lib/instagram-scraper';
import { processInstagramPost } from '../src/lib/instagram-ai';

async function main() {
  console.log('Scraping instagram.com/sukawarna.bec/ ...\n');
  const posts = await scrapeInstagramPosts('sukawarna.bec');
  console.log(`Found ${posts.length} posts. Processing first 3 with AI...\n`);

  for (const post of posts.slice(0, 3)) {
    const postDate = new Date(post.timestamp * 1000).toISOString().slice(0, 10);
    console.log(`━━━ ${post.shortcode} (posted ${postDate}) ━━━`);
    console.log(`RAW caption: ${post.caption.slice(0, 100).replace(/\n/g, ' ')}...`);
    console.log('Processing with AI...');

    const draft = await processInstagramPost(post, postDate);

    console.log(`\n  title:    ${draft.title}`);
    console.log(`  category: ${draft.category}`);
    console.log(`  date:     ${draft.date}`);
    console.log(`  excerpt:  ${draft.excerpt}`);
    console.log(`  content:  ${draft.content.slice(0, 150)}...`);
    console.log(`  color:    ${draft.color}`);
    console.log();
  }
}

main().catch(console.error);
