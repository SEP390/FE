import {BrowserRouter, Route, Routes} from 'react-router-dom';
import routes from './routes';
import {AuthProvider} from "./providers/AuthProvider.jsx";
import {App as AntDesignApp, ConfigProvider} from 'antd';

function App() {
    return (
        <ConfigProvider>
            <AntDesignApp>
                <AuthProvider>
                    <BrowserRouter>
                        <Routes>
                            {routes.map((route, index) => (
                                <Route
                                    key={index}
                                    path={route.path}
                                    element={<route.element/>}
                                />
                            ))}
                        </Routes>
                    </BrowserRouter>
                </AuthProvider>
            </AntDesignApp>
        </ConfigProvider>
    );
}

export default App;