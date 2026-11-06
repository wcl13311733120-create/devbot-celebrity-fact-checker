const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'checks.json');

app.use(express.json());
app.use(express.static(__dirname));

function load() { try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch (e) { return []; } }
function save(d) { fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2)); }

const KNOWLEDGE = [
  { id: 'ai-image-detect', title: 'AI 生成图片识别方法', tags: ['AI', '图片', '检测'],
    content: '常见识别特征：1) 手指/牙齿异常；2) 背景文字乱码；3) 光影不一致；4) 皮肤过度平滑；5) 首饰/配饰扭曲。建议使用多工具交叉验证（Hive、Illuminarty、AI or Not）。' },
  { id: 'celebrity-health', title: '名人健康信息核查要点', tags: ['名人', '健康', '核查'],
    content: '核查步骤：1) 检查官方账号/声明；2) 交叉验证多家媒体报道；3) 查看图片EXIF元数据；4) 反向图片搜索；5) 关注医生/专家解读。避免传播未经证实的健康谣言。' },
  { id: 'rumor-patterns', title: '谣言传播模式识别', tags: ['谣言', '传播', '模式'],
    content: '常见模式：1) 利用名人形象制造点击；2) 配图与文字不符；3) 来源模糊（"网友爆料"）；4) 情绪化用词；5) 缺乏具体时间地点。高曝光+低互动比可能为刷量。' },
  { id: 'media-forensics', title: '媒体取证工具链', tags: ['取证', '工具', '媒体'],
    content: '推荐工具：Google Reverse Image Search、TinEye、InVID（视频帧分析）、FotoForensics（ELA分析）、Metadata2Go（EXIF读取）。多工具交叉验证提高准确性。' },
  { id: 'source-credibility', title: '信息源可信度评估', tags: ['信息源', '可信度', '评估'],
    content: '评估维度：1) 官方认证账号；2) 媒体机构资质；3) 引用来源明确；4) 数据可追溯；5) 专家背书。X 平台蓝V ≠ 可信，需综合判断。' },
  { id: 'health-misinfo', title: '健康 misinformation 识别', tags: ['健康', 'misinfo', '识别'],
    content: '常见健康谣言：1) 夸大/编造 celebrity 体重变化；2) 虚假医疗建议；3) 药物/补品虚假功效；4) 心理健康污名化。建议优先参考 WHO/CDC/权威医疗机构。' }
];

const CHECK_STEPS = [
  { id: 'source', name: '信息源核查', desc: '检查发布者身份、认证状态、历史可信度', weight: 25 },
  { id: 'image', name: '图片/视频取证', desc: '反向搜索、EXIF、AI生成检测、ELA分析', weight: 30 },
  { id: 'cross', name: '交叉验证', desc: '多家媒体报道对比、官方声明核查', weight: 25 },
  { id: 'expert', name: '专家解读', desc: '医疗/法律/技术专家意见', weight: 10 },
  { id: 'context', name: '上下文分析', desc: '时间线、事件背景、动机分析', weight: 10 }
];

function assessCredibility(input) {
  const { hasOfficialSource, hasMultipleSources, imageVerified, expertConfirmed, hasContext } = input;
  let score = 0;
  if (hasOfficialSource) score += 25;
  if (hasMultipleSources) score += 25;
  if (imageVerified) score += 30;
  if (expertConfirmed) score += 10;
  if (hasContext) score += 10;
  const level = score >= 70 ? '高可信' : score >= 40 ? '待验证' : '低可信';
  const verdict = score >= 70 ? '✅ 信息基本可信' : score >= 40 ? '⚠️ 需进一步验证' : '❌ 可疑信息，建议不传播';
  return { score, level, verdict, steps: CHECK_STEPS };
}

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.get('/api/knowledge', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const tag = req.query.tag;
  let list = KNOWLEDGE;
  if (tag) list = list.filter(k => k.tags.includes(tag));
  if (q) list = list.filter(k => k.title.toLowerCase().includes(q) || k.content.toLowerCase().includes(q) || k.tags.some(t => t.toLowerCase().includes(q)));
  res.json(list);
});
app.get('/api/knowledge/tags', (req, res) => res.json([...new Set(KNOWLEDGE.flatMap(k => k.tags))]));

app.get('/api/steps', (req, res) => res.json(CHECK_STEPS));

app.post('/api/assess', (req, res) => res.json(assessCredibility(req.body || {})));

app.post('/api/checks', (req, res) => {
  const { title = '', url = '', content = '', notes = '' } = req.body || {};
  const c = { id: crypto.randomUUID(), ts: new Date().toISOString(), title, url, content, notes, result: assessCredibility(req.body || {}) };
  const all = load(); all.unshift(c); save(all.slice(0, 100));
  res.json(c);
});
app.get('/api/checks', (req, res) => res.json(load().map(c => ({ id: c.id, ts: c.ts, title: c.title, score: c.result.score, level: c.result.level }))));
app.get('/api/checks/:id', (req, res) => { const c = load().find(x => x.id === req.params.id); if (!c) return res.status(404).json({ error: 'not found' }); res.json(c); });

app.listen(PORT, () => console.log(`Celebrity Fact Checker running on http://localhost:${PORT}`));
