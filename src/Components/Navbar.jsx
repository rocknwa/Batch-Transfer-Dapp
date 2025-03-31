import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ onFaucetClick, showFaucet }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <nav className="w-full bg-black border-b border-gray-700 mb-8">
      <div className="w-full max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 
          onClick={() => navigate('/')} 
          className="text-2xl font-bold text-yellow-400 font-['Source_Sans_Pro'] cursor-pointer"
        >
          Token Multisender
        </h1>
        <div className="flex gap-4">
          {showFaucet && (
            <button
              onClick={onFaucetClick}
              className="px-5 py-2.5 bg-transparent text-yellow-400 border-2 border-yellow-400 rounded-lg hover:bg-yellow-400 hover:text-black transition-all duration-300 shadow-lg hover:shadow-yellow-400/30"
            >
              Faucet
            </button>
          )}
          {isHomePage && (
            <button
              onClick={() => navigate('/app')}
              className="px-5 py-2.5 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-all duration-300"
            >
              Launch App
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  onFaucetClick: PropTypes.func,
  showFaucet: PropTypes.bool
};

Navbar.defaultProps = {
  onFaucetClick: () => {},
  showFaucet: false
};

export default Navbar;
