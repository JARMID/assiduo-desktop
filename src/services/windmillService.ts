/**
 * Windmill Workflow Automation Service for INSFP Administrative Tasks
 * Connects to Windmill workspaces to execute asynchronous scripts and scheduled jobs.
 */

export interface WindmillExecutionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

const PRIMARY_WORKSPACE =
  (import.meta.env?.VITE_WINDMILL_WORKSPACE as string) || 'trustvault';
const PRIMARY_TOKEN =
  (import.meta.env?.VITE_WINDMILL_TOKEN as string) ||
  'N9lVLEjT1OJUs1XcFfnZ0cCwhbJmwzkb';

const ALT_WORKSPACE =
  (import.meta.env?.VITE_WINDMILL_ALT_WORKSPACE as string) || 'trustvaulti';
const ALT_TOKEN =
  (import.meta.env?.VITE_WINDMILL_ALT_TOKEN as string) ||
  '1bhpgckg3KOcTubTTbRrRxScOgJ1k8p8';

async function executeWorkspaceJob(
  workspace: string,
  token: string,
  scriptPath: string,
  args: Record<string, any>,
  timeoutMs: number
): Promise<WindmillExecutionResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const formattedPath = `f/${workspace}/${scriptPath.split('/').pop()}`;
    const url = `https://app.windmill.dev/api/mcp/w/${workspace}/mcp?token=${token}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
        'MCP-Protocol-Version': '2024-11-05',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: 'runScriptByPath',
          arguments: {
            path: formattedPath,
            args,
          },
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const text = await response.text();
      const line = text.split('\n').find((l) => l.startsWith('data: '));
      if (line) {
        const json = JSON.parse(line.substring(6));
        if (json.result?.content?.[0]?.text) {
          try {
            return { success: true, data: JSON.parse(json.result.content[0].text) };
          } catch {
            return { success: true, data: json.result.content[0].text };
          }
        }
      }
      return { success: true, data: text };
    }

    return {
      success: false,
      error: `Windmill HTTP ${response.status}: ${response.statusText}`,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    return {
      success: false,
      error: err.message || 'Erreur de connexion à Windmill',
    };
  }
}

export async function runWindmillScript(
  scriptName: string,
  args: Record<string, any> = {},
  timeoutMs = 8000
): Promise<WindmillExecutionResult> {
  // Try primary workspace first
  const primary = await executeWorkspaceJob(
    PRIMARY_WORKSPACE,
    PRIMARY_TOKEN,
    scriptName,
    args,
    timeoutMs
  );
  if (primary.success) return primary;

  // Fallback to secondary workspace
  return executeWorkspaceJob(
    ALT_WORKSPACE,
    ALT_TOKEN,
    scriptName,
    args,
    timeoutMs
  );
}

export async function triggerDailyAbsenceAudit(date: string) {
  return runWindmillScript('insfp_daily_absence_audit', {
    target_date: date,
    institution: 'INSFP Ouled Fayet',
  });
}
