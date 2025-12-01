import { useEffect, useMemo, useState } from 'react';
import { useFindRoutes } from '../api';
import './RouteFinder.css';

const CHAIN_OPTIONS = [
  { id: '1', label: 'Ethereum' },
  { id: '137', label: 'Polygon' },
  { id: '42161', label: 'Arbitrum' },
  { id: '10', label: 'Optimism' },
  { id: '8453', label: 'Base' },
];

const TOKENS = [
  {
    symbol: 'USDC',
    decimals: 6,
    addresses: {
      1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      10: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
      137: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    },
  },
  {
    symbol: 'USDT',
    decimals: 6,
    addresses: {
      1: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      137: '0xC2132D05D31c914a87C6611C10748AEb04B58e8F',
      42161: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
    },
  },
  {
    symbol: 'DAI',
    decimals: 18,
    addresses: {
      1: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      137: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      42161: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
    },
  },
];

const PREF_KEY = 'hydra-bridge-preferences';
const STABLE_DECIMALS = 6;

const loadPreferences = () => {
  try {
    const stored = localStorage.getItem(PREF_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const toBaseUnits = (value, decimals = STABLE_DECIMALS) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return '0';
  const factor = 10 ** decimals;
  return Math.round(numeric * factor).toString();
};

const formatUnits = (value, decimals = 6) => {
  if (!value) return '0';
  try {
    const big = BigInt(value);
    const divisor = BigInt(10) ** BigInt(decimals);
    const whole = big / divisor;
    const fraction = big % divisor;
    const fractionStr = fraction.toString().padStart(decimals, '0').slice(0, 2);
    return `${whole.toString()}.${fractionStr}`;
  } catch {
    return value;
  }
};

function RouteFinder() {
  const [form, setForm] = useState({
    tokenSymbol: 'USDC',
    amount: '100',
    fromChain: '1',
    toChain: '137',
    slippage: '0.5',
    gasPreference: 'auto',
    fromAddress: '',
    toAddress: '',
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [preferences, setPreferences] = useState(() => loadPreferences());
  const [prefMessage, setPrefMessage] = useState('');

  // React Query mutation for finding routes
  const findRoutes = useFindRoutes();

  const selectedToken = useMemo(
    () => TOKENS.find((token) => token.symbol === form.tokenSymbol),
    [form.tokenSymbol],
  );

  useEffect(() => {
    if (preferences.tokenSymbol) {
      setForm((prev) => ({
        ...prev,
        tokenSymbol: preferences.tokenSymbol ?? prev.tokenSymbol,
        fromChain: preferences.fromChain ?? prev.fromChain,
        toChain: preferences.toChain ?? prev.toChain,
      }));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwap = () => {
    setForm((prev) => ({
      ...prev,
      fromChain: prev.toChain,
      toChain: prev.fromChain,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const tokenAddress = selectedToken?.addresses?.[form.fromChain];
    if (!tokenAddress) {
      return;
    }

    findRoutes.mutate({
      fromChain: form.fromChain,
      toChain: form.toChain,
      token: tokenAddress,
      amount: toBaseUnits(form.amount, selectedToken?.decimals),
      fromAddress: form.fromAddress || undefined,
      toAddress: form.toAddress || undefined,
    });
  };

  const handleSaveDefaults = () => {
    const next = {
      tokenSymbol: form.tokenSymbol,
      fromChain: form.fromChain,
      toChain: form.toChain,
    };
    localStorage.setItem(PREF_KEY, JSON.stringify(next));
    setPreferences(next);
    setPrefMessage('Default preferences saved');
    setTimeout(() => setPrefMessage(''), 2500);
  };

  const applyDefaults = () => {
    if (!preferences.tokenSymbol) return;
    setForm((prev) => ({
      ...prev,
      ...preferences,
    }));
  };

  // Get routes from mutation result
  const routes = findRoutes.data?.routes || [];
  const isLoading = findRoutes.isPending;
  const error = findRoutes.error?.message || 
    (!selectedToken?.addresses?.[form.fromChain] ? 'This token is not supported on the selected origin chain.' : '');

  return (
    <section className="route-finder">
      <header className="page-heading">
        <p className="muted">
          Compare bridge protocols in real time, customize execution parameters, and prep
          the best path for your stablecoin transfer.
        </p>
      </header>

      <div className="grid-two">
        <form className="section-card route-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="tokenSymbol">Stablecoin</label>
            <select
              id="tokenSymbol"
              name="tokenSymbol"
              value={form.tokenSymbol}
              onChange={handleChange}
            >
              {TOKENS.map((token) => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label htmlFor="amount">Amount</label>
            <div className="input-with-buttons">
              <input
                id="amount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={handleChange}
                required
              />
              <div className="quick-amounts">
                {[25, 50, 100, 500].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, amount: String(val) }))}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-inline">
            <div className="form-row">
              <label htmlFor="fromChain">From chain</label>
              <select
                id="fromChain"
                name="fromChain"
                value={form.fromChain}
                onChange={handleChange}
              >
                {CHAIN_OPTIONS.map((chain) => (
                  <option key={chain.id} value={chain.id}>
                    {chain.label}
                  </option>
                ))}
              </select>
            </div>

            <button type="button" className="swap-button" onClick={handleSwap}>
              ⇄
            </button>

            <div className="form-row">
              <label htmlFor="toChain">To chain</label>
              <select
                id="toChain"
                name="toChain"
                value={form.toChain}
                onChange={handleChange}
              >
                {CHAIN_OPTIONS.map((chain) => (
                  <option key={chain.id} value={chain.id}>
                    {chain.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="gasPreference">Gas preference</label>
            <select
              id="gasPreference"
              name="gasPreference"
              value={form.gasPreference}
              onChange={handleChange}
            >
              <option value="auto">Auto</option>
              <option value="eco">Eco (cheap)</option>
              <option value="fast">Fast (priority)</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="primary" disabled={isLoading}>
              {isLoading ? 'Searching routes…' : 'Find best routes'}
            </button>
            <button
              type="button"
              className="ghost"
              onClick={() => setShowAdvanced((prev) => !prev)}
            >
              {showAdvanced ? 'Hide advanced' : 'Advanced settings'}
            </button>
          </div>

          {showAdvanced && (
            <div className="advanced-panel">
              <div className="form-row">
                <label htmlFor="slippage">Slippage tolerance (%)</label>
                <input
                  id="slippage"
                  name="slippage"
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.slippage}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <label htmlFor="fromAddress">From address (optional)</label>
                <input
                  id="fromAddress"
                  name="fromAddress"
                  placeholder="0x..."
                  value={form.fromAddress}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <label htmlFor="toAddress">Destination address (optional)</label>
                <input
                  id="toAddress"
                  name="toAddress"
                  placeholder="0x..."
                  value={form.toAddress}
                  onChange={handleChange}
                />
              </div>

              <div className="preferences-panel">
                <div>
                  <p className="muted">Onboarding defaults</p>
                  <small>Save your go-to chain/token combo for quick liquidity planning.</small>
                </div>
                <div className="pref-actions">
                  <button type="button" className="ghost" onClick={applyDefaults}>
                    Apply defaults
                  </button>
                  <button type="button" className="ghost" onClick={handleSaveDefaults}>
                    Save current
                  </button>
                </div>
                {prefMessage && <p className="status success">{prefMessage}</p>}
              </div>
            </div>
          )}

          {error && <p className="status error">{error}</p>}
        </form>

        <section className="section-card results-panel">
          <header className="results-header">
            <h2>Best options</h2>
            <p className="muted">
              Sorted by our scoring model (fees, speed, and final output). Gas cost uses your
              selected preference.
            </p>
          </header>

          {!routes.length && !isLoading && (
            <div className="empty-state">
              <p>Run a search to see available bridge routes.</p>
            </div>
          )}

          {isLoading && (
            <div className="empty-state">
              <p>Searching protocols for the best routes...</p>
            </div>
          )}

          <div className="route-list">
            {routes.map((route) => (
              <article key={`${route.protocol}-${route.estimatedOutput}`} className="route-card">
                <header>
                  <div>
                    <p className="route-label">Protocol</p>
                    <h3>{route.protocol}</h3>
                  </div>
                  {typeof route.score === 'number' && (
                    <span className="score-chip">{(route.score * 100).toFixed(1)}%</span>
                  )}
                </header>
                <div className="route-meta">
                  <div>
                    <p className="route-label">Output</p>
                    <strong>
                      {formatUnits(route.estimatedOutput, selectedToken?.decimals)}
                      &nbsp;{form.tokenSymbol}
                    </strong>
                  </div>
                  <div>
                    <p className="route-label">Fee</p>
                    <strong>
                      {formatUnits(route.estimatedFee, selectedToken?.decimals)}
                      &nbsp;{form.tokenSymbol}
                    </strong>
                  </div>
                  <div>
                    <p className="route-label">ETA</p>
                    <strong>{Math.round(route.estimatedTime / 60)} min</strong>
                  </div>
                </div>

                <div className="route-gas">
                  <p className="route-label">Gas cost</p>
                  <strong>
                    {route.route?.estimate?.gasCosts?.total ||
                      route.route?.estimate?.gasCosts?.usd ||
                      'Auto'}
                  </strong>
                </div>

                {!!route.reasons?.length && (
                  <ul className="route-reasons">
                    {route.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                )}

                <div className="route-actions">
                  <button type="button" className="primary ghost" disabled>
                    Simulate transfer
                  </button>
                  <button type="button" className="ghost" disabled>
                    View details
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

export default RouteFinder;
