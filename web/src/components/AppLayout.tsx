import { NavLink, Outlet } from 'react-router-dom';

export function AppLayout() {
  return (
    <>
      <header className="nav">
        <strong>Tiny Inventory</strong>
        <NavLink
          to="/stores"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          Stores
        </NavLink>
        <NavLink
          to="/products"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          Products
        </NavLink>
      </header>
      <Outlet />
    </>
  );
}
