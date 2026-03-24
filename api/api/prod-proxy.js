export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const targetUrl = 'http://nodejs-qcc-backend-data.prod.office.greatld.com/api/ECILocal/SearchMultiSelection?ignoreCache=true'

  // 准备转发的请求头
  const headers = { ...req.headers };
  // 关键：将 Host 改为后端期望的域名
  headers.host = 'nodejs-qcc-backend-data.sit.office.greatld.com';
  // 删除可能干扰的 Vercel 特有头
  delete headers['x-vercel-deployment-url'];
  delete headers['x-forwarded-for'];
  // 确保 Content-Type 正确
  headers['content-type'] = 'application/json';

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}