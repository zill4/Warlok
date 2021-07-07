import React from 'react'
import './App.css';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"
import { AuthProvider } from "../context/authcontext"
import PrivateRoute from "./privateRoute"
// Pages
import Landing from './pages/landing'
import Login from './pages/login'
import SignUp from './pages/signUp'
import ForgotPassword from './pages/forgotPassword'
import About from './pages/about'
import Contact from './pages/contact'
import Profile from './pages/profile'
import Feed from './pages/feed'
import Inbox from './pages/inbox'
import Settings from './pages/settings'
import PublicProfile from './pages/publicProfile'
// Components
import Navbar from './navbar'

function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <Route path="/" component={Navbar} />
        <Switch>
          <PrivateRoute path="/profile" component={Profile} />
          <PrivateRoute path="/feed" component={Feed} />
          <PrivateRoute path="/inbox" component={Inbox} />
          <PrivateRoute path="/settings" component={Settings} />
          <Route exact path="/" component={Landing} />
          <Route exact path="/p/:profile" component={PublicProfile} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={SignUp} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
        </Switch>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
