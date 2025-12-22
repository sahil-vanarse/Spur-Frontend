# Spur AI Chat Agent - Frontend

**Video Demo:**

https://github.com/user-attachments/assets/6e994310-de8f-4503-bd2b-acd5bbff6efa



**Live Demo:** [https://spur-frontend-zrde.onrender.com/](https://spur-frontend-zrde.onrender.com/)

Modern, responsive chat interface for the AI-powered customer support agent. Built with SvelteKit, TypeScript, and Vite.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Backend server running (see `../backend/README.md`)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env`:
   - `VITE_API_URL`: Backend API URL (default: `http://localhost:3001`)

3. **Start the development server**
   ```bash
   npm run dev
   ```
   
   App will start on `http://localhost:5173`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── lib/
│   │   ├── api.ts              # API client for backend communication
│   │   └── index.ts            # Library exports
│   ├── routes/
│   │   ├── +page.svelte        # Main chat interface
│   │   └── +layout.svelte      # App layout
│   ├── app.css                 # Global styles
│   └── app.html                # HTML template
├── static/                     # Static assets
├── .env                        # Environment variables (not in git)
├── .env.example                # Environment variables template
├── package.json                # Dependencies and scripts
├── svelte.config.js            # SvelteKit configuration
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite configuration
```

## ✨ Features

### Core Features
- **Real-time Chat**: Send messages and receive AI responses instantly
- **Conversation Persistence**: Messages saved to database and restored on reload
- **Multi-Provider Support**: Switch between OpenAI and Groq LLM providers
- **Markdown Rendering**: AI responses formatted with bold, links, lists, etc.
- **Auto-scroll**: Automatically scrolls to latest message
- **Loading States**: Visual feedback while waiting for responses
- **Error Handling**: User-friendly error messages

### UI Features
- **Provider Selection**: Dropdown to choose between Groq and OpenAI
- **New Chat**: Start a fresh conversation
- **Clear Chat**: Delete all messages in current conversation
- **Typing Indicator**: Shows when AI is generating response
- **Disabled States**: Send button disabled while loading
- **Responsive Design**: Works on desktop and mobile
- **Clean Interface**: Modern, professional design

## 🎨 User Interface

### Chat Components
1. **Header**
   - Title: "Spur Support"
   - Provider selector (Groq/OpenAI)
   - New Chat button (+ icon)
   - Clear Chat button (trash icon)

2. **Message Area**
   - Scrollable message list
   - User messages (right-aligned, blue)
   - AI messages (left-aligned, white with border)
   - Markdown formatting in AI responses

3. **Input Area**
   - Text input field
   - Send button
   - Enter key to send
   - Disabled while loading

4. **Status Indicators**
   - "Agent is typing..." indicator
   - Loading state on send button

## 🔌 API Integration

### API Client (`src/lib/api.ts`)

```typescript
// Send a message
const response = await sendMessage(message, sessionId, provider);
// Returns: { reply: string, sessionId: string, provider: string }

// Get conversation history
const history = await getHistory(sessionId);
// Returns: { messages: Message[] }

// Clear conversation
await clearConversation(sessionId);
// Returns: { success: boolean, message: string }
```

### Message Type
```typescript
interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}
```

## 🎯 State Management

### Local State (Svelte Stores)
- `messages`: Array of chat messages
- `userInput`: Current input field value
- `isLoading`: Loading state for API calls
- `isTyping`: AI typing indicator
- `sessionId`: Current conversation ID
- `selectedProvider`: Current LLM provider

### LocalStorage Persistence
- `chat_session_id`: Persisted session ID
- `llm_provider`: Persisted provider preference

## 🎨 Styling

### Design System
- **Font**: Inter (Google Fonts)
- **Primary Color**: `#5d5dff` (purple-blue)
- **Background**: `#f8fafc` (light gray)
- **Text**: `#1e293b` (dark gray)
- **Border**: `#e2e8f0` (light gray)

### Responsive Design
- Max width: 450px
- Height: 600px
- Centered on screen
- Mobile-friendly

### Markdown Styles
- **Links**: Underlined, colored (primary for AI, white for user)
- **Lists**: Proper bullets and spacing
- **Bold**: Font weight 600
- **Italic**: Font style italic
- **Line breaks**: Proper spacing

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run check` - Run Svelte type checking
- `npm run lint` - Run ESLint (if configured)

### Development Workflow
1. Make changes to `.svelte` files
2. Hot reload updates automatically
3. Check browser console for errors
4. Test in different browsers

## 🚢 Deployment

### Build for Production
```bash
npm run build
```

This creates a production-optimized build in the `build/` directory.

### Environment Variables
Set `VITE_API_URL` to your deployed backend URL:
```bash
VITE_API_URL=https://your-backend.onrender.com
```

### Recommended Platforms
- **Render**: Best for Node.js adapter (configured default)
- **Vercel**: Requires creating a `vercel.json` or switching to `adapter-vercel`
- **Netlify**: Requires `adapter-netlify`

### Deployment Steps (Example: Render)
1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `npm install && npm run build`
4. Set start command: `node build`
5. Add environment variable: `VITE_API_URL`
6. Deploy!

## 🔧 Configuration

### SvelteKit Adapter
Currently using `@sveltejs/adapter-node` for robust deployment on Render.

For other platforms, you may need to switch adapters:
- Vercel: `@sveltejs/adapter-vercel`
- Netlify: `@sveltejs/adapter-netlify`
- Static: `@sveltejs/adapter-static`
- Auto-detect: `@sveltejs/adapter-auto`

### CORS Configuration
If you get CORS errors:
1. Check backend CORS settings
2. Ensure `VITE_API_URL` matches backend URL
3. Backend should allow your frontend origin

## 🐛 Troubleshooting

### "Failed to fetch" Error
- Backend server not running
- Wrong `VITE_API_URL` in `.env`
- CORS not configured on backend
- Network connectivity issue

### Messages Not Persisting
- Check browser console for API errors
- Verify backend database is working
- Check `sessionId` is being saved to localStorage

### Markdown Not Rendering
- Check browser console for errors
- Verify `renderMarkdown()` function is working
- Ensure `{@html}` directive is used for AI messages

### Provider Selection Not Working
- Check localStorage for `llm_provider` key
- Verify backend supports the selected provider
- Check API key is configured in backend

## 📝 Architecture Notes

### Component Structure
- **Single Page App**: All logic in `+page.svelte`
- **API Layer**: Separated in `src/lib/api.ts`
- **Styling**: Global styles in `app.css`

### Why This Structure?
- Simple and easy to understand
- All chat logic in one place
- API calls abstracted for reusability
- Easy to extend with new features

### Markdown Rendering
Custom `renderMarkdown()` function converts:
- `**bold**` → `<strong>bold</strong>`
- `*italic*` → `<em>italic</em>`
- `[text](url)` → `<a href="url">text</a>`
- `* item` → `<li>item</li>` (wrapped in `<ul>`)
- `\n` → `<br>`

Uses Svelte's `{@html}` directive for safe rendering.

## 🎯 Trade-offs & Future Improvements

### Current Trade-offs
- **No authentication**: Anyone can access the chat
- **Client-side session**: Session ID in localStorage (could be in cookie)
- **No message pagination**: All messages loaded at once
- **Simple markdown**: Custom parser instead of library



## 👤 Author

### Sahil Vanarse
