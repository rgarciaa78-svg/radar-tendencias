import { useState, useRef, useEffect } from 'react';
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
  const summary = trends.slice(0, 40).map(t =>
    `- [${t.category}] "${t.name}" (${t.region}, score ${t.score}, prioridad ${t.priority}): ${t.evidence?.slice(0, 120)}...`
  ).join('\n');
  return `Eres un analista experto en innovación de alimentos y bebidas saludables para el mercado peruano, trabajando para una holding con las marcas TIGO (lácteos), B&D (salsas) y Straal (deportivo).

Tienes acceso al Radar de Tendencias con ${trends.length} tendencias globales detectadas. Aquí un resumen de las principales:

${summary}

Responde siempre en español, de forma concisa y accionable. Cuando el usuario pregunte por una tendencia específica, usa los datos del radar para dar contexto concreto. Puedes hacer análisis, comparaciones, recomendaciones de I+D, y estrategias de lanzamiento.`;
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
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemCtx }] },
            contents: history,
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
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
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
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
