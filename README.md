# DeFindex Vault Dashboard

A simple, elegant dashboard to explore and visualize vault information from the DeFindex API.

## Features

This dashboard showcases the power of the DeFindex API by allowing users to:

- **Retrieve Vault Information**: Get comprehensive details about any vault by entering its address
- **View APY**: See the Annual Percentage Yield for the vault
- **Historical Performance**: Access historical performance data
- **Performance Reports**: View detailed performance reports
- **Asset & Strategy Information**: See all assets managed by the vault and their associated strategies

## API Endpoints Used

The dashboard integrates with the following DeFindex API endpoints:

- `GET /vault/{address}` - Retrieves comprehensive vault information
- `GET /vault/{address}/apy` - Gets the Annual Percentage Yield
- `GET /vault/{address}/history` - Fetches historical performance data
- `GET /vault/{address}/report` - Retrieves performance reports for all strategies

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd defindex-api-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

## Usage

1. Enter a vault address in the input field (e.g., `CDVQV...`)
2. Click "Get Vault Info" to fetch data from the DeFindex API
3. View the comprehensive vault information displayed in organized cards

## Project Structure

```
src/
├── components/
│   ├── VaultDashboard.jsx      # Main dashboard component
│   └── VaultDashboard.css      # Dashboard styles
├── services/
│   └── api.js                  # API service functions
├── App.jsx                     # Root component
├── App.css                     # App styles
├── index.css                   # Global styles
└── main.jsx                    # Entry point
```

## API Service

The `src/services/api.js` file provides clean, reusable functions for interacting with the DeFindex API:

- `getVaultInfo(vaultAddress)` - Fetch vault information
- `getVaultAPY(vaultAddress)` - Fetch vault APY
- `getVaultHistory(vaultAddress)` - Fetch historical performance
- `getVaultReport(vaultAddress)` - Fetch performance report
- `getVaultBalance(vaultAddress, userAddress)` - Fetch user balance
- `getFactoryAddress(network)` - Get factory contract address

## Building for Production

To create a production build:

```bash
npm run build
```

The optimized files will be in the `dist/` directory.

## Technologies Used

- **React** - UI framework
- **Vite** - Build tool and dev server
- **DeFindex API** - Blockchain vault data

## API Documentation

For more information about the DeFindex API, visit: https://api.defindex.io/docs

## License

MIT
