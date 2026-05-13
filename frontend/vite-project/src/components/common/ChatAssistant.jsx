import { useState } from "react";
import API from "../../services/api";
import { useAuth } from "../../store/AuthContext";
import { useShop } from "../../store/ShopContext";

const starterPrompts = [
  "Show me rings under $200",
  "What is trending?",
  "What are people searching?",
  "Recommend something for me",
  "Where is my order?",
  "Apply coupon SAVE10",
  "Shipping info"
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
      text: "Hi! I am Luwia AI 💎\nI can help you with:\n\u2022 Product search (\"show me rings under $200\")\n\u2022 Trending & recommendations\n\u2022 Order tracking\n\u2022 Cart & coupons\n\u2022 Shipping, returns & payment info"
    }
  ]);

  const sendMessage = async (text) => {
    const content = text.trim();
    if (!content) return;

    setMessages((prev) => [...prev, { role: "user", text: content }]);
    setInput("");
    setBusy(true);

    try {
      const res = await API.post("/assistant/chat", { message: content });
      const botMsg = {
        role: "assistant",
        text: res.data.reply,
        payload: res.data.payload,
        intent: res.data.intent
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "I could not process that right now. Please try again." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-emerald-900 px-5 py-3 text-sm font-semibold text-white shadow-lg"
      >
        {open ? "Close Assistant" : "AI Assistant"}
      </button>

      {open && (
        <div className="fixed bottom-20 right-4 z-50 flex h-[70vh] w-[92vw] max-w-md flex-col rounded-2xl border border-amber-100 bg-white shadow-2xl">
          <div className="border-b border-amber-100 bg-emerald-950 px-4 py-3 text-white">
            <p className="text-sm font-semibold">Luwia AI Shopping Agent</p>
            <p className="text-xs text-amber-100">{user ? `Signed in as ${user.name}` : "Guest mode"}</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.map((m, index) => (
              <div key={`${m.role}-${index}`} className={m.role === "user" ? "text-right" : "text-left"}>
                <div
                  className={`inline-block max-w-[90%] rounded-xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-emerald-900 text-white"
                      : "bg-amber-50 text-emerald-900"
                  }`}
                >
                  <p>{m.text}</p>

                  {m.payload?.products?.length > 0 && (
                    <div className="mt-2 space-y-2 text-left">
                      {m.payload.products.slice(0, 4).map((p) => (
                        <div key={p._id} className="rounded border border-amber-100 bg-white p-2 text-xs">
                          <p className="font-semibold text-emerald-900">{p.name}</p>
                          <p className="text-amber-800">${p.price} &nbsp;|&nbsp; {p.category}</p>
                          <button
                            className="mt-1 rounded-full border border-emerald-900 px-2 py-1 text-[11px] text-emerald-900"
                            onClick={() => {
                              if (!user) {
                                setMessages((prev) => [...prev, { role: "assistant", text: "Please login first to add products to cart." }]);
                                return;
                              }
                              addToCart(p._id, 1);
                            }}
                          >
                            Add to Cart
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {m.payload?.topByCategory && (
                    <div className="mt-2 space-y-1 text-left text-xs">
                      {Object.entries(m.payload.topByCategory).map(([cat, items]) => (
                        <div key={cat}>
                          <span className="font-semibold text-emerald-800">{cat}:</span>{" "}
                          <span className="text-emerald-700">{items.join(", ")}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {m.payload?.timeline?.length > 0 && (
                    <div className="mt-2 text-left text-xs">
                      {m.payload.timeline.map((t) => (
                        <p key={t.step} className={t.completed ? "text-emerald-800" : "text-gray-500"}>
                          {t.completed ? "●" : "○"} {t.step}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-amber-100 p-3">
            <div className="mb-2 flex flex-wrap gap-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full border border-amber-200 px-2 py-1 text-[11px] text-emerald-900"
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
                className="flex-1 rounded-full border border-amber-100 px-3 py-2 text-sm"
                placeholder="Ask me anything..."
              />
              <button disabled={busy} className="rounded-full bg-emerald-900 px-4 py-2 text-sm text-white">
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
