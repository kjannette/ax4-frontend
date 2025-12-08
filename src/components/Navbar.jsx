import { NavLink } from 'react-router-dom';
import './Navbar.css';

const links = [
  { to: '/', label: 'Route Finder' },
  { to: '/history', label: 'History' },
  { to: '/login', label: 'Login' },
];

function Navbar() {
  return (
    <header className="nav-shell">
      <div className="nav-brand">
        <span className="nav-logo">Chirper</span>
        <span className="nav-subtitle">
          Bridge Finder By{' '}
          <a href="https://www.sjdev.co" target="_blank" rel="noopener">
            sjDev.co
          </a>
    
          <a href="https://sjdev.co/blockchain" target="_blank" rel="noopener">
            {`${' '}Blockchain Engineers`}
          </a>
          : Cryptophunk Travelers
        </span>
      </div>

      <nav className="nav-links">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              isActive ? 'nav-link nav-link-active' : 'nav-link'
            }
            end={link.to === '/'}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export default Navbar;

