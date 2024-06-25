import { Navigation } from "./components/Navigation";
import "./App.css";
import { Outlet } from "react-router";
import { Footer } from "./components/Footer";

export function App() {
  return (
    <div>
      <Navigation />
      <Outlet />
      <Footer />
    </div>
  );
}
