import React from "react";

import "./App.css";
import { CategoryProvider } from "./context/CategoryContext";
import { AdminPage } from "./pages/AdminPage";

function App() {
  return (
    <div className="App">
      <CategoryProvider>
        <AdminPage />
      </CategoryProvider>
    </div>
  );
}

export default App;
