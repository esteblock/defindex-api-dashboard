import { useState } from 'react'
import { getVaultInfo, getVaultAPY, getVaultHistory } from '../services/api'
import { formatAmount, formatAmountWithCommas, formatPercentage } from '../utils/formatters'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import './VaultDashboard.css'

function VaultDashboard() {
  const [vaultAddress, setVaultAddress] = useState('')
  const [network, setNetwork] = useState('mainnet')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [vaultData, setVaultData] = useState(null)
  const [historyPeriod, setHistoryPeriod] = useState('30d')
  const [historyInterval, setHistoryInterval] = useState('daily')

  const fetchVaultData = async () => {
    if (!vaultAddress.trim()) {
      setError('Please enter a vault address')
      return
    }

    setLoading(true)
    setError(null)
    setVaultData(null)

    try {
      // Fetch all vault data in parallel
      const [info, apy, history] = await Promise.allSettled([
        getVaultInfo(vaultAddress, network),
        getVaultAPY(vaultAddress, network),
        getVaultHistory(vaultAddress, network, historyPeriod, historyInterval)
      ])

      setVaultData({
        info: info.status === 'fulfilled' ? info.value : null,
        apy: apy.status === 'fulfilled' ? apy.value : null,
        history: history.status === 'fulfilled' ? history.value : null,
        errors: {
          info: info.status === 'rejected' ? info.reason.message : null,
          apy: apy.status === 'rejected' ? apy.reason.message : null,
          history: history.status === 'rejected' ? history.reason.message : null,
        }
      })
    } catch (err) {
      setError(err.message || 'An error occurred while fetching vault data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchVaultData()
  }

  const handlePeriodChange = async (newPeriod) => {
    setHistoryPeriod(newPeriod)
    if (vaultAddress.trim() && !loading) {
      setLoading(true)
      try {
        const history = await getVaultHistory(vaultAddress, network, newPeriod, historyInterval)
        setVaultData(prev => ({
          ...prev,
          history: history,
          errors: { ...prev.errors, history: null }
        }))
      } catch (err) {
        setVaultData(prev => ({
          ...prev,
          errors: { ...prev.errors, history: err.message }
        }))
      } finally {
        setLoading(false)
      }
    }
  }

  const handleIntervalChange = async (newInterval) => {
    setHistoryInterval(newInterval)
    if (vaultAddress.trim() && !loading) {
      setLoading(true)
      try {
        const history = await getVaultHistory(vaultAddress, network, historyPeriod, newInterval)
        setVaultData(prev => ({
          ...prev,
          history: history,
          errors: { ...prev.errors, history: null }
        }))
      } catch (err) {
        setVaultData(prev => ({
          ...prev,
          errors: { ...prev.errors, history: err.message }
        }))
      } finally {
        setLoading(false)
      }
    }
  }

  // Prepare chart data
  const prepareChartData = () => {
    if (!vaultData?.history?.data || !Array.isArray(vaultData.history.data)) {
      return []
    }

    return vaultData.history.data.map((record) => ({
      date: new Date(record.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      timestamp: record.timestamp,
      vaultPPS: parseFloat(record.vaultPPS) || 0,
      totalSupply: parseFloat(record.totalSupply) || 0,
      totalManagedFunds: parseFloat(record.totalManagedFunds) || 0,
      deposits: parseFloat(record.periodDeposits) || 0,
      withdrawals: parseFloat(record.periodWithdrawals) || 0,
      netDeposits: parseFloat(record.netDeposits) || 0,
      ppsChange: record.ppsChangeFromPrevious !== null ? (record.ppsChangeFromPrevious * 100) : null
    }))
  }

  const chartData = prepareChartData()

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatAmountWithCommas(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="vault-dashboard">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="input-group">
          <select
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
            className="network-select"
          >
            <option value="mainnet">Mainnet</option>
            <option value="testnet">Testnet</option>
          </select>
          <input
            type="text"
            value={vaultAddress}
            onChange={(e) => setVaultAddress(e.target.value)}
            placeholder="Enter Vault Address (e.g., GCKFBEIYTKP6RNYXDXCVN5NHQG7C37VFTCB5BBXZ4F6PUB7FFLLKSZQJ)"
            className="vault-input"
          />
          <button type="submit" disabled={loading} className="search-button">
            {loading ? 'Loading...' : 'Analyze Vault'}
          </button>
        </div>
      </form>

      {error && <div className="error-message">{error}</div>}

      {vaultData && (
        <div className="vault-results">
          {/* Vault Overview */}
          {vaultData.info && (
            <div className="overview-section">
              <div className="overview-header">
                <div>
                  <h1>{vaultData.info.name || 'Vault'}</h1>
                  <p className="vault-symbol">{vaultData.info.symbol || 'N/A'}</p>
                </div>
                {vaultData.info.apy !== undefined && (
                  <div className="apy-badge">
                    <span className="apy-label">Current APY</span>
                    <span className="apy-value-large">{vaultData.info.apy.toFixed(2)}%</span>
                    <span className="apy-period">7 days</span>
                  </div>
                )}
              </div>

              {/* Key Metrics Cards */}
              <div className="metrics-cards">
                {vaultData.history?.currentState && (
                  <>
                    <div className="metric-card">
                      <span className="metric-label">Price Per Share (PPS)</span>
                      <span className="metric-value">{formatAmount(vaultData.history.currentState.vaultPPS)}</span>
                    </div>
                    <div className="metric-card">
                      <span className="metric-label">Total Supply</span>
                      <span className="metric-value">{formatAmountWithCommas(vaultData.history.currentState.totalSupply)}</span>
                    </div>
                    {vaultData.history.currentState.totalManagedFunds && vaultData.history.currentState.totalManagedFunds.length > 0 && (
                      <div className="metric-card">
                        <span className="metric-label">Total Value Locked</span>
                        <span className="metric-value">
                          {formatAmountWithCommas(vaultData.history.currentState.totalManagedFunds[0].total_amount)}
                        </span>
                      </div>
                    )}
                  </>
                )}
                {vaultData.history?.metrics && (
                  <>
                    <div className="metric-card">
                      <span className="metric-label">Total Deposits</span>
                      <span className="metric-value positive">
                        {vaultData.history.metrics.totalDepositsDisplay || formatAmountWithCommas(vaultData.history.metrics.totalDeposits)}
                      </span>
                    </div>
                    <div className="metric-card">
                      <span className="metric-label">Total Withdrawals</span>
                      <span className="metric-value negative">
                        {vaultData.history.metrics.totalWithdrawalsDisplay || formatAmountWithCommas(vaultData.history.metrics.totalWithdrawals)}
                      </span>
                    </div>
                    <div className="metric-card">
                      <span className="metric-label">Unique Depositors</span>
                      <span className="metric-value">{vaultData.history.metrics.uniqueDepositors || '0'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          {vaultData.history?.metrics && (
            <div className="info-card">
              <h2>Performance Metrics</h2>
              <div className="performance-grid">
                {vaultData.history.metrics.period7d && (
                  <div className="performance-card">
                    <h3>7 Days</h3>
                    <div className="performance-metrics">
                      <div className="performance-item">
                        <span className="perf-label">APY</span>
                        <span className="perf-value highlight">{vaultData.history.metrics.period7d.apy?.toFixed(2)}%</span>
                      </div>
                      <div className="performance-item">
                        <span className="perf-label">PPS Change</span>
                        <span className="perf-value">
                          {vaultData.history.metrics.period7d.ppsChange ? formatPercentage(vaultData.history.metrics.period7d.ppsChange * 100) : 'N/A'}
                        </span>
                      </div>
                      <div className="performance-item">
                        <span className="perf-label">Net Deposits</span>
                        <span className="perf-value">
                          {vaultData.history.metrics.period7d.netDepositsDisplay || formatAmountWithCommas(vaultData.history.metrics.period7d.netDeposits)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {vaultData.history.metrics.period30d && (
                  <div className="performance-card">
                    <h3>30 Days</h3>
                    <div className="performance-metrics">
                      <div className="performance-item">
                        <span className="perf-label">APY</span>
                        <span className="perf-value highlight">{vaultData.history.metrics.period30d.apy?.toFixed(2)}%</span>
                      </div>
                      <div className="performance-item">
                        <span className="perf-label">PPS Change</span>
                        <span className="perf-value">
                          {vaultData.history.metrics.period30d.ppsChange ? formatPercentage(vaultData.history.metrics.period30d.ppsChange * 100) : 'N/A'}
                        </span>
                      </div>
                      <div className="performance-item">
                        <span className="perf-label">Net Deposits</span>
                        <span className="perf-value">
                          {vaultData.history.metrics.period30d.netDepositsDisplay || formatAmountWithCommas(vaultData.history.metrics.period30d.netDeposits)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {vaultData.history.metrics.fullPeriod && (
                  <div className="performance-card">
                    <h3>Full Period ({vaultData.history.metrics.fullPeriod.days} days)</h3>
                    <div className="performance-metrics">
                      <div className="performance-item">
                        <span className="perf-label">Total Return</span>
                        <span className="perf-value highlight">
                          {vaultData.history.metrics.fullPeriod.totalReturn ? formatPercentage(vaultData.history.metrics.fullPeriod.totalReturn * 100) : 'N/A'}
                        </span>
                      </div>
                      <div className="performance-item">
                        <span className="perf-label">Annualized Return</span>
                        <span className="perf-value highlight">{vaultData.history.metrics.fullPeriod.annualizedReturn?.toFixed(2)}%</span>
                      </div>
                      <div className="performance-item">
                        <span className="perf-label">Total Gains</span>
                        <span className="perf-value">
                          {vaultData.history.metrics.fullPeriod.totalGainsDisplay || formatAmountWithCommas(vaultData.history.metrics.fullPeriod.totalGains)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Charts Section */}
          {vaultData.history && chartData.length > 0 && (
            <div className="charts-section">
              <div className="charts-header">
                <h2>Performance Charts</h2>
                <div className="chart-controls">
                  <select
                    value={historyPeriod}
                    onChange={(e) => handlePeriodChange(e.target.value)}
                    className="chart-select"
                  >
                    <option value="all">All Time</option>
                    <option value="7d">7 Days</option>
                    <option value="30d">30 Days</option>
                    <option value="90d">90 Days</option>
                    <option value="1y">1 Year</option>
                  </select>
                  <select
                    value={historyInterval}
                    onChange={(e) => handleIntervalChange(e.target.value)}
                    className="chart-select"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              {/* Price Per Share Chart */}
              <div className="chart-card">
                <h3>Price Per Share (PPS) Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="ppsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="date" stroke="#666" />
                    <YAxis stroke="#666" tickFormatter={(value) => formatAmount(value)} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="vaultPPS"
                      stroke="#667eea"
                      fillOpacity={1}
                      fill="url(#ppsGradient)"
                      name="PPS"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Deposits and Withdrawals Chart */}
              <div className="chart-card">
                <h3>Deposits & Withdrawals Flow</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="date" stroke="#666" />
                    <YAxis stroke="#666" tickFormatter={(value) => formatAmountWithCommas(value)} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="deposits" fill="#10b981" name="Deposits" />
                    <Bar dataKey="withdrawals" fill="#ef4444" name="Withdrawals" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Net Deposits Chart */}
              <div className="chart-card">
                <h3>Net Deposits Flow</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="netDepositsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="date" stroke="#666" />
                    <YAxis stroke="#666" tickFormatter={(value) => formatAmountWithCommas(value)} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="netDeposits"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#netDepositsGradient)"
                      name="Net Deposits"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Total Value Locked Chart */}
              <div className="chart-card">
                <h3>Total Value Locked (TVL)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="date" stroke="#666" />
                    <YAxis stroke="#666" tickFormatter={(value) => formatAmountWithCommas(value)} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="totalManagedFunds"
                      stroke="#764ba2"
                      strokeWidth={2}
                      dot={false}
                      name="TVL"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* PPS Change Chart */}
              {chartData.some(d => d.ppsChange !== null) && (
                <div className="chart-card">
                  <h3>Price Per Share Change (%)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="date" stroke="#666" />
                      <YAxis stroke="#666" tickFormatter={(value) => `${value.toFixed(2)}%`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="ppsChange"
                        stroke="#667eea"
                        strokeWidth={2}
                        dot={{ fill: '#667eea', r: 4 }}
                        name="PPS Change %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Vault Details */}
          {vaultData.info && (
            <div className="info-card">
              <h2>Vault Details</h2>
              
              {/* Roles */}
              {vaultData.info.roles && (
                <div className="details-section">
                  <h3>Administrative Roles</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Manager:</span>
                      <span className="value code">{vaultData.info.roles.manager || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Emergency Manager:</span>
                      <span className="value code">{vaultData.info.roles.emergencyManager || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Rebalance Manager:</span>
                      <span className="value code">{vaultData.info.roles.rebalanceManager || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Fee Receiver:</span>
                      <span className="value code">{vaultData.info.roles.feeReceiver || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Fees */}
              {vaultData.info.feesBps && (
                <div className="details-section">
                  <h3>Fee Structure</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Vault Fee:</span>
                      <span className="value">{vaultData.info.feesBps.vaultFee !== undefined ? `${(vaultData.info.feesBps.vaultFee / 100).toFixed(2)}%` : 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">DeFindex Fee:</span>
                      <span className="value">{vaultData.info.feesBps.defindexFee !== undefined ? `${(vaultData.info.feesBps.defindexFee / 100).toFixed(2)}%` : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Assets */}
              {vaultData.info.assets && vaultData.info.assets.length > 0 && (
                <div className="details-section">
                  <h3>Supported Assets</h3>
                  {vaultData.info.assets.map((asset, idx) => (
                    <div key={idx} className="asset-card">
                      <div className="asset-header">
                        <div>
                          <strong>{asset.name || `Asset ${idx + 1}`}</strong>
                          {asset.symbol && <span className="badge">{asset.symbol}</span>}
                        </div>
                        <span className="code">{asset.address}</span>
                      </div>
                      {asset.strategies && asset.strategies.length > 0 && (
                        <div className="strategies">
                          <strong>Strategies:</strong>
                          {asset.strategies.map((strategy, sidx) => (
                            <div key={sidx} className="strategy-item">
                              <span className="code">{strategy.address}</span>
                              <span className="badge">{strategy.name}</span>
                              {strategy.paused && <span className="badge paused">Paused</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Error Messages */}
          {vaultData.errors.info && (
            <div className="info-card error">
              <h2>Vault Information</h2>
              <p className="error-text">Error: {vaultData.errors.info}</p>
            </div>
          )}

          {vaultData.errors.history && (
            <div className="info-card error">
              <h2>Historical Performance</h2>
              <p className="error-text">Error: {vaultData.errors.history}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default VaultDashboard
