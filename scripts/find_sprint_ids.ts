/**
 * scripts/find_sprint_ids.ts — Descubrir tableros y IDs de Sprints en Jira Cloud (SRE)
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');

const envAgentsPath = path.join(PROJECT_ROOT, '.env.agents');
function loadEnvFile(filePath: string): Record<string, string> {
  const env: Record<string, string> = {};
  if (!fs.existsSync(filePath)) return env;
  const content = fs.readFileSync(filePath, 'utf-8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    const key = parts[0].trim();
    let val = parts.slice(1).join('=').trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  });
  return env;
}

const envAgents = loadEnvFile(envAgentsPath);

const JIRA_DOMAIN = envAgents.JIRA_DOMAIN || 'edwinfloress.atlassian.net';
const JIRA_EMAIL = envAgents.JIRA_EMAIL || 'ejuniorfloress@gmail.com';
const JIRA_API_TOKEN = envAgents.JIRA_API_TOKEN || '';

function makeRequest(options: https.RequestOptions): Promise<{ statusCode?: number; body: string }> {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: data });
      });
    });
    req.on('error', (err) => { reject(err); });
    req.end();
  });
}

async function run() {
  const authString = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');
  
  // 1. Obtener tableros (boards)
  const options: https.RequestOptions = {
    hostname: JIRA_DOMAIN,
    path: '/rest/agile/1.0/board',
    method: 'GET',
    headers: {
      'Authorization': `Basic ${authString}`,
      'Accept': 'application/json',
      'User-Agent': 'DevSecOps-Jira-SRE'
    }
  };

  try {
    const res = await makeRequest(options);
    if (res.statusCode === 200) {
      const data = JSON.parse(res.body);
      const boards = data.values || [];
      console.log('Tableros encontrados:');
      for (const board of boards) {
        console.log(`- ID: ${board.id} | Nombre: ${board.name} | Tipo: ${board.type}`);
        
        // 2. Obtener sprints de cada tablero
        const sprintOptions = {
          ...options,
          path: `/rest/agile/1.0/board/${board.id}/sprint`
        };
        const sprintRes = await makeRequest(sprintOptions);
        if (sprintRes.statusCode === 200) {
          const sprintData = JSON.parse(sprintRes.body);
          const sprints = sprintData.values || [];
          for (const sprint of sprints) {
            console.log(`   ↳ Sprint ID: ${sprint.id} | Nombre: ${sprint.name} | Estado: ${sprint.state}`);
          }
        }
      }
    } else {
      console.log(`Fallo al consultar tableros (HTTP ${res.statusCode}): ${res.body}`);
    }
  } catch (e: any) {
    console.error('Error:', e.message);
  }
}

run();
