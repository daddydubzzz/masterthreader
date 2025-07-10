import fs from 'fs';
import path from 'path';
import { MegaPromptVersion, MegaPromptChange } from './megaPromptVersioning';

// File paths
const MEGAPROMPT_FILES = {
  core: 'megaprompt-core.txt',
  style: 'megaprompt-style-rules.txt',
  examples: 'megaprompt-examples.txt',
  advanced: 'megaprompt-advanced-rules.txt'
};

const VERSIONS_DIR = 'megaprompt-versions';
const VERSIONS_INDEX_FILE = path.join(VERSIONS_DIR, 'versions.json');

// Ensure versions directory exists
function ensureVersionsDir(): void {
  if (!fs.existsSync(VERSIONS_DIR)) {
    fs.mkdirSync(VERSIONS_DIR, { recursive: true });
  }
}

// Load versions index
function loadVersionsIndex(): MegaPromptVersion[] {
  ensureVersionsDir();
  
  if (!fs.existsSync(VERSIONS_INDEX_FILE)) {
    return [];
  }
  
  try {
    const content = fs.readFileSync(VERSIONS_INDEX_FILE, 'utf-8');
    return JSON.parse(content).map((v: Record<string, string | number | boolean>) => ({
      ...v,
      timestamp: new Date(v.timestamp as string)
    }));
  } catch (error) {
    console.error('Error loading versions index:', error);
    return [];
  }
}

// Save versions index
function saveVersionsIndex(versions: MegaPromptVersion[]): void {
  ensureVersionsDir();
  
  try {
    fs.writeFileSync(VERSIONS_INDEX_FILE, JSON.stringify(versions, null, 2));
  } catch (error) {
    console.error('Error saving versions index:', error);
    throw new Error('Failed to save versions index');
  }
}

// Create snapshot of current megaprompt files
function createFileSnapshots(): MegaPromptVersion['fileSnapshots'] {
  const snapshots: MegaPromptVersion['fileSnapshots'] = {
    core: '',
    style: '',
    examples: '',
    advanced: ''
  };
  
  for (const [key, filename] of Object.entries(MEGAPROMPT_FILES)) {
    try {
      snapshots[key as keyof typeof snapshots] = fs.readFileSync(filename, 'utf-8');
    } catch (error) {
      console.warn(`Could not read ${filename}:`, error);
      snapshots[key as keyof typeof snapshots] = '';
    }
  }
  
  return snapshots;
}

// Save version snapshot to disk
function saveVersionSnapshot(version: MegaPromptVersion): void {
  const versionDir = path.join(VERSIONS_DIR, version.id);
  
  if (!fs.existsSync(versionDir)) {
    fs.mkdirSync(versionDir, { recursive: true });
  }
  
  // Save file snapshots
  for (const [key, content] of Object.entries(version.fileSnapshots)) {
    const filename = MEGAPROMPT_FILES[key as keyof typeof MEGAPROMPT_FILES];
    fs.writeFileSync(path.join(versionDir, filename), content);
  }
  
  // Save version metadata
  fs.writeFileSync(
    path.join(versionDir, 'metadata.json'),
    JSON.stringify({
      id: version.id,
      version: version.version,
      timestamp: version.timestamp,
      changes: version.changes,
      author: version.author,
      description: version.description
    }, null, 2)
  );
}

// Create new version
export function createMegaPromptVersion(
  changes: MegaPromptChange[],
  description: string,
  author: 'user' | 'ai-suggestion' = 'user'
): MegaPromptVersion {
  const versions = loadVersionsIndex();
  const lastVersion = versions[versions.length - 1];
  
  // Generate new version number
  const lastVersionNumber = lastVersion ? parseFloat(lastVersion.version.substring(1)) : 1.0;
  const newVersionNumber = lastVersionNumber + 0.1;
  const newVersion = `v${newVersionNumber.toFixed(1)}`;
  
  const version: MegaPromptVersion = {
    id: `version-${Date.now()}`,
    version: newVersion,
    timestamp: new Date(),
    changes,
    author,
    description,
    fileSnapshots: createFileSnapshots()
  };
  
  // Save version snapshot
  saveVersionSnapshot(version);
  
  // Update versions index
  versions.push(version);
  saveVersionsIndex(versions);
  
  return version;
}

// Apply changes to megaprompt files
export function applyMegaPromptChanges(changes: MegaPromptChange[]): void {
  const fileContents: { [key: string]: string } = {};
  
  // Load current file contents
  for (const [key, filename] of Object.entries(MEGAPROMPT_FILES)) {
    try {
      fileContents[key] = fs.readFileSync(filename, 'utf-8');
    } catch (error) {
      console.warn(`Could not read ${filename}:`, error);
      fileContents[key] = '';
    }
  }
  
  // Apply changes
  for (const change of changes) {
    const { file, type, oldContent, newContent, section } = change;
    
    switch (type) {
      case 'addition':
        if (section) {
          // Add to specific section
          const sectionMarker = `<${section.toUpperCase()}>`;
          const endMarker = `</${section.toUpperCase()}>`;
          
          if (fileContents[file].includes(sectionMarker)) {
            const beforeSection = fileContents[file].split(sectionMarker)[0];
            const afterSection = fileContents[file].split(endMarker)[1] || '';
            const sectionContent = fileContents[file].split(sectionMarker)[1]?.split(endMarker)[0] || '';
            
            fileContents[file] = beforeSection + sectionMarker + sectionContent + '\n' + newContent + endMarker + afterSection;
          } else {
            // Append to end if section not found
            fileContents[file] += '\n\n' + newContent;
          }
        } else {
          // Append to end of file
          fileContents[file] += '\n\n' + newContent;
        }
        break;
        
      case 'modification':
        if (oldContent) {
          fileContents[file] = fileContents[file].replace(oldContent, newContent);
        }
        break;
        
      case 'deletion':
        if (oldContent) {
          fileContents[file] = fileContents[file].replace(oldContent, '');
        }
        break;
    }
  }
  
  // Write updated files
  for (const [key, filename] of Object.entries(MEGAPROMPT_FILES)) {
    try {
      fs.writeFileSync(filename, fileContents[key]);
    } catch (error) {
      console.error(`Error writing ${filename}:`, error);
      throw new Error(`Failed to update ${filename}`);
    }
  }
}

// Rollback to specific version
export function rollbackToVersion(versionId: string): void {
  const versions = loadVersionsIndex();
  const version = versions.find(v => v.id === versionId);
  
  if (!version) {
    throw new Error(`Version ${versionId} not found`);
  }
  
  // Restore files from snapshot
  for (const [key, filename] of Object.entries(MEGAPROMPT_FILES)) {
    const content = version.fileSnapshots[key as keyof typeof version.fileSnapshots];
    if (content) {
      try {
        fs.writeFileSync(filename, content);
      } catch (error) {
        console.error(`Error restoring ${filename}:`, error);
        throw new Error(`Failed to restore ${filename}`);
      }
    }
  }
  
  // Create new version entry for the rollback
  const rollbackVersion: MegaPromptVersion = {
    id: `rollback-${Date.now()}`,
    version: `v${(parseFloat(version.version.substring(1)) + 0.1).toFixed(1)}`,
    timestamp: new Date(),
    changes: [{
      id: `rollback-${Date.now()}`,
      type: 'modification',
      file: 'core',
      newContent: `Rolled back to version ${version.version}`,
      reasoning: `User requested rollback to version ${version.version}`
    }],
    author: 'user',
    description: `Rollback to version ${version.version}`,
    fileSnapshots: createFileSnapshots()
  };
  
  versions.push(rollbackVersion);
  saveVersionsIndex(versions);
}

// Get all versions
export function getAllVersions(): MegaPromptVersion[] {
  return loadVersionsIndex();
}

// Get version by ID
export function getVersionById(versionId: string): MegaPromptVersion | null {
  const versions = loadVersionsIndex();
  return versions.find(v => v.id === versionId) || null;
}

// Initialize versioning system
export function initializeMegaPromptVersioning(): void {
  ensureVersionsDir();
  
  const versions = loadVersionsIndex();
  if (versions.length === 0) {
    // Create initial version
    const initialVersion = createMegaPromptVersion(
      [],
      'Initial megaprompt version',
      'user'
    );
    
    console.log('Created initial megaprompt version:', initialVersion.version);
  }
} 