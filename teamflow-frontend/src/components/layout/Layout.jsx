import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div className="min-h-screen bg-light">
            {/* Sidebar fixe */}
            <Sidebar />

            {/* Zone de contenu principale */}
            <div className="ml-64 min-h-screen">
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
