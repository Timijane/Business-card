/* AI chat frontend
 - Works offline with canned responses
 - If you later deploy a secure serverless endpoint that proxies to OpenAI, set `OPENAI_ENDPOINT`
   to that endpoint (e.g., https://yourworker.example.com/api/openai) and the UI will call it.
 - IMPORTANT: Do NOT put your OpenAI API key in the browser. Host it in a serverless function.
*/

const chatIcon = document.getElementById('chat-icon');
const chatBox = document.getElementById('chat-box');
const closeChat = document.getElementById('close-chat');
const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const chatBody = document.getElementById('chat-body');

// If you deploy a serverless function, paste its URL here
// Example: const OPENAI_ENDPOINT = "https://<your-worker>.workers.dev/api/openai";
const OPENAI_ENDPOINT = ""; // <-- leave blank for now; add later

chatIcon.addEventListener('click', () => {
  chatBox.classList.toggle('hidden');
});

closeChat.addEventListener('click', () => chatBox.classList.add('hidden'));

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

function appendMessage(who, text) {
  const el = document.createElement('div');
  el.className = who === 'user' ? 'user-message' : 'bot-message';
  el.textContent = text;
  chatBody.appendChild(el);
  chatBody.scrollTop = chatBody.scrollHeight;
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;
  appendMessage('user', text);
  userInput.value = '';

  // If an endpoint is configured, try to call it (serverless proxy to OpenAI)
  if (OPENAI_ENDPOINT) {
    appendMessage('bot', 'Thinking...'); // placeholder
    try {
      const resEl = chatBody.querySelector('.bot-message:last-child');
      const resp = await fetch(OPENAI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text })
      });
      if (!resp.ok) throw new Error('Server error');
      const data = await resp.json();
      // expecting { reply: "..." }
      resEl.textContent = data.reply || "Sorry — I couldn't compose a reply.";
    } catch (err) {
      appendMessage('bot', "Sorry, I couldn't reach the AI service. I'll still try to help below.");
      appendMessage('bot', cannedReply(text));
    }
  } else {
    // fallback: use client-side canned logic
    appendMessage('bot', cannedReply(text));
  }
}

function cannedReply(input) {
  input = input.toLowerCase();
  if (/hello|hi|hey/.test(input)) return "Hello! Triangle Tech builds websites, maintains systems, and integrates AI. How can I help?";
  if (/service|offer|do you|what do/.test(input)) return "We offer web development, maintenance, AI integration, and tech strategy to help your business scale.";
  if (/project|portfolio|work/.test(input)) return "See our Projects page to view detailed case studies of past work.";
  if (/contact|hire|quote|pricing/.test(input)) return "You can reach us via the Contact page — we'll reply with a tailored estimate.";
  if (/ai|openai|chatgpt/.test(input)) return "We can integrate advanced AI into your website. To enable live AI, we connect to OpenAI through a secure serverless proxy.";
  return "I'm here to help with technology strategy, website builds, and AI integration. Try asking about services, projects, or a technology audit.";
}
