import React, { useState, useEffect } from 'react'
import Navbar from './Navbar'
import './App.css'

import DaiToken from '../abis/DaiToken.json'
import DappToken from '../abis/DappToken.json'
import TokenFarm from '../abis/TokenFarm.json'

import Web3 from 'web3'

import Main from './Main'

const loadWeb3 = async () => {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum)
        await window.ethereum.enable()
    } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider)
    } else {
        window.alert('Non-Ethereum browser detected!')
    }
}

const App = () => {
    const [account, setAccount] = useState(null)
    const [daiToken, setDaiToken] = useState(null)
    const [daiTokenBalance, setDaiTokenBalance] = useState(null)

    const [dappToken, setDappToken] = useState(null)
    const [dappTokenBalance, setDappTokenBalance] = useState(null)

    const [tokenFarm, setTokenFarm] = useState(null)
    const [stakingBalance, setStakingBalance] = useState(null)

    const [loading, setLoading] = useState(true)

    const loadBlockchainData = async () => {
        const web3 = window.web3
        const accounts = await web3.eth.getAccounts()
        setAccount(accounts[0])

        const networkId = await web3.eth.net.getId()

        const daiTokenData = DaiToken.networks[networkId]
        if (daiTokenData) {
            const daiToken = new web3.eth.Contract(
                DaiToken.abi,
                daiTokenData.address
            )
            setDaiToken(daiToken)
            let daiTokenBalance = await daiToken.methods
                .balanceOf(accounts[0])
                .call()
            setDaiTokenBalance(daiTokenBalance.toString())
        } else {
            window.alert('Dai Token Contract not yet deployed to network!')
        }

        const dappTokenData = DappToken.networks[networkId]

        if (dappTokenData) {
            const dappToken = new web3.eth.Contract(
                DappToken.abi,
                dappTokenData.address
            )
            setDappToken(dappToken)
            let dappTokenBalance = await dappToken.methods
                .balanceOf(accounts[0])
                .call()
            setDappTokenBalance(dappTokenBalance.toString())
        } else {
            window.alert('Dapp Token Contract not yet deployed to network!')
        }

        const tokenFarmData = TokenFarm.networks[networkId]
        if (tokenFarmData) {
            const tokenFarm = new web3.eth.Contract(
                TokenFarm.abi,
                tokenFarmData.address
            )
            setTokenFarm(tokenFarm)
            let stakingBalance = await tokenFarm.methods
                .stakingBalance(accounts[0])
                .call()
            setStakingBalance(stakingBalance.toString())
        } else {
            window.alert('Token Farm Contract not yet deployed to network!')
        }

        setLoading(false)
    }

    useEffect(() => {
        ;(async () => {
            await loadWeb3()
            await loadBlockchainData()
        })()
    }, [account])

    const stakeTokens = amount => {
        setLoading(true)
        daiToken.methods
            .approve(tokenFarm._address, amount)
            .send({ from: account })
            .on('transactionHash', hash => {
                tokenFarm.methods.stakeTokens(amount).send({ from: account })
            })
        setLoading(false)
    }

    const unstakeTokens = amount => {
        setLoading(true)
        tokenFarm.methods.unstakeTokens().send({ from: account })
        setLoading(false)
    }

    if (loading) {
        return (
            <div>
                <Navbar account={account} />
                <div className="container-fluid mt-5">
                    <div className="row">
                        <main
                            role="main"
                            className="col-lg-12 ml-auto mr-auto"
                            style={{ maxWidth: '600px' }}
                        >
                            <div className="content mr-auto ml-auto">
                                <h1>Loading Data</h1>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        )
    }
    return (
        <div>
            <Navbar account={account} />
            <div className="container-fluid mt-5">
                <div className="row">
                    <main
                        role="main"
                        className="col-lg-12 ml-auto mr-auto"
                        style={{ maxWidth: '600px' }}
                    >
                        <div className="content mr-auto ml-auto">
                            <Main
                                daiTokenBalance={daiTokenBalance}
                                dappTokenBalance={dappTokenBalance}
                                stakingBalance={stakingBalance}
                                stakeTokens={stakeTokens}
                                unstakeTokens={unstakeTokens}
                            />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}

export default App
