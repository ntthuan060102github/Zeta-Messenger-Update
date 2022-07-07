import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom"

import Login from "./pages/login/Login"
import Register from "./pages/register/Register"
import Messenger from "./pages/messenger/Messenger"
import Call from "./pages/call/Call"

function App() {
  const user = localStorage.getItem("user_id")
  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Messenger/> : <Navigate to="/login"/>}/>
        <Route path="/messenger" element={user ? <Messenger/> : <Navigate to="/login"/>}/>
        <Route path="/login" element={user ? <Navigate to="/"/> : <Login/>}/>
        <Route path="/register" element={user ? <Navigate to="/"/> : <Register/>}/>
        <Route path="/calling" element={<Call/>}/>
      </Routes>
    </Router>
  );
}

export default App;
