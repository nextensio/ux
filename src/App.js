import React, { Component } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import './scss/style.scss';

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
)

// Containers
const HomeLayout = React.lazy(() => import('./containers/home/TheLayout'));
const TenantLayout = React.lazy(() => import('./containers/tenant/TheLayout'));

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'));


class App extends Component {

  render() {
    return (
      <HashRouter>
        <React.Suspense fallback={loading}>
          <Switch>
            <Route path="/login" name="Login Page" render={props => <Login {...props} />} />
            <Route path="/tenant/:id" name="Tenant" render={props => <TenantLayout {...props} />} />
            <Route path="/home" name="Home" render={props => <HomeLayout {...props} />} />
            <Route exact path="/" name="Login Page" render={props => <Login {...props} />} />
          </Switch>
        </React.Suspense>
      </HashRouter>
    );
  }
}

export default App;
