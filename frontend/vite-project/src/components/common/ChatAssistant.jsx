import { useState, useRef, useEffect } from "react";
import API from "../../services/api";
import { useAuth } from "../../store/AuthContext";
import { useShop } from "../../store/ShopContext";

const starterPrompts = [
  "Show me rings under $200",
  "What is trending this season?",
  "Recommend a gift for her",
  "Apply coupon SAVE10",
  "What is your shipping policy?",
  "How do I track my order?",
  "Do you offer gift wrapping?",
  "What is Luwia AI?",
  "Tell me about React",
  "What are seasonal picks?"
];

const seasonalPrompts = [
  "Spring sparkle",
  "Summer statement pieces",
  "Autumn gold trends",
  "Winter party jewels",
  "Holiday gifting ideas"
];

const appPrompts = [
  "How do I use the wishlist?",
  "How do I sign up?",
  "How do I apply a coupon?",
  "What is the return policy?",
  "Do you have gift wrapping?",
  "What is product discovery?"
];

const ChatAssistant = () => {
  const { user } = useAuth();
  const { addToCart } = useShop();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text:
        "Hello! I am Luwia AI 💎\nAsk me about the app, gifts, seasonal collections, product search, coupons, orders, shipping, returns, or general tech questions.\n• Try: show me rings under $200\n• Try: what is trending this season?\n• Try: apply coupon SAVE10\n• Try: do you offer gift wrapping?\n• Try: tell me about React",
      time: new Date().toISOString()
    }
  ]);

  const sendMessage = async (text) => {
    const content = text.trim();
    if (!content) return;

    const userMsg = { role: "user", text: content, time: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setBusy(true);

    try {
      const res = await API.post("/assistant/chat", { message: content });
      const botMsg = {
        role: "assistant",
        text: res.data.reply,
        payload: res.data.payload,
        intent: res.data.intent,
        isGeneral: res.data.intent === "general_knowledge",
        time: new Date().toISOString()
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "I could not process that right now. Please try again.", time: new Date().toISOString() }]);
    } finally {
      setBusy(false);
    }
  };

  const scrollRef = useRef(null);
  const scrollToBottom = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  };

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timer);
  }, [messages, open]);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-white border px-4 py-2 text-sm font-semibold text-emerald-900 shadow transition hover:scale-[1.02]"
      >
        {open ? "Close Concierge" : "Luwia AI"}
      </button>

      {open && (
        <div className="fixed bottom-20 right-4 z-50 flex h-[60vh] w-[94vw] max-w-md flex-col rounded-2xl border bg-white shadow-lg text-slate-900">
          <div className="rounded-t-2xl border-b px-4 py-3 bg-white">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-900">Luwia AI Concierge</p>
            <p className="mt-1 text-xs text-emerald-700">{user ? `Welcome back, ${user.name}` : "Guest — sign in for personalized picks"}</p>
          </div>

          <div className="space-y-3 border-b border-emerald-100/40 px-4 py-4">
            <div className="rounded-3xl border border-emerald-100/30 bg-white p-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-500">Seasonal inspiration</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {seasonalPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="rounded-full border border-emerald-100/40 bg-emerald-50 px-3 py-1 text-[11px] text-emerald-900 transition hover:bg-emerald-100"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-100/30 bg-white p-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-500">App & random questions</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {appPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="rounded-full border border-emerald-100/40 bg-emerald-50 px-3 py-1 text-[11px] text-emerald-900 transition hover:bg-emerald-100"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-3 bg-white">
            {messages.map((m, index) => (
              <div key={`${m.role}-${index}`} className={`flex items-start gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" ? (
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-emerald-900 flex items-center justify-center text-white text-xs">AI</div>
                  </div>
                ) : (
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 text-xs">U</div>
                  </div>
                )}

                <div className={`max-w-[78%] ${m.role === "user" ? "text-right" : "text-left"}`}>
                  <div className={`inline-block w-full rounded-xl px-3 py-2 text-sm ${m.role === "user" ? "bg-emerald-900 text-white" : "bg-slate-50 text-emerald-900 border border-emerald-100"}`}>
                    <p className="whitespace-pre-wrap">{m.text}</p>

                    {m.payload?.products?.length > 0 && (
                      <div className="mt-2 grid grid-cols-1 gap-2">
                        {m.payload.products.slice(0, 4).map((p) => (
                          <div key={p._id} className="flex items-center gap-3 rounded border border-emerald-50 bg-white p-2 text-xs">
                            <img src={p.image || "/images/placeholder.png"} alt={p.name} className="h-14 w-14 rounded object-cover" />
                            <div className="flex-1">
                              <p className="font-semibold text-emerald-900">{p.name}</p>
                              <p className="text-emerald-700 text-xs">${p.price} • {p.category}</p>
                            </div>
                            <div>
                              <button
                                className="rounded-full border border-emerald-900 px-2 py-1 text-[11px] text-emerald-900 hover:bg-emerald-50"
                                onClick={() => {
                                  if (!user) {
                                    setMessages((prev) => [...prev, { role: "assistant", text: "Please login first to add products to cart.", time: new Date().toISOString() }]);
                                    return;
                                  }
                                  addToCart(p._id, 1);
                                  setMessages((prev) => [...prev, { role: "assistant", text: `✅ ${p.name} added to your cart!`, time: new Date().toISOString() }]);
                                }}
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-1 text-[10px] text-slate-400">
                    {new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t p-3 bg-white">
            <div className="mb-2 flex flex-wrap gap-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full border border-emerald-100 px-2 py-1 text-[11px] text-emerald-900 hover:bg-emerald-50 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={busy}
                className="flex-1 rounded-full border border-emerald-100 px-3 py-2 text-sm focus:outline-none focus:border-emerald-600 disabled:opacity-50 bg-white"
                placeholder="Ask me anything... shop or general Q&A"
              />
              <button 
                disabled={busy} 
                className="rounded-full bg-emerald-900 hover:bg-emerald-800 px-4 py-2 text-sm text-white disabled:opacity-50 transition font-semibold"
              >
                {busy ? "..." : "Send"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatAssistant;
