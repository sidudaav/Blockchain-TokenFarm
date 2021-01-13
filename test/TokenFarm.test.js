const TokenFarm = artifacts.require('TokenFarm')
const DaiToken = artifacts.require('DaiToken')
const DappToken = artifacts.require('DappToken')

require('chai').use(require('chai-as-promised')).should()

const assert = require('assert')
const web3 = require('web3')

const tokens = (n) => {
    return web3.utils.toWei(n, 'ether')
}

contract('TokenFarm', (accounts) => {
    let daiToken, dappToken, tokenFarm

    before(async () => {
        daiToken = await DaiToken.new()
        dappToken = await DappToken.new()
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

        await dappToken.transfer(tokenFarm.address, tokens('1000000'))
        await daiToken.transfer(accounts[1], tokens('100'), {
            from: accounts[0],
        })
    })

    describe('Mock Dai deployment', async () => {
        it('has a name', async () => {
            const name = await daiToken.name()
            assert.strictEqual(name, 'Mock DAI Token')
        })
    })

    describe('Dapp Token deployment', async () => {
        it('has a name', async () => {
            const name = await dappToken.name()
            assert.strictEqual(name, 'DApp Token')
        })
    })

    describe('Token Farm deployment', async () => {
        it('has a name', async () => {
            const name = await tokenFarm.name()
            assert.strictEqual(name, 'Dapp Token Farm')
        })

        it('contract has tokens', async () => {
            let balance = await dappToken.balanceOf(tokenFarm.address)
            assert.strictEqual(balance.toString(), tokens('1000000'))
        })
    })

    describe('Farming tokens', async () => {
        it('rewards investors for staking mDai tokens', async () => {
            let result

            result = await daiToken.balanceOf(accounts[1])
            assert.strictEqual(result.toString(), tokens('100'))

            await daiToken.approve(tokenFarm.address, tokens('100'), {
                from: accounts[1],
            })
            await tokenFarm.stakeTokens(tokens('100'), { from: accounts[1] })

            result = await daiToken.balanceOf(accounts[1])
            assert.strictEqual(result.toString(), tokens('0'))

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.strictEqual(
                result.toString(),
                tokens('100'),
                'Token Farm Mock DAI balance correct after staking'
            )

            result = await tokenFarm.stakingBalance(accounts[1])
            assert.strictEqual(
                result.toString(),
                tokens('100'),
                'investor staking balance correct after staking'
            )

            result = await tokenFarm.isStaking(accounts[1])
            assert.strictEqual(
                result.toString(),
                'true',
                'investor staking status correct after staking'
            )

            await tokenFarm.issueTokens({ from: accounts[0] })

            result = await dappToken.balanceOf(accounts[1])
            assert.strictEqual(
                result.toString(),
                tokens('100'),
                'investor DApp Token wallet balance correct affter issuance'
            )

            await tokenFarm.issueTokens({ from: accounts[1] }).should.be
                .rejected

            await tokenFarm.unstakeTokens({ from: accounts[1] })

            result = await daiToken.balanceOf(accounts[1])
            assert.strictEqual(
                result.toString(),
                tokens('100'),
                'investor Mock DAI wallet balance correct after staking'
            )

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.strictEqual(
                result.toString(),
                tokens('0'),
                'Token Farm Mock DAI balance correct after staking'
            )

            result = await tokenFarm.stakingBalance(accounts[1])
            assert.strictEqual(
                result.toString(),
                tokens('0'),
                'investor staking balance correct after staking'
            )

            result = await tokenFarm.isStaking(accounts[1])
        })
    })
})
