const express = require('express');
const https   = require('https');
const path    = require('path');

const app = express();

// 여기에 네이버 클라우드 키를 입력하세요
const NAVER_CLIENT_ID     = '6cm1gapanx';
const NAVER_CLIENT_SECRET = 'OLAyKEvVWAql2QCy5HEY2HP3sC9MvlfP4Z6DtmBn';

// HTML 파일 서빙
app.use(express.static(path.join(__dirname)));

// 루트 접속시 HTML 파일 열기
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'naver-walk-nav.html'));
});

// 네이버 Directions5 프록시
app.get('/api/directions', (req, res) => {
  const { start, goal } = req.query;

  if (!start || !goal) {
    return res.status(400).json({ error: 'start, goal 파라미터가 필요합니다.' });
  }

  const options = {
    hostname: 'maps.apigw.ntruss.com',
    path: `/map-direction/v1/driving?start=${encodeURIComponent(start)}&goal=${encodeURIComponent(goal)}&option=pedestrian`,
    method: 'GET',
    headers: {
      'X-NCP-APIGW-API-KEY-ID': NAVER_CLIENT_ID,
      'X-NCP-APIGW-API-KEY':    NAVER_CLIENT_SECRET,
    }
  };

  const proxyReq = https.request(options, (proxyRes) => {
    let data = '';
    proxyRes.on('data', chunk => data += chunk);
    proxyRes.on('end', () => {
      res.setHeader('Content-Type', 'application/json');
      res.status(proxyRes.statusCode).send(data);
    });
  });

  proxyReq.on('error', (e) => {
    console.error('Directions API 오류:', e);
    res.status(500).json({ error: '경로 탐색 서버 오류' });
  });

  proxyReq.end();
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log('\n✅ NavWalk 서버 실행 중');
  console.log('👉 http://localhost:' + PORT + ' 에서 앱을 열어주세요\n');
});
