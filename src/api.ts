import { BigNumber, Utils, Wallet } from "@ijstech/eth-wallet";
import { Contracts } from "@scom/oswap-openswap-contract";
import { State } from "./store/index";

export async function doStake(state: State, amount:BigNumber | number | string) {
    const wallet = Wallet.getClientInstance();
    const chainId = state.getChainId();
    const gov = state.getAddresses(chainId).OAXDEX_Governance;
    const govContract = new Contracts.OAXDEX_Governance(wallet, gov);
    const decimals = govTokenDecimals(state);
    if (!(amount instanceof BigNumber)) {
        amount = new BigNumber(amount);
    }
    const receipt = await govContract.stake(amount.shiftedBy(decimals));
    return receipt;
}

export async function doUnstake(state: State, amount:BigNumber | number | string) {
    const wallet = Wallet.getClientInstance();
    const chainId = state.getChainId();
    const gov = state.getAddresses(chainId).OAXDEX_Governance;
    const govContract = new Contracts.OAXDEX_Governance(wallet, gov);
    const decimals = govTokenDecimals(state);
    if (!(amount instanceof BigNumber)) {
        amount = new BigNumber(amount);
    }
    const receipt = await govContract.unstake(amount.shiftedBy(decimals));
    return receipt;
}

export async function doUnlockStake(state: State) {
    const wallet = Wallet.getClientInstance();
    const chainId = state.getChainId();
    const gov = state.getAddresses(chainId).OAXDEX_Governance;
    const govContract = new Contracts.OAXDEX_Governance(wallet, gov);
    const receipt = await govContract.unlockStake();
    return receipt;
}

export async function getMinStakePeriod(state: State) {
    const wallet = state.getRpcWallet();
    const chainId = state.getChainId();
    const address = state.getAddresses(chainId).OAXDEX_Governance;
    const govContract = new Contracts.OAXDEX_Governance(wallet, address);
    let result = await govContract.minStakePeriod();
    return result.toNumber();
}

const govTokenDecimals = (state: State) => {
    const chainId = state.getChainId();
    return state.getGovToken(chainId).decimals || 18
}


const stakeOf = async function (state: State, address: string) {
    const wallet = state.getRpcWallet();
    const chainId = state.getChainId();
    const gov = state.getAddresses(chainId).OAXDEX_Governance;
    const govContract = new Contracts.OAXDEX_Governance(wallet, gov);
    let result = await govContract.stakeOf(address);
    result = Utils.fromDecimals(result, govTokenDecimals(state));
    return result;
}

const freezedStake = async function (state: State, address: string) {
    const wallet = state.getRpcWallet();
    const chainId = state.getChainId();
    const gov = state.getAddresses(chainId).OAXDEX_Governance;
    const govContract = new Contracts.OAXDEX_Governance(wallet, gov);
    let result = await govContract.freezedStake(address);
    let minStakePeriod = await govContract.minStakePeriod();
    let newResult = { amount: Utils.fromDecimals(result.amount, govTokenDecimals(state)), timestamp: Number(result.timestamp) * 1000, lockTill: (Number(result.timestamp) + Number(minStakePeriod)) * 1000 };
    return newResult;
}

export async function getGovState(state: State) {
    const wallet = state.getRpcWallet();
    const chainId = state.getChainId();
    const address = state.getAddresses(chainId).OAXDEX_Governance;
    if (address) {
        let stakeOfResult = await stakeOf(state, wallet.account.address);
        let freezeStakeResult: any = await freezedStake(state, wallet.account.address);
        let stakedBalance = new BigNumber(freezeStakeResult.amount).plus(stakeOfResult);
        const govStakeObject = {
            stakedBalance: stakedBalance.toNumber(),
            lockTill: freezeStakeResult.lockTill,
            votingBalance: stakeOfResult.toNumber(),
            freezeStakeAmount: freezeStakeResult.amount.toNumber(),
            freezeStakeTimestamp: freezeStakeResult.timestamp
        };
        return govStakeObject;
    }
    return null;
}