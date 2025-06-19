import '../assets/styles/main.css';
import argentBankLogo from '../assets/images/argentBankLogo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, setUserProfile, fetchUserProfile, updateUserProfile } from '../redux/slices/userSlice';
import { useEffect, useState } from 'react';

function User() {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');

  const handleLogout = () => {
    dispatch(logout());
    navigate('/sign-in');
  };

  const handleSave = async () => {
    try {
      dispatch(updateUserProfile({ firstName, lastName }));
      dispatch(setUserProfile({ firstName, lastName, email: user.email }));
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setIsEditing(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/sign-in');
      return;
    }

    dispatch(fetchUserProfile())
      .unwrap()
      .then((data) => {
        setFirstName(data.firstName);
        setLastName(data.lastName);
      })
      .catch((err) => {
        console.error('Erreur de récupération du profil :', err);
        navigate('/sign-in');
      });
  }, [dispatch, navigate]);

  if (!user) {
    return <p>Loading...</p>;
  }

  const displayName = `${user.firstName} ${user.lastName}`;

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
          <span>{displayName}</span>
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
            ) : (
              `${user.firstName} ${user.lastName}`
            )}
          </h1>
          {isEditing ? (
            <div className="edit-name">
              <button className="save-button" onClick={handleSave}>
                Save
              </button>
              <button className="cancel-button" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          ) : (
            <button className="edit-button" onClick={() => setIsEditing(true)}>
              Edit Name
            </button>
          )}
        </div>

        <h2 className="sr-only">Accounts</h2>

        {[8349, 6712, 8349].map((id, index) => (
          <section className="account" key={index}>
            <div className="account-content-wrapper">
              <h3 className="account-title">
                Argent Bank {index === 0 ? 'Checking' : index === 1 ? 'Savings' : 'Credit Card'} (x{id})
              </h3>
              <p className="account-amount">
                {index === 0
                  ? '$2,082.79'
                  : index === 1
                  ? '$10,928.42'
                  : '$184.30'}
              </p>
              <p className="account-amount-description">
                {index === 2 ? 'Current Balance' : 'Available Balance'}
              </p>
            </div>
            <div className="account-content-wrapper cta">
              <button className="transaction-button">View transactions</button>
            </div>
          </section>
        ))}
      </main>

      <footer className="footer">
        <p className="footer-text">Copyright 2020 Argent Bank</p>
      </footer>
    </>
  );
}

export default User;