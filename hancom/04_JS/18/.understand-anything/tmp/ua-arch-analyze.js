#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Argument handling
const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
  console.error('Usage: node ua-arch-analyze.js <input.json> <output.json>');
  process.exit(1);
}

try {
  // Read input
  const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const fileNodes = input.fileNodes || [];
  const importEdges = input.importEdges || [];
  const allEdges = input.allEdges || [];

  // A. Directory Grouping
  const directoryGroups = {};

  // Find common prefix
  const filePaths = fileNodes
    .filter(n => n.filePath)
    .map(n => n.filePath);

  let commonPrefix = '';
  if (filePaths.length > 0) {
    const parts = filePaths[0].split('/');
    for (let i = 0; i < parts.length; i++) {
      const candidate = parts.slice(0, i + 1).join('/');
      if (filePaths.every(fp => fp.startsWith(candidate + '/'))) {
        commonPrefix = candidate + '/';
      } else {
        break;
      }
    }
  }

  // Group files by directory
  fileNodes.forEach(node => {
    const filePath = node.filePath || '';
    let dirName = 'root';

    if (filePath) {
      let relativePath = filePath;
      if (commonPrefix && filePath.startsWith(commonPrefix)) {
        relativePath = filePath.substring(commonPrefix.length);
      }

      const parts = relativePath.split('/');
      if (parts.length > 1) {
        dirName = parts[0];
      } else {
        dirName = 'root';
      }
    }

    if (!directoryGroups[dirName]) {
      directoryGroups[dirName] = [];
    }
    directoryGroups[dirName].push(node.id);
  });

  // B. Node Type Grouping
  const nodeTypeGroups = {};
  fileNodes.forEach(node => {
    const type = node.type || 'file';
    if (!nodeTypeGroups[type]) {
      nodeTypeGroups[type] = [];
    }
    nodeTypeGroups[type].push(node.id);
  });

  // C. Import Adjacency Matrix & Fan-in/Fan-out
  const fileFanOut = {};
  const fileFanIn = {};
  const importMatrix = {};

  fileNodes.forEach(node => {
    fileFanOut[node.id] = 0;
    fileFanIn[node.id] = 0;
  });

  importEdges.forEach(edge => {
    const source = edge.source;
    const target = edge.target;

    fileFanOut[source] = (fileFanOut[source] || 0) + 1;
    fileFanIn[target] = (fileFanIn[target] || 0) + 1;

    if (!importMatrix[source]) {
      importMatrix[source] = {};
    }
    importMatrix[source][target] = (importMatrix[source][target] || 0) + 1;
  });

  // D. Cross-Category Dependency Analysis
  const crossCategoryEdges = {};
  allEdges.forEach(edge => {
    const sourceNode = fileNodes.find(n => n.id === edge.source);
    const targetNode = fileNodes.find(n => n.id === edge.target);

    if (sourceNode && targetNode) {
      const fromType = sourceNode.type;
      const toType = targetNode.type;
      const edgeType = edge.type;
      const key = `${fromType}-${toType}-${edgeType}`;

      crossCategoryEdges[key] = (crossCategoryEdges[key] || 0) + 1;
    }
  });

  const crossCategoryList = Object.entries(crossCategoryEdges).map(([key, count]) => {
    const [fromType, toType, edgeType] = key.split('-');
    return { fromType, toType, edgeType, count };
  });

  // E. Inter-Group Import Frequency
  const interGroupImports = {};

  importEdges.forEach(edge => {
    const sourceNode = fileNodes.find(n => n.id === edge.source);
    const targetNode = fileNodes.find(n => n.id === edge.target);

    if (sourceNode && targetNode) {
      let sourceDir = 'root';
      let targetDir = 'root';

      const sourcePath = sourceNode.filePath || '';
      const targetPath = targetNode.filePath || '';

      if (sourcePath) {
        const parts = sourcePath.split('/');
        sourceDir = parts.length > 1 ? parts[0] : 'root';
      }

      if (targetPath) {
        const parts = targetPath.split('/');
        targetDir = parts.length > 1 ? parts[0] : 'root';
      }

      if (sourceDir !== targetDir) {
        const key = `${sourceDir}->${targetDir}`;
        interGroupImports[key] = (interGroupImports[key] || 0) + 1;
      }
    }
  });

  const interGroupList = Object.entries(interGroupImports).map(([key, count]) => {
    const [from, to] = key.split('->');
    return { from, to, count };
  });

  // F. Intra-Group Import Density
  const intraGroupDensity = {};

  Object.keys(directoryGroups).forEach(dirName => {
    const dirFiles = directoryGroups[dirName];
    let internalEdges = 0;
    let totalEdges = 0;

    dirFiles.forEach(fileId => {
      const fanOut = fileFanOut[fileId] || 0;
      const fanIn = fileFanIn[fileId] || 0;
      totalEdges += fanOut + fanIn;

      // Count internal edges
      if (importMatrix[fileId]) {
        dirFiles.forEach(targetId => {
          if (importMatrix[fileId][targetId]) {
            internalEdges += importMatrix[fileId][targetId];
          }
        });
      }
    });

    const density = totalEdges > 0 ? internalEdges / totalEdges : 0;
    intraGroupDensity[dirName] = {
      internalEdges,
      totalEdges,
      density
    };
  });

  // G. Directory Pattern Matching
  const patternMap = {
    'routes': 'api',
    'api': 'api',
    'controllers': 'api',
    'endpoints': 'api',
    'handlers': 'api',
    'services': 'service',
    'core': 'service',
    'lib': 'utility',
    'domain': 'service',
    'logic': 'service',
    'models': 'data',
    'db': 'data',
    'data': 'data',
    'persistence': 'data',
    'repository': 'data',
    'entities': 'data',
    'components': 'ui',
    'views': 'ui',
    'pages': 'ui',
    'ui': 'ui',
    'layouts': 'ui',
    'screens': 'ui',
    'middleware': 'middleware',
    'plugins': 'middleware',
    'interceptors': 'middleware',
    'guards': 'middleware',
    'utils': 'utility',
    'helpers': 'utility',
    'common': 'utility',
    'shared': 'utility',
    'tools': 'utility',
    'config': 'config',
    'constants': 'config',
    'env': 'config',
    'settings': 'config',
    '__tests__': 'test',
    'test': 'test',
    'tests': 'test',
    'spec': 'test',
    'specs': 'test',
    'types': 'types',
    'interfaces': 'types',
    'schemas': 'types',
    'contracts': 'types',
    'dtos': 'types',
    'hooks': 'hooks',
    'store': 'state',
    'state': 'state',
    'reducers': 'state',
    'actions': 'state',
    'slices': 'state',
    'assets': 'assets',
    'static': 'assets',
    'public': 'assets',
    'migrations': 'data',
    'management': 'config',
    'commands': 'config',
    'scripts': 'utility'
  };

  const patternMatches = {};
  Object.keys(directoryGroups).forEach(dirName => {
    patternMatches[dirName] = patternMap[dirName] || 'unknown';
  });

  // H. Deployment Topology Detection
  const infraFiles = fileNodes
    .filter(n => {
      const fp = (n.filePath || '').toLowerCase();
      return fp.includes('docker') || fp.includes('compose') ||
             fp.includes('k8s') || fp.includes('terraform') ||
             fp.includes('.github') || fp.includes('makefile');
    })
    .map(n => n.filePath);

  const deploymentTopology = {
    hasDockerfile: fileNodes.some(n => (n.filePath || '').toLowerCase().includes('dockerfile')),
    hasCompose: fileNodes.some(n => (n.filePath || '').toLowerCase().includes('compose')),
    hasK8s: fileNodes.some(n => (n.filePath || '').toLowerCase().includes('k8s')),
    hasTerraform: fileNodes.some(n => (n.filePath || '').toLowerCase().includes('terraform')),
    hasCI: fileNodes.some(n => (n.filePath || '').toLowerCase().includes('github') || (n.filePath || '').toLowerCase().includes('gitlab')),
    infraFiles
  };

  // I. Data Pipeline Detection
  const dataPipeline = {
    schemaFiles: fileNodes
      .filter(n => {
        const fp = (n.filePath || '').toLowerCase();
        return fp.endsWith('.sql') || fp.endsWith('.graphql') || fp.endsWith('.proto');
      })
      .map(n => n.filePath),
    migrationFiles: fileNodes
      .filter(n => (n.filePath || '').toLowerCase().includes('migration'))
      .map(n => n.filePath),
    dataModelFiles: fileNodes
      .filter(n => (n.filePath || '').includes('/models/') || (n.filePath || '').includes('entity'))
      .map(n => n.filePath),
    apiHandlerFiles: fileNodes
      .filter(n => (n.filePath || '').includes('/routes/') || (n.filePath || '').includes('handler') || (n.filePath || '').includes('controller'))
      .map(n => n.filePath)
  };

  // J. Documentation Coverage
  const docFiles = fileNodes.filter(n => n.type === 'document');
  const docsPerGroup = {};
  docFiles.forEach(doc => {
    const fp = (doc.filePath || '').split('/')[0];
    const dirName = fp || 'root';
    docsPerGroup[dirName] = (docsPerGroup[dirName] || 0) + 1;
  });

  const groupsWithDocs = Object.keys(docsPerGroup).length;
  const totalGroups = Object.keys(directoryGroups).length;
  const coverageRatio = totalGroups > 0 ? groupsWithDocs / totalGroups : 0;
  const undocumentedGroups = Object.keys(directoryGroups)
    .filter(g => !docsPerGroup[g])
    .sort();

  const docCoverage = {
    groupsWithDocs,
    totalGroups,
    coverageRatio,
    undocumentedGroups
  };

  // K. Dependency Direction
  const dependencyDirection = [];
  const groupPairs = new Set();

  interGroupList.forEach(item => {
    const key = [item.from, item.to].sort().join('|');
    if (!groupPairs.has(key)) {
      groupPairs.add(key);

      const forward = interGroupImports[`${item.from}->${item.to}`] || 0;
      const backward = interGroupImports[`${item.to}->${item.from}`] || 0;

      if (forward > backward) {
        dependencyDirection.push({
          dependent: item.from,
          dependsOn: item.to
        });
      } else if (backward > forward) {
        dependencyDirection.push({
          dependent: item.to,
          dependsOn: item.from
        });
      }
    }
  });

  // File Stats
  const filesPerGroup = {};
  Object.keys(directoryGroups).forEach(dirName => {
    filesPerGroup[dirName] = directoryGroups[dirName].length;
  });

  const nodeTypeCounts = {};
  Object.keys(nodeTypeGroups).forEach(type => {
    nodeTypeCounts[type] = nodeTypeGroups[type].length;
  });

  const result = {
    scriptCompleted: true,
    directoryGroups,
    nodeTypeGroups,
    crossCategoryEdges: crossCategoryList,
    interGroupImports: interGroupList,
    intraGroupDensity,
    patternMatches,
    deploymentTopology,
    dataPipeline,
    docCoverage,
    dependencyDirection,
    fileStats: {
      totalFileNodes: fileNodes.length,
      filesPerGroup,
      nodeTypeCounts
    },
    fileFanIn,
    fileFanOut
  };

  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`Analysis complete. Results written to ${outputPath}`);
  process.exit(0);

} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
