"use client"

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

export default function BlockchainApp() {
  const [account, setAccount] = useState<string | null>(null)
  const [balance, setBalance] = useState<string>('')
  const [chainId, setChainId] = useState<number | null>(null)
  const [networkName, setNetworkName] = useState<string>('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Add this function to switch to Unichain Sepolia
  const switchToUnichainSepolia = async () => {
    if (!window.ethereum) return;
    
    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x515' }], // 0x515 is hex for 1301
      });
    } catch (error: any) {
      // This error code means the chain hasn't been added to MetaMask
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x515', // 1301 in hex
                chainName: 'Unichain Sepolia',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['https://sepolia.unichain.org'],
                blockExplorerUrls: ['https://sepolia.uniscan.xyz/']
              },
            ],
          });
        } catch (addError) {
          console.error("Error adding chain:", addError);
        }
      }
      console.error("Error switching chain:", error);
    }
  };

  // Get network name from chain ID
  useEffect(() => {
    if (chainId) {
      switch (chainId) {
        case 1: setNetworkName('Ethereum Mainnet'); break;
        case 11155111: setNetworkName('Sepolia Testnet'); break;
        case 1301: setNetworkName('Unichain Sepolia'); break; // Updated name
        default: setNetworkName(`Chain ID: ${chainId}`);
      }
    } else {
      setNetworkName('');
    }
  }, [chainId]);

  // Connect wallet function
  const connectWallet = async () => {
    setError(null)
    setIsConnecting(true)
    
    try {
      // Check if MetaMask is installed
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('Please install MetaMask or another Ethereum wallet')
      }
      
      // Request account access
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      const network = await provider.getNetwork()
      
      // Set state with account info
      setAccount(accounts[0])
      setChainId(Number(network.chainId))
      
      // Get account balance
      const balance = await provider.getBalance(accounts[0])
      setBalance(ethers.formatEther(balance))
      
      // Setup listeners for account and chain changes
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
    } catch (err: any) {
      console.error('Error connecting wallet:', err)
      setError(err.message || 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  // Disconnect wallet function
  const disconnectWallet = () => {
    setAccount(null)
    setBalance('')
    setChainId(null)
    setNetworkName('')
    
    // Remove listeners
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
    }
  }

  // Handle account changes
  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet()
    } else {
      setAccount(accounts[0])
      updateBalance(accounts[0])
    }
  }

  // Handle chain changes
  const handleChainChanged = (chainIdHex: string) => {
    setChainId(Number(chainIdHex))
    if (account) {
      updateBalance(account)
    }
  }

  // Update balance helper
  const updateBalance = async (address: string) => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const balance = await provider.getBalance(address)
        setBalance(ethers.formatEther(balance))
      } catch (err) {
        console.error('Error updating balance:', err)
      }
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4 text-center dark:text-white">Blockchain Dapp</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="flex justify-center mb-6">
          {account ? (
            <button
              onClick={disconnectWallet}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Disconnect Wallet
            </button>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
        
        {account && chainId !== 1301 && (
          <div className="mt-4 mb-4">
            <button
              onClick={switchToUnichainSepolia}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
            >
              Switch to Unichain Sepolia
            </button>
          </div>
        )}
        
        {account && (
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Wallet Information</h2>
            
            <div className="mb-2">
              <span className="font-medium dark:text-white">Address:</span>
              <div className="break-all text-sm mt-1 dark:text-gray-300">{account}</div>
            </div>
            
            <div className="mb-2">
              <span className="font-medium dark:text-white">Network:</span>
              <div className="mt-1 dark:text-gray-300">{networkName}</div>
            </div>
            
            <div>
              <span className="font-medium dark:text-white">Balance:</span>
              <div className="mt-1 dark:text-gray-300">
                {balance ? `${parseFloat(balance).toFixed(4)} ETH` : 'Loading...'}
              </div>
            </div>
          </div>
        )}
        
        {account && (
          <div className="mt-4">
            <div className={`p-2 rounded ${chainId === 1301 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {chainId === 1301 
                ? 