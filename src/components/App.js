import React from 'react'
import './App.css';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"
// Pages
import Landing from './pages/landing'
import Login from './pages/login'
import SignUp from './pages/signUp'
import ForgotPassword from './pages/forgotPassword'
import About from './pages/about'

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/" component={Landing} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={SignUp} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/about" component={About} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
