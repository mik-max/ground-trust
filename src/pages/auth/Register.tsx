import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-page)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--brand-primary)', letterSpacing: '-0.5px' }}>
              RaffleTrust
            </span>
          </Link>
          <p style={{ marginTop: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Create your account
          </p>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '32px',
        }}>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            marginBottom: '24px',
            textAlign: 'center',
          }}>
            What best describes you?
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link to="/register/participant" style={{ textDecoration: 'none' }}>
              <div style={{
                border: '1px solid var(--border-default)',
                borderRadius: '10px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease',
              }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--brand-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
              >
                <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  I'm a participant
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  I want to browse and enter giveaways
                </div>
              </div>
            </Link>

            <Link to="/register/business" style={{ textDecoration: 'none' }}>
              <div style={{
                border: '1px solid var(--border-default)',
                borderRadius: '10px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease',
              }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--brand-accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
              >
                <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  I'm a business / organiser
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  I want to create and run giveaways
                </div>
              </div>
            </Link>
          </div>

          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)', marginTop: '24px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
