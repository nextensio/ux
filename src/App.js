import React from 'react';
import { BrowserRouter as HashRouter } from 'react-router-dom';
import AppSecure from './AppSecure';

const loading = (
    <div className="pt-3 text-center">
        <div className="sk-spinner sk-spinner-pulse"></div>
    </div>
)

const App = () => (
    <HashRouter>
        <React.Suspense fallback={loading}>
            <AppSecure />
        </React.Suspense>
    </HashRouter >
);
export default App;