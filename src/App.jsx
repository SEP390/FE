import {BrowserRouter, Route, Routes} from 'react-router-dom';
import routes from './routes';
import {AuthProvider} from "./providers/AuthProvider.jsx";


function App() {
  return (
      <AuthProvider>
    <BrowserRouter>
      <Routes>
        {routes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={<route.element />}
          />
        ))}
      </Routes>
    </BrowserRouter>
      </AuthProvider>
  );
}

export default App;