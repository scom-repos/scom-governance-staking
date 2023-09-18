import { BigNumber, Wallet } from "@ijstech/eth-wallet";
import { Contracts } from "@scom/oswap-openswap-contract";

async function doStakeToGov(wallet:Wallet, gov:string, govTokenDecimals:number, amount:BigNumber) {
    const govContract = new Contracts.OAXDEX_Governance(wallet, gov);
    const receipt = await govContract.stake(amount.shiftedBy(govTokenDecimals));
    return receipt;
}