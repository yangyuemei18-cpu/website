export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const targetUrl = 'http://nodejs-qcc-backend-data.prod.office.greatld.com/api/ECILocal/SearchMultiSelection?ignoreCache=true';

  const headers = { ...req.headers };
  // 修正 Host 头为 PROD 域名
  headers.host = 'nodejs-qcc-backend-data.prod.office.greatld.com';
  delete headers['x-vercel-deployment-url'];
  delete headers['x-forwarded-for'];
  headers['content-type'] = 'application/json';
  headers['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(req.body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`后端返回非 JSON: ${text.substring(0, 200)}`);
    }

    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({
      error: '代理请求失败',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}