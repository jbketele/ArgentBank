import '../assets/styles/main.css';
import argentBankLogo from '../assets/images/argentBankLogo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { login, logout } from '../redux/slices/userSlice';
import { useEffect, useState } from 'react'; // Import useState

function User() {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false); // État pour le mode édition
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    navigate('/sign-in');
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/v1/user/profile', {
        method: 'POST', // Garder la méthode POST
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ firstName, lastName }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user profile');
      }

      const data = await response.json();
      dispatch(login({ firstName: data.body.firstName, lastName: data.body.lastName, email: user.email }));
      setIsEditing(false); // Quitter le mode édition
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    // Réinitialiser les champs et quitter le mode édition
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setIsEditing(false);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/sign-in');
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/api/v1/user/profile', {
          method: 'POST', // Garder la méthode POST pour récupérer les données
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const data = await response.json();
        console.log('User Profile Data:', data);

        dispatch(login({
          firstName: data.body.firstName,
          lastName: data.body.lastName,
          email: data.body.email,
        }));

        // Initialiser les champs avec les données récupérées
        setFirstName(data.body.firstName);
        setLastName(data.body.lastName);

      } catch (err) {
        console.error(err);
        navigate('/sign-in');
      }
    };

    fetchUserProfile();
  }, [dispatch, navigate]);

  return (
    <>
      <nav className="main-nav">
        <Link className="main-nav-logo" to="/">
          <img
            className="main-nav-logo-image"
            src={argentBankLogo}
            alt="Argent Bank Logo"
          />
          <h1 className="sr-only">Argent Bank</h1>
        </Link>
        <div className="main-nav-item">
          <i className="fa fa-user-circle"></i>
          <span>{user?.firstName || 'Guest'}</span>
          <i className="fa fa-sign-out"></i>
          <button onClick={handleLogout}>Sign Out</button>
        </div>
      </nav>

      <main className={`main ${isEditing ? 'bg-edit' : 'bg-dark'}`}>
        <div className="header">
          <h1>
            Welcome back
            <br />
            {isEditing ? (
              <>
              <div className="edit-name">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                />
              </div>
              </>
            ) : (
              <>
                {user?.firstName || 'Guest'} {user?.lastName || ''}
              </>
            )}
          </h1>
          {isEditing ? (
            <>
              <div className="edit-name">
              <button className="save-button" onClick={handleSave}>
                Save
              </button>
              <button className="cancel-button" onClick={handleCancel}>
                Cancel
              </button>
              </div>
            </>
          ) : (
            <button className="edit-button" onClick={() => setIsEditing(true)}>
              Edit Name
            </button>
          )}
        </div>

        <h2 className="sr-only">Accounts</h2>

        {/* COMPTE CHECKING */}
        <section className="account">
          <div className="account-content-wrapper">
            <h3 className="account-title">Argent Bank Checking (x8349)</h3>
            <p className="account-amount">$2,082.79</p>
            <p className="account-amount-description">Available Balance</p>
          </div>
          <div className="account-content-wrapper cta">
            <button className="transaction-button">View transactions</button>
          </div>
        </section>

        {/* COMPTE SAVINGS */}
        <section className="account">
          <div className="account-content-wrapper">
            <h3 className="account-title">Argent Bank Savings (x6712)</h3>
            <p className="account-amount">$10,928.42</p>
            <p className="account-amount-description">Available Balance</p>
          </div>
          <div className="account-content-wrapper cta">
            <button className="transaction-button">View transactions</button>
          </div>
        </section>

        {/* COMPTE CREDIT CARD */}
        <section className="account">
          <div className="account-content-wrapper">
            <h3 className="account-title">Argent Bank Credit Card (x8349)</h3>
            <p className="account-amount">$184.30</p>
            <p className="account-amount-description">Current Balance</p>
          </div>
          <div className="account-content-wrapper cta">
            <button className="transaction-button">View transactions</button>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p className="footer-text">Copyright 2020 Argent Bank</p>
      </footer>
    </>
  );
}

export default User;