export default function Header({ title }) {
  return (
    <header>
      <h1>{title}</h1>
      <style jsx>{`
        header {
          text-align: center;
          padding: 2.5rem 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        h1 {
          color: white;
          font-size: 2.75rem;
          margin: 0;
          font-weight: 700;
          text-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        @media (max-width: 768px) {
          h1 {
            font-size: 2rem;
          }
          header {
            padding: 2rem 1rem;
          }
        }
      `}</style>
    </header>
  );
}
