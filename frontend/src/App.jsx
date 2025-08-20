// App.js
import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/landingPage/Landing.jsx";
import Auth from './pages/auth/Auth.jsx';
import VideoMeet from './pages/videoMeet/VideoMeet.jsx';
import Home from "./pages/Home.jsx";

function App() {
  return (
      <Router>
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path='/auth' element={<Auth />} />
          <Route path='/home' element={<Home/>}/>
          <Route path='/room/:id' element={<VideoMeet/>}/>
        </Routes>
      </Router>
  );
}

export default App;
