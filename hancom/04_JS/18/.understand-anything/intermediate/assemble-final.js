const fs = require('fs');
const path = require('path');

const graph = JSON.parse(fs.readFileSync('.understand-anything/intermediate/assembled-graph.json', 'utf8'));
const layers = JSON.parse(fs.readFileSync('.understand-anything/intermediate/layers.json', 'utf8'));
const tour = JSON.parse(fs.readFileSync('.understand-anything/intermediate/tour.json', 'utf8'));

const now = new Date().toISOString();
const commit = require('child_process').execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();

const final = {
  version: "1.0.0",
  project: {
    name: "BLACK_KNIGHT (흑기사)",
    languages: ["HTML", "CSS", "JavaScript", "Markdown"],
    frameworks: [],
    description: "포트나이트 유튜버 '흑기사' 채널을 소개하는 픽셀아트 웹사이트로, 5개의 인터랙티브 섹션, 애니메이션, 다크모드 토글, 그리고 localStorage 기반 방명록을 포함합니다.",
    analyzedAt: now,
    gitCommitHash: commit
  },
  nodes: graph.nodes,
  edges: graph.edges,
  layers: layers,
  tour: tour
};

fs.writeFileSync('.understand-anything/intermediate/final-graph.json', JSON.stringify(final, null, 2));
console.log('✅ 최종 그래프 조립 완료');
