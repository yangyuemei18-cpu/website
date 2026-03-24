export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const targetUrl = 'http://nodejs-qcc-backend-data.sit.office.greatld.com/api/ECILocal/SearchMultiSelection?ignoreCache=true';

  // 准备转发的请求头
  const headers = { ...req.headers };
  headers.host = 'nodejs-qcc-backend-data.sit.office.greatld.com';
  delete headers['x-vercel-deployment-url'];
  delete headers['x-forwarded-for'];
  headers['content-type'] = 'application/json';
  headers['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  try {
    // 添加超时控制（10 秒）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(req.body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    // 尝试解析响应体
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // 非 JSON 响应，返回文本以便调试
      const text = await response.text();
      throw new Error(`后端返回非 JSON: ${text.substring(0, 200)}`);
    }

    // 透传状态码
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    // 返回详细的错误信息（生产环境可酌情隐藏细节）
    res.status(500).json({
      error: '代理请求失败',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}