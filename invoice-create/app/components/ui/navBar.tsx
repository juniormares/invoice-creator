import { Link, useNavigate } from "react-router"

export function NavBar() {
  const navigate = useNavigate();

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Home button clicked, navigating to /");
    navigate("/");
  };

  return (
    <div className="navbar">
      <div className="navbar-container">
        <nav className="navbar-nav">
          <button 
            onClick={handleHomeClick}
            className="navbar-link navbar-link--active"
          >
            Home
          </button>
          <Link 
            to="/invoice" 
            className="navbar-link navbar-link--inactive"
          >
            Invoices
          </Link>
          <Link
            to="/customer"
            className="navbar-link navbar-link--inactive"
          >
            Customers
          </Link>
          <Link
            to="/product"
            className="navbar-link navbar-link--inactive"
          >
            Products
          </Link>
        </nav>
      </div>
    </div>
  );
}