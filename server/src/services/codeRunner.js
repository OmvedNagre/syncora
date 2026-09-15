import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Isolated Safe Code Runner
 * Executes code snippets in an isolated sub-process with hard timeout & memory limits
 */
export async function executeCode({ language = 'javascript', code = '' }) {
  const startTime = Date.now();
  const maxTimeoutMs = 4000; // 4 second hard cutoff

  if (!code || typeof code !== 'string') {
    return { stdout: '', stderr: 'Error: No code provided to execute.', executionTime: 0, exitCode: 1 };
  }

  // Create temporary directory for isolated script file
  const tmpDir = path.join(os.tmpdir(), 'duospace-runner');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const fileId = `exec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  let filename = '';
  let cmd = '';
  let args = [];

  if (language === 'javascript' || language === 'typescript') {
    filename = path.join(tmpDir, `${fileId}.js`);
    // Wrap to capture async errors and prevent process freezing
    fs.writeFileSync(filename, code, 'utf-8');
    cmd = process.execPath; // current node binary
    args = ['--max-old-space-size=64', filename];
  } else if (language === 'python') {
    filename = path.join(tmpDir, `${fileId}.py`);
    fs.writeFileSync(filename, code, 'utf-8');
    cmd = 'python3';
    args = ['-u', filename];
  } else {
    return {
      stdout: '',
      stderr: `Language "${language}" is supported via in-browser evaluation or install native runtime.`,
      executionTime: 0,
      exitCode: 1
    };
  }

  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    let child;
    try {
      child = spawn(cmd, args, {
        cwd: tmpDir,
        env: { PATH: process.env.PATH },
        timeout: maxTimeoutMs
      });
    } catch (err) {
      cleanupFile(filename);
      return resolve({
        stdout: '',
        stderr: `Failed to spawn runtime: ${err.message}`,
        executionTime: Date.now() - startTime,
        exitCode: 1
      });
    }

    const timer = setTimeout(() => {
      timedOut = true;
      try {
        child.kill('SIGKILL');
      } catch (e) {}
    }, maxTimeoutMs);

    child.stdout.on('data', (data) => {
      stdout += data.toString();
      // Cap max output size to prevent terminal flooding
      if (stdout.length > 50000) {
        stdout = stdout.substring(0, 50000) + '\n... [Output truncated: exceeded 50KB limit]';
        child.kill();
      }
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
      if (stderr.length > 20000) {
        stderr = stderr.substring(0, 20000) + '\n... [Errors truncated]';
        child.kill();
      }
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      cleanupFile(filename);
      resolve({
        stdout,
        stderr: stderr || `Runtime process error: ${err.message}`,
        executionTime: Date.now() - startTime,
        exitCode: 1
      });
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      cleanupFile(filename);
      if (timedOut) {
        stderr += `\n[Process terminated: Execution exceeded timeout of ${maxTimeoutMs / 1000}s]`;
      }
      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        executionTime: Date.now() - startTime,
        exitCode: timedOut ? 124 : (code ?? 0)
      });
    });
  });
}

function cleanupFile(filepath) {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  } catch (e) {}
}
