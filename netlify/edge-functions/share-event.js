const FALLBACK_IMAGE =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Example.svg/1200px-Example.svg.png';

const escapeHtml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const buildWikiApiUrl = ({ lang, pageId }) =>
  `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&pageids=${encodeURIComponent(
    pageId,
  )}&prop=info|pageimages|extracts|pageterms&inprop=url&piprop=thumbnail|original&pithumbsize=1200&exintro=1&explaintext=1&redirects=1&origin=*`;

const getWikiMeta = async ({ lang, pageId }) => {
  try {
    const apiRes = await fetch(buildWikiApiUrl({ lang, pageId }), {
      headers: { accept: 'application/json' },
    });

    if (!apiRes.ok) throw new Error(`Wikipedia API ${apiRes.status}`);
    const payload = await apiRes.json();
    const pages = payload?.query?.pages || {};
    const page = pages[pageId] || Object.values(pages)[0] || {};

    const title = page?.title || 'On This Day Event';
    const extract = page?.extract || '';
    const description =
      page?.terms?.description?.[0] ||
      extract ||
      'Historical event from On This Day.';
    const image =
      page?.original?.source || page?.thumbnail?.source || FALLBACK_IMAGE;
    const articleUrl =
      page?.fullurl ||
      (page?.title
        ? `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(page.title)}`
        : '');

    return { title, description, image, articleUrl };
  } catch {
    return {
      title: 'On This Day Event',
      description: 'Historical event from On This Day.',
      image: FALLBACK_IMAGE,
      articleUrl: '',
    };
  }
};

const shareEvent = async (request) => {
  const { pathname, searchParams, origin } = new URL(request.url);
  const parts = pathname.split('/').filter(Boolean);
  const type = parts[2] || 'events';
  const pageId = parts[3] || '';
  const langParam = (searchParams.get('lang') || 'en').toLowerCase();
  const lang = /^[a-z-]{2,5}$/.test(langParam) ? langParam : 'en';

  if (!pageId) {
    return Response.redirect(`${origin}/`, 302);
  }

  const appDetailUrl = `${origin}/event/${encodeURIComponent(
    type,
  )}/${encodeURIComponent(pageId)}`;
  const meta = await getWikiMeta({ lang, pageId });
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description.slice(0, 300));
  const image = escapeHtml(meta.image);
  const canonicalUrl = escapeHtml(request.url);
  const articleUrl = escapeHtml(meta.articleUrl || appDetailUrl);
  const redirectUrl = escapeHtml(appDetailUrl);

  const html = `<!doctype html>
<html lang="${escapeHtml(lang)}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="On This Day" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="article:publisher" content="${articleUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    <meta http-equiv="refresh" content="0;url=${redirectUrl}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <style>
      :root {
        color-scheme: light;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        font-family:
          -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
          Cantarell, "Helvetica Neue", Arial, sans-serif;
        background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
        color: #0f172a;
      }

      .shell {
        max-width: 1120px;
        margin: 0 auto;
        padding: 20px 16px 28px;
      }

      .header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 18px;
      }

      .chip,
      .line,
      .hero,
      .card {
        position: relative;
        overflow: hidden;
        background: #dbe3ee;
      }

      .chip::after,
      .line::after,
      .hero::after,
      .card::after {
        content: "";
        position: absolute;
        inset: 0;
        transform: translateX(-100%);
        background: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 0.56) 48%,
          rgba(255, 255, 255, 0) 100%
        );
        animation: shimmer 1.25s infinite;
      }

      @keyframes shimmer {
        100% {
          transform: translateX(100%);
        }
      }

      .btn {
        width: 110px;
        height: 36px;
        border-radius: 10px;
      }

      .type {
        width: 82px;
        height: 22px;
        border-radius: 999px;
      }

      .layout {
        display: grid;
        grid-template-columns: 1.7fr 1fr;
        gap: 18px;
      }

      .main,
      .aside {
        border-radius: 16px;
        background: #ffffffcc;
        border: 1px solid #dbe3ee;
        padding: 14px;
      }

      .line {
        height: 14px;
        border-radius: 8px;
        margin-bottom: 10px;
      }

      .line.title {
        height: 30px;
        width: 72%;
        margin-bottom: 14px;
      }

      .line.meta {
        width: 120px;
        margin-bottom: 14px;
      }

      .hero {
        width: 100%;
        height: 280px;
        border-radius: 14px;
        margin-bottom: 16px;
      }

      .actions {
        display: flex;
        gap: 10px;
        margin-top: 12px;
      }

      .action {
        height: 40px;
        border-radius: 12px;
        width: 160px;
      }

      .card {
        border-radius: 12px;
        height: 82px;
        margin-bottom: 10px;
      }

      .helper {
        margin-top: 10px;
        font-size: 13px;
        color: #475569;
      }

      .helper a {
        color: #1d4ed8;
        text-decoration: none;
      }

      .helper a:hover {
        text-decoration: underline;
      }

      @media (max-width: 900px) {
        .layout {
          grid-template-columns: 1fr;
        }

        .hero {
          height: 220px;
        }
      }
    </style>
  </head>
  <body>
    <div class="shell" aria-hidden="true">
      <div class="header">
        <div class="chip btn"></div>
        <div class="chip type"></div>
      </div>
      <div class="layout">
        <main class="main">
          <div class="line title"></div>
          <div class="line meta"></div>
          <div class="hero"></div>
          <div class="line" style="width: 92%"></div>
          <div class="line" style="width: 88%"></div>
          <div class="line" style="width: 94%"></div>
          <div class="actions">
            <div class="chip action"></div>
            <div class="chip action"></div>
          </div>
        </main>
        <aside class="aside">
          <div class="line" style="width: 48%; height: 18px"></div>
          <div class="card"></div>
          <div class="card"></div>
          <div class="card"></div>
        </aside>
      </div>
    </div>
    <p class="helper">
      Redirecting to event details...
      <a href="${redirectUrl}">Continue</a>
    </p>
  </body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=300',
    },
  });
};

export default shareEvent;
