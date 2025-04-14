import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Login from "./pages/Login.jsx"
import Register from './pages/Register.jsx';
import Home from './pages/Home.jsx';
import ChatLayout from './Components/ChatLayout.jsx';
import ChatsPage from './Components/Chats/Page.jsx';
import ChatConversation from './Components/ChatConversation.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={ <Home /> } />
        <Route path="/login" element={ <Login /> } />
        <Route path="/register" element={ <Register /> } />

        <Route path="/chats" element={<ChatLayout />}>
          <Route index element={<ChatsPage />} />
          <Route path=":id" element={<ChatConversation />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
