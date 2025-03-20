# Innovation Legends

An AI-powered innovation platform for SMEs that helps businesses create and implement innovative strategies through AI coaching, business DNA visualization, and simulation.

## Features

- **Conversational Onboarding**: Create your business profile through a user-friendly, multi-step process
- **Business DNA Visualization**: See your unique business capabilities visualized as an interactive orbital map
- **AI Innovation Coaches**: Choose from specialized coaches with different expertise and approaches
- **Innovation Sandbox**: Engage in split-screen coaching sessions while seeing real-time business simulations
- **Idea Implementation**: Simulate the impact of implementing innovative ideas on your business metrics

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS with custom dark space theme
- **State Management**: React Context API + Hooks
- **Routing**: React Router v6
- **Animation**: Framer Motion
- **Storage**: Local storage (in demo version)

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/innovation-legends.git
   cd innovation-legends
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Application Flow

1. **Onboarding**: 
   - Fill in your business profile details
   - Set challenges and goals
   - Assess innovation readiness

2. **Dashboard**: 
   - Explore your Business DNA visualization
   - Select an innovation coach
   - Access recommended resources

3. **Innovation Sandbox**:
   - Have conversations with your AI coach
   - Receive innovation suggestions
   - Implement ideas and see their impact in the simulation
   - Track business metrics and projections

## Project Structure

```
src/
├── assets/            # Static assets, icons, images
├── components/        # Shared UI components
│   ├── common/        # Basic UI elements  
│   ├── layout/        # Layout components
│   ├── business/      # Business profile components
│   ├── coaches/       # Coach-related components
│   └── sandbox/       # Simulation components
├── context/           # React context for global state
├── hooks/             # Custom React hooks
├── pages/             # Page components
├── services/          # API and service functions
├── styles/            # Global styles and Tailwind config
├── types/             # TypeScript interfaces and types
└── utils/             # Helper functions
```

## Development Notes

### Current Implementation (Demo Version)

This version is a functional prototype that:
- Uses local storage for persistence
- Includes pre-defined mock coaches
- Simulates coach conversations
- Calculates simple business projections

### Future Enhancements

- **Backend Integration**: Connect to a real AI backend for coach conversations
- **User Authentication**: Add user accounts and authentication
- **Advanced Analytics**: More sophisticated business simulations
- **Custom Coach Creation**: Allow businesses to create specialized coaches
- **Collaboration Features**: Enable team collaboration on innovation projects

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- This project was created as a prototype for demonstrating the potential of AI-powered innovation coaching
