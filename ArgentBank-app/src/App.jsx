import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home'; // tu peux créer ce fichier avec l'ancien contenu d'App
import SignIn from './pages/SignIn';
import User from './pages/User'; // tu peux créer ce fichier avec l'ancien contenu d'App

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/user" element={<User />} />
      {/* Ajoute d'autres routes ici si nécessaire */}
    </Routes>
  );
}

export default App;