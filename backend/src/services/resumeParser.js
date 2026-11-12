/**
 * Resume parser and skill extraction module.
 * Ported directly from resume_parser.py using pdf-parse for text extraction
 * and the identical SKILL_CATALOG with regex word-boundary matching.
 */

const pdfParse = require('pdf-parse');

// Master Canonical Skill Catalog with Aliases (identical to Python version)
const SKILL_CATALOG = [
  // Languages
  { name: 'Python', category: 'Programming Languages', aliases: ['python', 'python3'] },
  { name: 'Java', category: 'Programming Languages', aliases: ['java', 'core java', 'advanced java'] },
  { name: 'JavaScript', category: 'Programming Languages', aliases: ['javascript', 'js', 'ecmascript'] },
  { name: 'TypeScript', category: 'Programming Languages', aliases: ['typescript', 'ts'] },
  { name: 'C++', category: 'Programming Languages', aliases: ['c++', 'cpp'] },
  { name: 'C#', category: 'Programming Languages', aliases: ['c#', 'c-sharp', 'csharp'] },
  { name: 'PHP', category: 'Programming Languages', aliases: ['php'] },
  { name: 'Ruby', category: 'Programming Languages', aliases: ['ruby'] },
  { name: 'Go', category: 'Programming Languages', aliases: ['golang', 'go_special'] },
  { name: 'Rust', category: 'Programming Languages', aliases: ['rust'] },

  // Web & Frontend / Backend
  { name: 'React', category: 'Web Development', aliases: ['react', 'reactjs', 'react.js', 'react native'] },
  { name: 'Django', category: 'Web Development', aliases: ['django', 'django rest framework', 'drf'] },
  { name: 'Node.js', category: 'Web Development', aliases: ['node', 'nodejs', 'node.js'] },
  { name: 'Express.js', category: 'Web Development', aliases: ['express', 'expressjs', 'express.js'] },
  { name: 'HTML', category: 'Web Development', aliases: ['html', 'html5'] },
  { name: 'CSS', category: 'Web Development', aliases: ['css', 'css3', 'tailwind', 'tailwind css', 'bootstrap'] },
  { name: 'Next.js', category: 'Web Development', aliases: ['nextjs', 'next.js'] },
  { name: 'Angular', category: 'Web Development', aliases: ['angular', 'angularjs'] },
  { name: 'Vue.js', category: 'Web Development', aliases: ['vue', 'vuejs', 'vue.js'] },
  { name: 'FastAPI', category: 'Web Development', aliases: ['fastapi', 'fast-api'] },
  { name: 'Flask', category: 'Web Development', aliases: ['flask'] },

  // Databases
  { name: 'SQL', category: 'Databases', aliases: ['sql', 'rdbms'] },
  { name: 'PostgreSQL', category: 'Databases', aliases: ['postgresql', 'postgres', 'psql'] },
  { name: 'MongoDB', category: 'Databases', aliases: ['mongodb', 'mongo'] },
  { name: 'MySQL', category: 'Databases', aliases: ['mysql'] },
  { name: 'Redis', category: 'Databases', aliases: ['redis'] },
  { name: 'SQLite', category: 'Databases', aliases: ['sqlite', 'sqlite3'] },

  // AI, Data Science & Machine Learning
  { name: 'Machine Learning', category: 'AI & Data Science', aliases: ['machine learning', 'ml'] },
  { name: 'Deep Learning', category: 'AI & Data Science', aliases: ['deep learning', 'dl', 'neural networks', 'ann', 'cnn', 'rnn'] },
  { name: 'Natural Language Processing', category: 'AI & Data Science', aliases: ['natural language processing', 'nlp'] },
  { name: 'TensorFlow', category: 'AI & Data Science', aliases: ['tensorflow', 'tf'] },
  { name: 'PyTorch', category: 'AI & Data Science', aliases: ['pytorch'] },
  { name: 'Pandas', category: 'AI & Data Science', aliases: ['pandas'] },
  { name: 'NumPy', category: 'AI & Data Science', aliases: ['numpy'] },
  { name: 'Scikit-Learn', category: 'AI & Data Science', aliases: ['scikit-learn', 'scikit learn', 'sklearn'] },
  { name: 'Data Analysis', category: 'AI & Data Science', aliases: ['data analysis', 'data analytics', 'exploratory data analysis', 'eda'] },
  { name: 'Excel', category: 'Data & Analytics', aliases: ['excel', 'ms excel', 'microsoft excel', 'spreadsheets'] },
  { name: 'Power BI', category: 'Data & Analytics', aliases: ['power bi', 'powerbi', 'power-bi'] },
  { name: 'Tableau', category: 'Data & Analytics', aliases: ['tableau'] },

  // Cloud & DevOps
  { name: 'AWS', category: 'Cloud & DevOps', aliases: ['aws', 'amazon web services', 'ec2', 's3', 'lambda'] },
  { name: 'Docker', category: 'Cloud & DevOps', aliases: ['docker', 'containerization'] },
  { name: 'Kubernetes', category: 'Cloud & DevOps', aliases: ['kubernetes', 'k8s'] },
  { name: 'Git', category: 'Cloud & DevOps', aliases: ['git', 'github', 'gitlab'] },
  { name: 'Linux', category: 'Cloud & DevOps', aliases: ['linux', 'ubuntu', 'bash', 'shell scripting'] },
  { name: 'Azure', category: 'Cloud & DevOps', aliases: ['azure', 'microsoft azure'] },
  { name: 'GCP', category: 'Cloud & DevOps', aliases: ['gcp', 'google cloud', 'google cloud platform'] },
];

/**
 * Extracts plain text from a PDF file buffer.
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<string>} extracted text content
 */
async function extractTextFromPdf(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (err) {
    console.error('Error extracting text from PDF:', err.message);
    return '';
  }
}

/**
 * Builds a regex pattern for a given alias, applying special-case handling
 * identical to the Python resume_parser.py implementation.
 * @param {string} alias
 * @returns {RegExp}
 */
function buildPattern(alias) {
  switch (alias) {
    case 'c++':
    case 'cpp':
      return /(?:\bc\+\+|\bcpp\b)/i;
    case 'c#':
    case 'csharp':
    case 'c-sharp':
      return /(?:\bc#\b|\bcsharp\b|\bc-sharp\b)/i;
    case 'go_special':
      return /\bgo\b(?!\s+(?:to|on|ahead|away|into|through|back))/i;
    case 'node':
    case 'nodejs':
    case 'node.js':
      return /(?:\bnode\.js\b|\bnodejs\b|\bnode\s+js\b|\bnode\b(?!\s+(?:red|balancer)))/i;
    case 'react':
    case 'reactjs':
    case 'react.js':
      return /(?:\breact\.js\b|\breactjs\b|\breact\b(?!\s+(?:ion|or|ant)))/i;
    case 'vue':
    case 'vuejs':
    case 'vue.js':
      return /(?:\bvue\.js\b|\bvuejs\b|\bvue\b)/i;
    case 'nextjs':
    case 'next.js':
      return /(?:\bnext\.js\b|\bnextjs\b)/i;
    case 'git':
    case 'github':
    case 'gitlab':
      return /(?:\bgit\b|\bgithub\b|\bgitlab\b)/i;
    case 'java':
      return /\bjava\b(?!\s*script)/i;
    case 'js':
      return /\bjs\b/i;
    case 'ml':
      return /\bml\b/i;
    case 'dl':
      return /\bdl\b/i;
    case 'nlp':
      return /\bnlp\b/i;
    case 'aws':
      return /\baws\b/i;
    case 'gcp':
      return /\bgcp\b/i;
    case 'sql':
      return /\bsql\b/i;
    default: {
      // Escape special regex chars and wrap in word boundaries
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`\\b${escaped}\\b`, 'i');
    }
  }
}

/**
 * Identifies and extracts normalized skills from raw text.
 * Uses word-boundary regex to avoid false positives.
 * @param {string} text - raw text from PDF
 * @returns {string[]} sorted list of unique canonical skill names found
 */
function extractSkills(text) {
  if (!text) return [];

  // Normalize text exactly as Python version does
  let normalized = ' ' + text.toLowerCase() + ' ';
  normalized = normalized.replace(/[\r\n\t,;/()\[\]{}:|]/g, ' ');
  normalized = normalized.replace(/\s+/g, ' ');

  const foundSkills = new Set();

  for (const item of SKILL_CATALOG) {
    const canonicalName = item.name;
    const aliases = item.aliases || [canonicalName.toLowerCase()];

    for (const alias of aliases) {
      const pattern = buildPattern(alias);
      if (pattern.test(normalized)) {
        foundSkills.add(canonicalName);
        break; // found this skill, no need to check more aliases
      }
    }
  }

  return Array.from(foundSkills).sort();
}

module.exports = { extractTextFromPdf, extractSkills, SKILL_CATALOG };
