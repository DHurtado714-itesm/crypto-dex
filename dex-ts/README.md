# Dex Starter

This project is a decentralized exchange (DEX) starter kit using Moralis and 1inch.

## Features

- **Moralis Integration**: Easily connect to the blockchain and manage user authentication.
- **1inch Integration**: Access to the 1inch API for token swaps and price data.
- **React**: Built with React for a modern and responsive UI.
- **TypeScript**: Written in TypeScript for type safety and better developer experience.

## Getting Started

### Prerequisites

- Node.js
- pnpm
- Moralis account
- 1inch API key

### Running the App

Start the development server:

```sh
pnpm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Usage

- **Authentication**: Users can log in using their crypto wallets.
- **Token Swaps**: Perform token swaps using the 1inch API.
- **Price Data**: Fetch and display token price data.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.

## Contact

For any questions or support, please open an issue or contact the maintainer.

## Architecture

This project consists of a React frontend built with Vite and a backend where the transactions are formed.

### Frontend

- **React**: The frontend is built using React for a modern and responsive user interface.
- **Vite**: Vite is used as the build tool for faster development and optimized production builds.

### Backend

- **Transaction Formation**: The backend handles the formation of transactions, interacting with the blockchain and the 1inch API.

## Folder Structure

- `src/`: Contains the React frontend code.
- `public/`: Static assets.

## Running the Backend

To start the backend server, navigate to the `backend` directory and run:

```sh
pnpm start
```
