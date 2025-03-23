"use client"

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

export default function BlockchainApp() {
  const [account, setAccount] = useState(null)
  const [balance, setBalance] = useState('')
  const [chainId, setChainId] = useState(null)
  const [networkName, setNetworkName] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState(null)

  // Get network name from chain ID
  useEffect(() => {
    if (chainId) {
      switch (chainId) {
        case 1: setNetworkName('Ethereum Mainnet'); break
        case 11155111: setNetworkName('Sepolia Testnet'); break
        case 1301: setNetworkName('Unichain Sepolia'); break
        default: setNetworkName(`Chain ID: ${chainId}`)
      }
    } else {
      setNetworkName('')
    }
  }, [chainId])

  // Connect wallet function
  const connectWallet = async () => {
    setError(null)
    setIsConnecting(true)
    
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('Please install MetaMask or another Ethereum wallet')
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      const network = await provider.getNetwork()
      
      setAccount(accounts[0])
      setChainId(Number(network.chainId))
      
      const balance = await provider.getBalance(accounts[0])
      setBalance(ethers.formatEther(balance))
      
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
    } catch (err) {
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
    
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
    }
  }

  // Handle account changes
  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet()
    } else {
      setAccount(accounts[0])
      updateBalance(accounts[0])
    }
  }

  // Handle chain changes
  const handleChainChanged = (chainIdHex) => {
    setChainId(Number(chainIdHex))
    if (account) {
      updateBalance(account)
    }
  }

  // Update balance helper
  const updateBalance = async (address) => {
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
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Blockchain Dapp</h1>
        
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
        
        {account && (
          <div className="bg-gray-100 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Wallet Information</h2>
            
            <div className="mb-2">
              <span className="font-medium">Address:</span>
              <div className="break-all text-sm mt-1">{account}</div>
            </div>
            
            <div className="mb-2">
              <span className="font-medium">Network:</span>
              <div className="mt-1">{networkName}</div>
            </div>
            
            <div>
              <span className="font-medium">Balance:</span>
              <div className="mt-1">
                {balance ? `${parseFloat(balance).toFixed(4)} ETH` : 'Loading...'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}