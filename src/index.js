import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { LoadingProvider } from './context/LoadingContext';

// Импорт страниц
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Feedback from './pages/Feedback';
import Contact from './pages/Contact';

// Delay helper для loader, чтобы spinner показывался при переходах
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Создаём роутер с future флагами для устранения предупреждений
const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      children: [
        { index: true, element: <Home />, loader: async () => { await delay(300); return null; } },
        { path: "about", element: <About />, loader: async () => { await delay(300); return null; } },
        { path: "projects", element: <Projects />, loader: async () => { await delay(300); return null; } },
        { path: "projects/:id", element: <ProjectDetail />, loader: async () => { await delay(300); return null; } },
        { path: "feedback", element: <Feedback />, loader: async () => { await delay(300); return null; } },
        { path: "contact", element: <Contact />, loader: async () => { await delay(300); return null; } }
      ]
    }
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <LoadingProvider>
      <RouterProvider router={router} />
    </LoadingProvider>
  </React.StrictMode>
); 