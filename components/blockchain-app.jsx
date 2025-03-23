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

  useEffect(() => {
    if (chainId) {
      switch (chainId) {
        case 1: setNetworkName('Ethereum Mainnet'); break
        case 1301: setNetworkName('Unichain Sepolia'); break
        default: setNetworkName(`Chain ID: ${chainId}`)
      }
    } else {
      setNetworkName('')
    }
  }, [chainId])

  const connectWallet = async () => {
    setError(null)
    setIsConnecting(true)
    
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask')
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      const network = await provider.getNetwork()
      
      setAccount(accounts[0])
      setChainId(Number(network.chainId))
      
      const balance = await provider.getBalance(accounts[0])
      setBalance(ethers.formatEther(balance))
    } catch (err) {
      console.error('Error connecting wallet:', err)
      setError(err.message || 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setBalance('')
    setChainId(null)
    setNetworkName('')
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
