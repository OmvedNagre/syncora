import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  Terminal, 
  Code2, 
  Copy, 
  Check, 
  Clock, 
  Cpu, 
  MessageSquare
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { ChatContainer } from '../chat/ChatContainer';

const TEMPLATES = {
  javascript: `// DuoSpace v2 Collaborative Sandbox
// Low latency collaborative coding, algorithms, and tests

function solvePairSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement), i];
    }
    seen.set(nums[i], i);
  }
  return null;
}

const numbers = [3, 8, 12, 19, 24];
const targetSum = 27;

console.log("Input Array:", numbers);
console.log("Target Sum:", targetSum);
console.log("Indices Found:", solvePairSum(numbers, targetSum));
`,
  python: `# DuoSpace v2 Python Collaborative Sandbox
# Fast safe runner with isolated timeouts

def fibonacci_generator(count):
    series = [0, 1]
    while len(series) < count:
        series.append(series[-1] + series[-2])
    return series

print("🚀 First 12 Fibonacci numbers:")
print(fibonacci_generator(12))
`,
  typescript: `// DuoSpace v2 TypeScript Collaborative Sandbox

interface SpaceSession {
  roomCode: string;
  isEncrypted: boolean;
  activeLanguage: string;
  activeMembers: number;
}

const currentSession: SpaceSession = {
  roomCode: "DUO-CS5A",
  isEncrypted: true,
  activeLanguage: "TypeScript",
  activeMembers: 3
};

console.log("Active Space Session:", JSON.stringify(currentSession, null, 2));
`
};

export const CodeSandbox = () => {
  const { codeDoc, updateCode, terminalOutput, broadcastCodeOutput, allMembers } = useSocket();
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);

  const handleLanguageChange = (newLang) => {
    const newCode = TEMPLATES[newLang] || TEMPLATES.javascript;
    updateCode(newCode, newLang);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    broadcastCodeOutput({
      loading: true,
      stdout: '',
      stderr: '',
      executionTime: 0
    });

    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: codeDoc.language || 'javascript',
          code: codeDoc.code
        })
      });
      const data = await res.json();
      if (data.success) {
        broadcastCodeOutput({
          loading: false,
          stdout: data.result.stdout,
          stderr: data.result.stderr,
          executionTime: data.result.executionTime,
          exitCode: data.result.exitCode
        });
      }
    } catch (err) {
      broadcastCodeOutput({
        loading: false,
        stdout: '',
        stderr: 'Execution server connection failed: ' + err.message,
        executionTime: 0,
        exitCode: 1
      });
    } finally {
      setIsRunning(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(codeDoc.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetTemplate = () => {
    const template = TEMPLATES[codeDoc.language] || TEMPLATES.javascript;
    updateCode(template, codeDoc.language);
  };

  return (
    <div className="relative flex h-full bg-[#111214] select-none overflow-hidden">
      {/* Main IDE Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* IDE Top Bar */}
        <div className="h-12 px-5 border-b border-white/5 flex items-center justify-between bg-discord-main shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Code2 size={16} />
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={codeDoc.language || 'javascript'}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-[#1e1f22] border border-white/10 text-cyan-300 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
              >
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="python">Python 3</option>
                <option value="typescript">TypeScript</option>
              </select>
              <span className="text-[11px] text-discord-muted hidden sm:inline font-mono">
                {allMembers.length} Creators in Sandbox
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={copyCode}
              className="p-1.5 rounded-lg text-discord-muted hover:text-white hover:bg-white/5 transition-colors"
              title="Copy Code"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
            <button
              onClick={resetTemplate}
              className="p-1.5 rounded-lg text-discord-muted hover:text-white hover:bg-white/5 transition-colors"
              title="Reset Template"
            >
              <RotateCcw size={14} />
            </button>

            {/* Run Button */}
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all active:scale-95"
            >
              <Play size={12} fill="currentColor" className={isRunning ? 'animate-spin' : ''} />
              <span>{isRunning ? 'Running...' : 'Run Code'}</span>
            </button>

            {/* Chat Drawer Toggle */}
            <button
              onClick={() => setIsChatDrawerOpen(!isChatDrawerOpen)}
              className={`p-1.5 rounded-lg transition-colors ${
                isChatDrawerOpen 
                  ? 'bg-[#5865F2] text-white' 
                  : 'text-discord-muted hover:text-white hover:bg-white/5'
              }`}
              title="Toggle Sandbox Chat"
            >
              <MessageSquare size={16} />
            </button>
          </div>
        </div>

        {/* Editor & Output Split Panes */}
        <div className="flex-1 grid grid-rows-2 lg:grid-rows-1 lg:grid-cols-2 overflow-hidden min-h-0">
          {/* Code Editor Pane */}
          <div className="relative flex flex-col border-b lg:border-b-0 lg:border-r border-white/5 bg-[#1e1f22]">
            <div className="px-4 py-2 text-[11px] font-mono text-discord-muted border-b border-white/5 flex justify-between bg-[#18191c]">
              <span>// Collaborative Editor (Real-time Broadcast)</span>
              <span className="text-cyan-400 font-semibold">{codeDoc.code?.split('\n').length || 0} lines</span>
            </div>
            <textarea
              value={codeDoc.code || ''}
              onChange={(e) => updateCode(e.target.value)}
              spellCheck="false"
              className="flex-1 w-full p-4 font-mono text-xs text-slate-100 bg-transparent resize-none focus:outline-none leading-relaxed selection:bg-[#5865F2]/40"
              placeholder="Write or paste your code here..."
            />
          </div>

          {/* Execution Terminal Output Pane */}
          <div className="flex flex-col bg-[#141517]">
            <div className="px-4 py-2 text-[11px] font-mono text-discord-muted border-b border-white/5 flex items-center justify-between bg-[#18191c]">
              <div className="flex items-center space-x-1.5 text-cyan-400">
                <Terminal size={13} />
                <span className="font-bold">Output Console</span>
              </div>
              {terminalOutput?.executionTime !== undefined && (
                <div className="flex items-center space-x-1 text-[10px] text-discord-muted">
                  <Clock size={11} />
                  <span>{terminalOutput.executionTime}ms</span>
                </div>
              )}
            </div>

            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2 select-text">
              {terminalOutput?.loading ? (
                <div className="flex items-center space-x-2 text-cyan-400 animate-pulse">
                  <Cpu size={14} className="animate-spin" />
                  <span>Executing in isolated sandbox...</span>
                </div>
              ) : !terminalOutput ? (
                <div className="text-discord-muted text-xs italic">
                  Click "Run Code" to execute script. Output is synced to everyone in the room.
                </div>
              ) : (
                <>
                  {terminalOutput.stdout && (
                    <pre className="text-emerald-400 whitespace-pre-wrap">
                      {terminalOutput.stdout}
                    </pre>
                  )}
                  {terminalOutput.stderr && (
                    <pre className="text-red-400 whitespace-pre-wrap">
                      {terminalOutput.stderr}
                    </pre>
                  )}
                  {terminalOutput.exitCode !== undefined && (
                    <div className="pt-2 text-[10px] text-discord-muted border-t border-white/5 font-mono">
                      Process exited with code {terminalOutput.exitCode}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Slide-out Live Chat Drawer */}
      {isChatDrawerOpen && (
        <div className="w-80 border-l border-white/10 flex flex-col h-full bg-discord-main shadow-2xl shrink-0 animate-in slide-in-from-right duration-200">
          <ChatContainer channelId="general" />
        </div>
      )}
    </div>
  );
};
