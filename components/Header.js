export default function Header({ title }) {
  return (
    <header>
      <h1>{title}</h1>
      <style jsx>{`
        header {
          text-align: center;
          padding: 2rem 0;
        }
        h1 {
          color: #0070f3;
          font-size: 2.5rem;
          margin: 0;
        }
      `}</style>
    </header>
  );
}
