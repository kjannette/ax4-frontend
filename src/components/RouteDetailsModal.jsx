import { useEffect } from 'react';
import './RouteDetailsModal.css';

function RouteDetailsModal({ route, tokenSymbol, isOpen, onClose }) {
  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !route) return null;

  const formatUnits = (value, decimals = 6) => {
    if (!value) return '0';
    try {
      const big = BigInt(value);
      const divisor = BigInt(10) ** BigInt(decimals);
      const whole = big / divisor;
      const fraction = big % divisor;
      const fractionStr = fraction.toString().padStart(decimals, '0').slice(0, 6);
      return `${whole.toString()}.${fractionStr}`;
    } catch {
      return value;
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    if (address.length < 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <div>
            <h2>Route Details</h2>
            <p className="modal-subtitle">{route.protocol}</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <div className="modal-body">
          {/* Section 1: Protocol-Specific Route Details */}
          <section className="detail-section">
            <h3>Route Information</h3>
            
            {/* Multi-hop routes */}
            {route.route?.steps && route.route.steps.length > 0 && (
              <div className="detail-item">
                <label>Transaction Steps</label>
                <div className="steps-list">
                  {route.route.steps.map((step, idx) => (
                    <div key={idx} className="step-item">
                      <span className="step-number">{idx + 1}</span>
                      <div className="step-details">
                        <p className="step-action">{step.action || step.type || 'Transfer'}</p>
                        {step.from && step.to && (
                          <p className="step-route">
                            {step.from} → {step.to}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Liquidity pools */}
            {route.route?.pools && route.route.pools.length > 0 && (
              <div className="detail-item">
                <label>Liquidity Pools</label>
                <div className="pool-list">
                  {route.route.pools.map((pool, idx) => (
                    <div key={idx} className="pool-item">
                      <p>{pool.name || `Pool ${idx + 1}`}</p>
                      {pool.address && (
                        <code className="address">{formatAddress(pool.address)}</code>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Smart contract addresses */}
            {route.route?.contracts && (
              <div className="detail-item">
                <label>Smart Contracts</label>
                <div className="contracts-list">
                  {Object.entries(route.route.contracts).map(([key, address]) => (
                    <div key={key} className="contract-item">
                      <span className="contract-label">{key}:</span>
                      <code className="address">{formatAddress(address)}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Slippage details */}
            {route.route?.slippage !== undefined && (
              <div className="detail-item">
                <label>Slippage Tolerance</label>
                <p>{route.route.slippage}%</p>
              </div>
            )}

            {/* Price impact */}
            {route.route?.priceImpact !== undefined && (
              <div className="detail-item">
                <label>Price Impact</label>
                <p className={route.route.priceImpact > 1 ? 'warning-text' : ''}>
                  {route.route.priceImpact}%
                </p>
              </div>
            )}
          </section>

          {/* Section 2: Additional Metrics */}
          <section className="detail-section">
            <h3>Additional Metrics</h3>

            {/* Gas breakdown */}
            {route.route?.estimate?.gasCosts && (
              <div className="detail-item">
                <label>Gas Breakdown</label>
                <div className="gas-breakdown">
                  {route.route.estimate.gasCosts.approval && (
                    <div className="gas-line">
                      <span>Approval Transaction:</span>
                      <strong>${route.route.estimate.gasCosts.approval}</strong>
                    </div>
                  )}
                  {route.route.estimate.gasCosts.bridge && (
                    <div className="gas-line">
                      <span>Bridge Transaction:</span>
                      <strong>${route.route.estimate.gasCosts.bridge}</strong>
                    </div>
                  )}
                  {route.route.estimate.gasCosts.destination && (
                    <div className="gas-line">
                      <span>Destination Chain:</span>
                      <strong>${route.route.estimate.gasCosts.destination}</strong>
                    </div>
                  )}
                  {route.route.estimate.gasCosts.total && (
                    <div className="gas-line gas-total">
                      <span>Total Gas Cost:</span>
                      <strong>${route.route.estimate.gasCosts.total}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Security metrics */}
            {route.securityMetrics && (
              <div className="detail-item">
                <label>Security Information</label>
                <div className="security-info">
                  {route.securityMetrics.tvl && (
                    <div className="metric-line">
                      <span>Total Value Locked:</span>
                      <strong>${(route.securityMetrics.tvl / 1000000).toFixed(2)}M</strong>
                    </div>
                  )}
                  {route.securityMetrics.auditStatus && (
                    <div className="metric-line">
                      <span>Audit Status:</span>
                      <strong className="success-text">{route.securityMetrics.auditStatus}</strong>
                    </div>
                  )}
                  {route.securityMetrics.uptime !== undefined && (
                    <div className="metric-line">
                      <span>Uptime:</span>
                      <strong>{route.securityMetrics.uptime}%</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Historical performance */}
            {route.performance && (
              <div className="detail-item">
                <label>Historical Performance</label>
                <div className="performance-info">
                  {route.performance.avgCompletionTime && (
                    <div className="metric-line">
                      <span>Avg. Completion Time:</span>
                      <strong>{Math.round(route.performance.avgCompletionTime / 60)} min</strong>
                    </div>
                  )}
                  {route.performance.successRate !== undefined && (
                    <div className="metric-line">
                      <span>Success Rate:</span>
                      <strong className="success-text">{route.performance.successRate}%</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Liquidity analysis */}
            {route.liquidityAnalysis && (
              <div className="detail-item">
                <label>Liquidity Analysis</label>
                <div className="liquidity-info">
                  {route.liquidityAnalysis.available && (
                    <div className="metric-line">
                      <span>Available Liquidity:</span>
                      <strong>
                        {formatUnits(route.liquidityAnalysis.available)} {tokenSymbol}
                      </strong>
                    </div>
                  )}
                  {route.liquidityAnalysis.utilizationRate !== undefined && (
                    <div className="metric-line">
                      <span>Pool Utilization:</span>
                      <strong>{route.liquidityAnalysis.utilizationRate}%</strong>
                    </div>
                  )}
                  {route.liquidityAnalysis.potentialDelay && (
                    <div className="metric-line">
                      <span>Potential Delay:</span>
                      <strong className="warning-text">
                        {route.liquidityAnalysis.potentialDelay}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Section 3: Raw API Response */}
          <section className="detail-section">
            <h3>Raw API Response</h3>
            <details className="raw-response">
              <summary>View technical data</summary>
              <pre className="json-display">
                {JSON.stringify(route.rawResponse || route.route || route, null, 2)}
              </pre>
            </details>
          </section>

          {/* Section 4: Action Steps (COMMENTED OUT - Future implementation) */}
          {/* 
          <section className="detail-section action-section">
            <h3>Action Steps</h3>
            
            <div className="detail-item">
              <label>Required Wallet Permissions</label>
              <ul className="permissions-list">
                {route.actionSteps?.permissions.map((permission, idx) => (
                  <li key={idx}>{permission}</li>
                ))}
              </ul>
            </div>

            <div className="detail-item">
              <label>Estimated Total Cost (USD)</label>
              <p className="cost-estimate">${route.actionSteps?.totalCostUSD}</p>
            </div>

            <div className="detail-item">
              <label>Transaction Parameters</label>
              <div className="tx-params">
                {Object.entries(route.actionSteps?.txParams || {}).map(([key, value]) => (
                  <div key={key} className="param-line">
                    <span>{key}:</span>
                    <code>{value}</code>
                  </div>
                ))}
              </div>
            </div>

            <div className="detail-item">
              <label>Protocol Documentation</label>
              <div className="doc-links">
                {route.actionSteps?.docLinks?.map((link, idx) => (
                  <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.title} →
                  </a>
                ))}
              </div>
            </div>
          </section>
          */}
        </div>

        <footer className="modal-footer">
          <button className="ghost" onClick={onClose}>
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}

export default RouteDetailsModal;

