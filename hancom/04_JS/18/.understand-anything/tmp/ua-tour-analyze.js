#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

if (process.argv.length < 4) {
  console.error('Usage: node ua-tour-analyze.js <input.json> <output.json>');
  process.exit(1);
}

const inputPath = process.argv[2];
const outputPath = process.argv[3];

let data;
try {
  data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
} catch (err) {
  console.error('Failed to read input file:', err.message);
  process.exit(1);
}

const nodes = data.nodes || [];
const edges = data.edges || [];
const layers = data.layers || [];

// Build adjacency lists
const incomingEdges = {};
const outgoingEdges = {};
const allNodeIds = new Set();

nodes.forEach(n => {
  allNodeIds.add(n.id);
  incomingEdges[n.id] = [];
  outgoingEdges[n.id] = [];
});

edges.forEach(e => {
  if (outgoingEdges[e.source]) outgoingEdges[e.source].push(e);
  if (incomingEdges[e.target]) incomingEdges[e.target].push(e);
});

// A. Fan-In Ranking
const fanInRanking = nodes.map(n => ({
  id: n.id,
  name: n.name,
  fanIn: incomingEdges[n.id].length
})).sort((a, b) => b.fanIn - a.fanIn).slice(0, 20);

// B. Fan-Out Ranking
const fanOutRanking = nodes.map(n => ({
  id: n.id,
  name: n.name,
  fanOut: outgoingEdges[n.id].length
})).sort((a, b) => b.fanOut - a.fanOut).slice(0, 20);

// C. Entry Point Candidates
const entryPointScores = {};
nodes.forEach(n => {
  let score = 0;
  
  if (n.type === 'document') {
    if (n.name === 'README.md' || n.filePath === 'README.md') score += 5;
    else if (n.filePath.endsWith('.md') && !n.filePath.includes('/')) score += 2;
  } else if (n.type === 'file') {
    const entryNames = ['index.ts', 'index.js', 'main.ts', 'main.js', 'app.ts', 'app.js', 'server.ts', 'server.js', 'mod.rs', 'main.go', 'main.py', 'main.rs', 'manage.py', 'app.py', 'wsgi.py', 'asgi.py', 'run.py', '__main__.py', 'Application.java', 'Main.java', 'Program.cs', 'config.ru', 'index.php', 'App.swift', 'Application.kt', 'main.cpp', 'main.c'];
    if (entryNames.includes(n.name)) score += 3;
    
    const parts = n.filePath.split('/');
    if (parts.length <= 2) score += 1;
    
    const fanOut = outgoingEdges[n.id].length;
    const maxFanOut = Math.max(...nodes.map(x => outgoingEdges[x.id].length));
    if (fanOut >= maxFanOut * 0.9) score += 1;
    
    const fanIn = incomingEdges[n.id].length;
    const minFanIn = Math.min(...nodes.filter(x => x.type === 'file').map(x => incomingEdges[x.id].length));
    const maxFanIn = Math.max(...nodes.filter(x => x.type === 'file').map(x => incomingEdges[x.id].length));
    if (fanIn <= minFanIn + (maxFanIn - minFanIn) * 0.25) score += 1;
  }
  
  if (score > 0) entryPointScores[n.id] = score;
});

const entryPointCandidates = Object.entries(entryPointScores)
  .map(([id, score]) => {
    const node = nodes.find(n => n.id === id);
    return { id, score, name: node.name, summary: node.summary };
  })
  .sort((a, b) => b.score - a.score)
  .slice(0, 5);

// D. BFS Traversal from top code entry point
let startNode = null;
for (const candidate of entryPointCandidates) {
  const node = nodes.find(n => n.id === candidate.id);
  if (node && node.type === 'file') {
    startNode = node;
    break;
  }
}

const bfsTraversal = { startNode: startNode ? startNode.id : null, order: [], depthMap: {}, byDepth: {} };
if (startNode) {
  const visited = new Set();
  const queue = [[startNode.id, 0]];
  visited.add(startNode.id);
  
  while (queue.length > 0) {
    const [nodeId, depth] = queue.shift();
    bfsTraversal.order.push(nodeId);
    bfsTraversal.depthMap[nodeId] = depth;
    
    if (!bfsTraversal.byDepth[depth]) bfsTraversal.byDepth[depth] = [];
    bfsTraversal.byDepth[depth].push(nodeId);
    
    const outEdges = outgoingEdges[nodeId] || [];
    outEdges.forEach(e => {
      if (!visited.has(e.target) && ['imports', 'calls'].includes(e.type)) {
        visited.add(e.target);
        queue.push([e.target, depth + 1]);
      }
    });
  }
}

// E. Non-Code File Inventory
const nonCodeFiles = {
  documentation: [],
  infrastructure: [],
  data: [],
  config: []
};

nodes.forEach(n => {
  if (n.type === 'document') {
    nonCodeFiles.documentation.push({ id: n.id, name: n.name, summary: n.summary });
  } else if (['service', 'pipeline', 'resource'].includes(n.type)) {
    nonCodeFiles.infrastructure.push({ id: n.id, name: n.name, type: n.type, summary: n.summary });
  } else if (['table', 'schema', 'endpoint'].includes(n.type)) {
    nonCodeFiles.data.push({ id: n.id, name: n.name, type: n.type, summary: n.summary });
  } else if (n.type === 'config') {
    nonCodeFiles.config.push({ id: n.id, name: n.name, summary: n.summary });
  }
});

// F. Tightly Coupled Clusters
const clusters = [];
const clusterMap = new Map();

// Find bidirectional relationships
nodes.forEach(n1 => {
  nodes.forEach(n2 => {
    if (n1.id >= n2.id) return;
    const n1ToN2 = outgoingEdges[n1.id].some(e => e.target === n2.id);
    const n2ToN1 = outgoingEdges[n2.id].some(e => e.target === n1.id);
    
    if (n1ToN2 && n2ToN1) {
      const key = [n1.id, n2.id].sort().join('|');
      if (!clusterMap.has(key)) {
        clusterMap.set(key, { nodes: [n1.id, n2.id], edgeCount: 2 });
      }
    }
  });
});

clusterMap.forEach(cluster => {
  clusters.push(cluster);
});

clusters.sort((a, b) => b.edgeCount - a.edgeCount).splice(10);

// G. Layer List
const layerList = {
  count: layers.length,
  list: layers.map(l => ({ id: l.id, name: l.name, description: l.description }))
};

// H. Node Summary Index
const nodeSummaryIndex = {};
nodes.forEach(n => {
  nodeSummaryIndex[n.id] = { name: n.name, type: n.type, summary: n.summary };
});

const result = {
  scriptCompleted: true,
  entryPointCandidates,
  fanInRanking,
  fanOutRanking,
  bfsTraversal,
  nonCodeFiles,
  clusters,
  layers: layerList,
  nodeSummaryIndex,
  totalNodes: nodes.length,
  totalEdges: edges.length
};

try {
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  process.exit(0);
} catch (err) {
  console.error('Failed to write output:', err.message);
  process.exit(1);
}
