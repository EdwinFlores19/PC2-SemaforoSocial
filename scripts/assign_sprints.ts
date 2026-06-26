/**
 * scripts/assign_sprints.ts — Sincronizar y mover historias a sus Sprints físicos en Jira Cloud (SRE)
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
    } else if (val.startsWith("'") && val.endsWith("'")) {
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

const SPRINT_MAP: Record<string, number> = {
  'sprint-1': 77,
  'sprint-2': 115,
  'sprint-3': 116,
  'sprint-4': 117
};

function makeRequest(options: https.RequestOptions, postData?: string): Promise<{ statusCode?: number; body: string }> {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: data });
      });
    });
    req.on('error', (err) => { reject(err); });
    if (postData) req.write(postData);
    req.end();
  });
}

async function run() {
  const authString = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');
  
  // 1. Buscar todas las historias de PFDC3
  const searchOptions: https.RequestOptions = {
    hostname: JIRA_DOMAIN,
    path: '/rest/api/3/search/jql',
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'DevSecOps-Jira-SRE'
    }
  };

  try {
    const searchBody = JSON.stringify({
      jql: 'project = PFDC3 AND (issuetype = "Historia" OR issuetype = "Tarea" OR issuetype = "Story" OR issuetype = "Task")',
      fields: ['summary', 'labels'],
      maxResults: 100
    });
    const res = await makeRequest(searchOptions, searchBody);
    if (res.statusCode !== 200) {
      console.error(`Error buscando issues (HTTP ${res.statusCode}): ${res.body}`);
      return;
    }

    const data = JSON.parse(res.body);
    const issues = data.issues || [];
    console.log(`Buscando y agrupando ${issues.length} historias por Sprint...`);

    const sprintIssues: Record<number, string[]> = {
      77: [],
      115: [],
      116: [],
      117: []
    };

    for (const issue of issues) {
      const labels: string[] = issue.fields.labels || [];
      const summary: string = issue.fields.summary || '';
      
      let matchedSprint: number | null = null;
      for (const [label, sprintId] of Object.entries(SPRINT_MAP)) {
        if (labels.includes(label) || summary.includes(`[Sprint ${label.split('-')[1]}]`)) {
          matchedSprint = sprintId;
          break;
        }
      }

      if (matchedSprint) {
        sprintIssues[matchedSprint].push(issue.key);
      }
    }

    // 2. Mover issues a sus Sprints correspondientes mediante API Agile
    for (const [sprintIdStr, keys] of Object.entries(sprintIssues)) {
      const sprintId = Number(sprintIdStr);
      if (keys.length === 0) continue;

      console.log(`Moviendo ${keys.length} actividades al Sprint ID: ${sprintId} (${keys.join(', ')})...`);
      
      const moveOptions: https.RequestOptions = {
        hostname: JIRA_DOMAIN,
        path: `/rest/agile/1.0/sprint/${sprintId}/issue`,
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'DevSecOps-Jira-SRE'
        }
      };

      const moveRes = await makeRequest(moveOptions, JSON.stringify({ issues: keys }));
      if (moveRes.statusCode === 204 || moveRes.statusCode === 200) {
        console.log(`   ✅ Sincronizados exitosamente en el Sprint ID ${sprintId}!`);
      } else {
        console.error(`   ❌ Fallo al mover al Sprint ${sprintId} (HTTP ${moveRes.statusCode}): ${moveRes.body}`);
      }
    }

    console.log('\n🎉 PROCESO DE SINCRONIZACIÓN COMPLETADO CON ÉXITO!');

  } catch (e: any) {
    console.error('Error:', e.message);
  }
}

run();
