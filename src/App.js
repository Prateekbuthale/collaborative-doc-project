import Login from "./components/auth/login";
import Register from "./components/auth/register";
import EditDocs from "./components/home/EditDocs";
import './App.css';
import Header from "./components/header";
import Home from "./components/home";

import { AuthProvider } from "./contexts/authContext";
import { useRoutes } from "react-router-dom";
import { patch } from "@mui/material";

function App() {
  // Mocking the database for demonstration; replace with actual database logic
  const database = {}; // Assume your database is defined here

  const routesArray = [
    {
      path: "*",
      element: <Login />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/home",
      element: <Home />,
    },
    {
      path: "/editDocs/:id",
      element: <EditDocs database={database} />,  // Add the EditDocs route with the :id param
    },
  ];

  let routesElement = useRoutes(routesArray);
  
  return (
    <AuthProvider>
      <Header />
      <div className="w-full h-screen flex flex-col">{routesElement}</div>
    </AuthProvider>
  );
}

export default App;
