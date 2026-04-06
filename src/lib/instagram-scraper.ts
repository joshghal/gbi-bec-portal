import puppeteer, { Browser } from 'puppeteer';

export interface InstagramPost {
  shortcode: string;
  caption: string;
  timestamp: number; // unix seconds
  imageUrl: string;
  isVideo: boolean;
}

const IG_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36';

async function getBrowser(): Promise<Browser> {
  const token = process.env.BROWSERLESS_TOKEN;
  if (token) {
    return puppeteer.connect({
      browserWSEndpoint: `wss://chrome.browserless.io?token=${token}`,
    });
  }
  return puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
}

export async function scrapeInstagramPosts(username: string): Promise<InstagramPost[]> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setUserAgent(IG_USER_AGENT);
    await page.setViewport({ width: 1280, height: 800 });

    // Race: intercept web_profile_info response vs 20s timeout
    const dataPromise = page.waitForResponse(
      (res) => res.url().includes('web_profile_info') && res.url().includes(username),
      { timeout: 20000 }
    );

    await page.goto(`https://www.instagram.com/${username}/`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    const response = await dataPromise;
    const json = await response.json();

    const user =
      json?.data?.user ||
      json?.graphql?.user;

    if (!user) throw new Error('No user data found in Instagram response');

    const edges: any[] =
      user?.edge_owner_to_timeline_media?.edges ||
      user?.edge_user_to_photos_of_you?.edges ||
      [];

    return edges.map((edge) => {
      const node = edge.node;
      return {
        shortcode: node.shortcode as string,
        caption: (node.edge_media_to_caption?.edges?.[0]?.node?.text as string) || '',
        timestamp: node.taken_at_timestamp as number,
        imageUrl: (node.thumbnail_src || node.display_url) as string,
        isVideo: node.is_video as boolean,
      };
    });
  } finally {
    await page.close();
    // disconnect for Browserless (remote), close for local
    if (process.env.BROWSERLESS_TOKEN) {
      browser.disconnect();
    } else {
      await browser.close();
    }
  }
}
