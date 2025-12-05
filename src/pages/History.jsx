import './History.css';

const mockSessions = [
  {
    id: 'session-1',
    date: '2025-01-05',
    from: 'Ethereum',
    to: 'Polygon',
    token: 'USDC',
    amount: '150,000',
    protocol: 'Stargate',
  },
  {
    id: 'session-2',
    date: '2024-12-22',
    from: 'Arbitrum',
    to: 'Base',
    token: 'USDT',
    amount: '75,000',
    protocol: 'Across Protocol',
  },
];

function History() {
  return (
    <section className="history-page">
      <header className="page-heading">
        <p className="eyebrow">Coming soon</p>
        <h1>Recent Sessions</h1>
        <p className="muted">
          A timeline of completed route explorations
        </p>
      </header>

      <div className="section-card history-placeholder">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Origin</th>
              <th>Destination</th>
              <th>Asset</th>
              <th>Amount</th>
              <th>Protocol</th>
            </tr>
          </thead>
          <tbody>
            {mockSessions.map((session) => (
              <tr key={session.id}>
                <td>{session.date}</td>
                <td>{session.from}</td>
                <td>{session.to}</td>
                <td>{session.token}</td>
                <td>{session.amount}</td>
                <td>{session.protocol}</td>
              </tr>
            ))}
            <tr className="future-row">
              <td colSpan={6}>Full transaction history coming soon.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default History;

