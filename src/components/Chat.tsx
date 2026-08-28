import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Key, Trash2, Sparkles, X } from 'lucide-react';
import { useTrendStore } from '../store/useTrendStore';

const API_KEY_STORAGE = 'radar-gemini-key';
const CHAT_STORAGE    = 'radar-chat-history';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  ts: number;
}

function buildSystemContext(trends: any[]): string {
  const trendDetails = trends.map(t => {
    let entry = `### ${t.name} (ID: ${t.id})
- Categoría: ${t.category} | Región: ${t.region}${t.country ? ` (${t.country})` : ''} | Marca asignada: ${t.brand}
- Score: ${t.score}/100 | Prioridad: ${t.priority} | Complejidad: ${t.complexity || 'N/D'} | Estado: ${t.status}
- Evidencia: ${t.evidence}`;
    if (t.peruOpportunity) entry += `\n- Oportunidad Perú: ${t.peruOpportunity}`;
    if (t.suggestedAction) entry += `\n- Acción sugerida: ${t.suggestedAction}`;
    if (t.brief) {
      const b = t.brief;
      if (b.objetivo) entry += `\n- Objetivo brief: ${b.objetivo}`;
      if (b.publicoObjetivo) entry += `\n- Público objetivo: ${b.publicoObjetivo}`;
      if (b.mensajeClave) entry += `\n- Mensaje clave: ${b.mensajeClave}`;
      if (b.posicionamiento) entry += `\n- Posicionamiento: ${b.posicionamiento}`;
      if (b.timeline) entry += `\n- Timeline: ${b.timeline}`;
      if (b.presupuesto) entry += `\n- Presupuesto estimado: ${b.presupuesto}`;
      if (b.kpis?.length) entry += `\n- KPIs: ${b.kpis.join(' | ')}`;
      if (b.canales?.length) entry += `\n- Canales: ${b.canales.join(', ')}`;
    }
    if (t.tags?.length) entry += `\n- Tags: ${t.tags.join(', ')}`;
    return entry;
  }).join('\n\n');

  return `Eres un analista senior de innovación en alimentos y bebidas saludables, especializado en el mercado peruano. Trabajas para una holding con tres marcas:
- **TIGO**: lácteos (yogurt, kefir, quesos funcionales)
- **B&D**: salsas y condimentos saludables
- **Straal**: nutrición deportiva (proteínas, RTD, barras)

INSTRUCCIONES CRÍTICAS:
1. Responde SIEMPRE en español.
2. Usa los datos completos del radar — nunca inventes tendencias ni cifras que no estén aquí.
3. Da respuestas DETALLADAS y ACCIONABLES: incluye cifras concretas, comparaciones entre tendencias, análisis de viabilidad para Perú, y recomendaciones de próximos pasos.
4. Cuando se pida un brief o análisis, usa los campos brief, peruOpportunity y suggestedAction disponibles en los datos.
5. Cuando compares tendencias, usa sus scores, prioridades y complejidades para jerarquizarlas.
6. Siempre menciona qué marca (TIGO/B&D/Straal) debería liderar cada oportunidad y por qué.

RADAR DE TENDENCIAS — ${trends.length} tendencias detectadas:

${trendDetails}`;
}

function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Table detection
    if (line.trim().startsWith('|') && i + 1 < lines.length && lines[i + 1].trim().match(/^\|[-| :]+\|/)) {
      const tableLines: string[] = [line];
      i++;
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      const headers = tableLines[0].split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1).map(h => h.trim());
      const rows = tableLines.slice(2).map(row =>
        row.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1).map(c => c.trim())
      );
      elements.push(
        <div key={i} className="overflow-x-auto my-2">
          <table className="text-xs border-collapse w-full">
            <thead>
              <tr>{headers.map((h, idx) => <th key={idx} className="border border-slate-300 px-2 py-1 bg-slate-100 font-semibold text-left">{renderInline(h)}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, ridx) => (
                <tr key={ridx} className={ridx % 2 === 0 ? '' : 'bg-slate-50'}>
                  {row.map((cell, cidx) => <td key={cidx} className="border border-slate-300 px-2 py-1">{renderInline(cell)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Headings
    if (/^#{1,3} /.test(line)) {
      const level = line.match(/^(#{1,3}) /)?.[1].length ?? 1;
      const content = line.replace(/^#{1,3} /, '');
      const cls = level === 1 ? 'text-base font-bold mt-3 mb-1' : level === 2 ? 'text-sm font-bold mt-2 mb-1' : 'text-sm font-semibold mt-1.5 mb-0.5';
      elements.push(<p key={i} className={cls}>{renderInline(content)}</p>);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={i} className="border-slate-200 my-2" />);
      i++;
      continue;
    }

    // Bullet list item
    if (/^[-*] /.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*] /, ''));
        i++;
      }
      elements.push(
        <ul key={i} className="list-disc list-inside space-y-0.5 my-1 pl-1">
          {items.map((item, idx) => <li key={idx} className="text-sm">{renderInline(item)}</li>)}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\. /.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\. /, ''));
        i++;
      }
      elements.push(
        <ol key={i} className="list-decimal list-inside space-y-0.5 my-1 pl-1">
          {items.map((item, idx) => <li key={idx} className="text-sm">{renderInline(item)}</li>)}
        </ol>
      );
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      elements.push(<div key={i} className="h-1.5" />);
      i++;
      continue;
    }

    // Normal paragraph
    elements.push(<p key={i} className="text-sm leading-relaxed">{renderInline(line)}</p>);
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>;
    if (part.startsWith('`') && part.endsWith('`')) return <code key={i} className="bg-slate-100 rounded px-1 font-mono text-xs">{part.slice(1, -1)}</code>;
    return part;
  });
}

export function Chat() {
  const { trends } = useTrendStore();

  const [apiKey, setApiKey] = useState(() => {
    try { return localStorage.getItem(API_KEY_STORAGE) || ''; } catch { return ''; }
  });
  const [keyInput, setKeyInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    try { localStorage.setItem(CHAT_STORAGE, JSON.stringify(messages.slice(-50))); } catch {}
  }, [messages]);

  function saveKey() {
    const k = keyInput.trim();
    if (k.length < 20) {
      setError('Key inválida. Cópiala desde aistudio.google.com → Claves de API → Copiar clave');
      return;
    }
    try { localStorage.setItem(API_KEY_STORAGE, k); } catch {}
    setApiKey(k);
    setKeyInput('');
    setError('');
  }

  function clearKey() {
    try { localStorage.removeItem(API_KEY_STORAGE); } catch {}
    setApiKey('');
  }

  function clearChat() {
    setMessages([]);
    try { localStorage.removeItem(CHAT_STORAGE); } catch {}
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setError('');

    const userMsg: Message = { role: 'user', content: text, ts: Date.now() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);

    try {
      const systemCtx = buildSystemContext(trends);
      const history = updated.slice(-10).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemCtx }] },
            contents: history,
            generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any)?.error?.message || `Error ${res.status}`);
      }

      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply, ts: Date.now() }]);
    } catch (e: any) {
      setError(e.message || 'Error al conectar con Gemini');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  const SUGGESTIONS = [
    '¿Cuáles son las 3 tendencias con mayor potencial para TIGO?',
    '¿Qué oportunidades hay en proteína RTD para Straal?',
    'Compara las tendencias de probióticos vs colágeno',
    'Dame un brief de lanzamiento para la tendencia con mayor score',
  ];

  // ── Setup screen ──────────────────────────────────────────────────────
  if (!apiKey) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-lg">Chat IA — Radar</h2>
              <p className="text-slate-500 text-sm">Analiza tendencias con inteligencia artificial</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800 space-y-1">
            <p className="font-semibold">Configuración única (5 min)</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-700">
              <li>Ve a <strong>aistudio.google.com</strong></li>
              <li>Click en <strong>"Get API key"</strong> → <strong>"Create API key"</strong></li>
              <li>Click en el ícono de la clave → botón <strong>"Copiar clave"</strong></li>
              <li>Pégala aquí abajo</li>
            </ol>
            <p className="text-blue-600 text-xs mt-2">✓ 100% gratis · ✓ Sin tarjeta de crédito · ✓ 1,500 chats/día</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <Key size={13} /> API Key de Gemini
            </label>
            <input
              type="password"
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveKey()}
              placeholder="AIza... o AQ.Ab..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
          </div>

          <button
            onClick={saveKey}
            disabled={!keyInput.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl transition-colors"
          >
            Activar Chat IA
          </button>
        </div>
      </div>
    );
  }

  // ── Chat screen ───────────────────────────────────────────────────────
  return (
    <div className="flex flex-col bg-slate-50" style={{ height: 'calc(100vh - 57px)' }}>

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Sparkles size={15} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Chat IA</p>
            <p className="text-xs text-slate-500">{trends.length} tendencias en contexto</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button onClick={clearChat} className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg transition-colors" title="Borrar chat">
              <Trash2 size={15} />
            </button>
          )}
          <button onClick={clearKey} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors" title="Cambiar API key">
            <Key size={15} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={14} className="text-white" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm border border-slate-100 px-4 py-3 max-w-lg">
                <p className="text-sm text-slate-700">
                  Hola! Soy tu analista de tendencias con acceso a <strong>{trends.length} tendencias globales</strong> del radar.
                  Puedo ayudarte a analizar oportunidades, comparar tendencias y crear briefs de I+D. ¿Qué quieres explorar?
                </p>
              </div>
            </div>
            <div className="pl-10 grid grid-cols-1 gap-2">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => { setInput(s); inputRef.current?.focus(); }}
                  className="text-left text-xs bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl px-3 py-2.5 text-slate-600 hover:text-blue-700 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
              msg.role === 'user' ? 'bg-slate-700' : 'bg-blue-600'
            }`}>
              {msg.role === 'user' ? <User size={13} className="text-white" /> : <Bot size={13} className="text-white" />}
            </div>
            <div className={`max-w-lg rounded-2xl px-4 py-3 text-sm shadow-sm border ${
              msg.role === 'user'
                ? 'bg-slate-800 text-white border-slate-700 rounded-tr-sm'
                : 'bg-white text-slate-700 border-slate-100 rounded-tl-sm'
            }`}>
              {msg.role === 'assistant' ? renderMarkdown(msg.content) : <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bot size={13} className="text-white" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm border border-slate-100 px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            <X size={14} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-200 px-4 py-3 flex-shrink-0 mb-16 md:mb-0">
        <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Pregunta sobre cualquier tendencia… (Enter para enviar)"
            rows={1}
            className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 resize-none focus:outline-none max-h-32"
            style={{ minHeight: '24px' }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
          >
            <Send size={14} className="text-white" />
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-1.5 text-center">Shift+Enter para nueva línea</p>
      </div>
    </div>
  );
}
