import { createRoot } from "react-dom/client";
import { initializePerformanceOptimizations } from "@/utils/performanceOptimization";
import App from "./App";
import "./index.css";

// Initialize performance optimizations
initializePerformanceOptimizations();

createRoot(document.getElementById("root")!).render(<App />);
