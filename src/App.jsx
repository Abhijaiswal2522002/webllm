import { useEffect, useState } from "react";
import "./app.scss";
import * as webllm from "@mlc-ai/web-llm";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello, how are you?",
    },
  ]);
  const [engine, setEngine] = useState(null);

  useEffect(() => {
    const selectedModel = "Llama-3.1-8B-Instruct-q4f32_1-MLC";
    webllm
      .CreateMLCEngine(selectedModel, {
        initProgressCallback: (initProgress) => {
          console.log("initProgress", initProgress);
        },
      })
      .then((engine) => {
        setEngine(engine);
      });
  }, []);

  async function sendMessageToLLm() {
    if (!input.trim() || !engine) return;

    const tempMessages = [...messages, { role: "assistant", content: input }];
    setMessages(tempMessages);
    setInput("");

    try {
      const reply = await engine.chat.completions.create({
        messages: tempMessages,
      });

      const text = reply.choices[0]?.message?.content || "No response";
      setMessages([...tempMessages, { role: "model", content: text }]);
    } catch (err) {
      console.error("LLM error:", err);
      setMessages([
        ...tempMessages,
        { role: "assistant", content: "Error getting response." },
      ]);
    }
  }

  return (
    <main>
      <section>
        <div className="conversation-area">
          <div className="messages">
            {messages
              .filter((msg) => msg.role !== "system")
              .map((message, index) => (
                <div className={`message ${message.role}`} key={index}>
                  {message.content}
                </div>
              ))}
          </div>
          <div className="input-area">
            <input
              onChange={(e) => setInput(e.target.value)}
              value={input}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessageToLLm();
                }
              }}
              type="text"
              placeholder="Message LLM"
            />
            <button onClick={sendMessageToLLm} className="send-button">
              Send
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
