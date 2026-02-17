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
  </head>
  <body>
    <p>Redirecting to event details...</p>
    <p><a href="${redirectUrl}">Continue</a></p>
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
