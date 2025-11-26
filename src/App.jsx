import {BrowserRouter, Route, Routes} from 'react-router-dom';
import routes from './routes';
import {AuthProvider} from "./providers/AuthProvider.jsx";
import {App as AntDesignApp, ConfigProvider} from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import vi_VN from 'antd/lib/locale/vi_VN'
const queryClient = new QueryClient()
function App() {
    return (
        <QueryClientProvider client={queryClient}>
        <ConfigProvider locale={vi_VN}>
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
        </QueryClientProvider>
    );
}

export default App;