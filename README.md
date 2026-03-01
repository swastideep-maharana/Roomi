# Roomi – AI-Powered Architectural Visualizer

**Roomi** is a production-ready architectural visualization platform that transforms 2D floor plans into photorealistic 3D renders in seconds. Built on the **Puter.js** ecosystem, it leverages state-of-the-art AI and a serverless architecture to provide a seamless design-to-visualization workflow.


## ✨ Features

- **AI 3D Rendering**: Convert flat 2D blueprints into detailed top-down 3D architectural visualizations using `gemini-2.5-flash-image-preview`.
- **Interactive Comparison Slider**: A high-performance side-by-side comparison tool (built with `clip-path`) to visualize the transformation from plan to paper.
- **Persistence Layer**: Automatic project saving to Puter KV store via high-performance Puter Workers.
- **Image Hosting**: Integrated asset management using Puter Hosting for both original floor plans and AI renders.
- **Project Management**: 
  - **Dashboard**: View and sort project history by date.
  - **Social Sharing**: Toggle project visibility (Public/Private) and one-click link sharing.
  - **Export**: Download renders as high-quality PNGs.
- **Puter Auth**: Secure, passwordless authentication integrated directly into the design flow.

## 🚀 Tech Stack

- **Frontend**: [React Router 7](https://reactrouter.com/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend / AI**: [Puter.js](https://puter.com/)
  - **AI Engine**: Puter AI (Gemini integration)
  - **Data Privacy**: Puter KV Store
  - **Serverless**: Puter Workers (Router-based backend)
  - **Asset storage**: Puter Hosting & File System
- **Icons**: [Lucide React](https://lucide.dev/)

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+)
- A [Puter.com](https://puter.com/) account (for worker deployment and API access)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/swastideep-maharana/roomify.git
   cd roomify
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables. Create a `.env.local` file:
   ```env
   VITE_PUTER_WORKER_URL=https://your-worker-subdomain.puter.site
   ```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## 📂 Project Structure

- `app/routes/`: Page definitions (Home, Visualizer).
- `app/components/`: Reusable UI elements (ComparisonSlider, Navbar, Upload).
- `lib/`: Core service logic.
  - `ai.action.ts`: Handles communication with Puter AI.
  - `puter.action.ts`: Frontend wrappers for project CRUD operations.
  - `puter.worker.js`: The serverless backend running on Puter.
  - `puter.hosting.ts`: Automated image hosting logic.
- `type.d.ts`: Centralized TypeScript definitions.

## 🎨 Design Philosophy

Roomi focuses on **Rich Aesthetics** and **Dynamic Interaction**.
- **Glassmorphism**: UI elements use subtle blurs and overlays.
- **Neo-Brutalism**: High-contrast shadows and clean borders for a premium feel.
- **Micro-animations**: Smooth transitions for loading states and slider interactions.

## 📄 License

Built with ❤️ for the future of architectural design. For more information, visit [Roomify](https://github.com/swastideep-maharana/roomify).
