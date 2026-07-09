const fs = require('fs');

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
    description: "Pixel art YouTube introduction website for the BLACK_KNIGHT gaming channel featuring 5 interactive sections with animations, dark mode toggle, and localStorage-based guestbook.",
    analyzedAt: now,
    gitCommitHash: commit
  },
  nodes: graph.nodes,
  edges: graph.edges,
  layers: layers,
  tour: tour
};

fs.writeFileSync('.understand-anything/intermediate/final-graph.json', JSON.stringify(final, null, 2));
console.log('Final graph assembled');
