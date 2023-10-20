import { application, FormatUtils } from "@ijstech/components";
import { BigNumber, ERC20ApprovalModel, IERC20ApprovalEventOptions, INetwork, Wallet } from "@ijstech/eth-wallet";
import getNetworkList from "@scom/scom-network-list";
import { ITokenObject, WETHByChainId } from "@scom/scom-token-list";
import { coreAddress } from "./core";

export class State {
  infuraId: string = '';
  networkMap: { [key: number]: INetwork } = {};
  rpcWalletId: string = '';
  approvalModel: ERC20ApprovalModel;
  handleNextFlowStep: (data: any) => Promise<void>;
  handleAddTransactions: (data: any) => Promise<void>;
  handleJumpToStep: (data: any) => Promise<void>;
  handleUpdateStepStatus: (data: any) => Promise<void>;

  constructor(options: any) {
    this.networkMap = getNetworkList();
    this.initData(options);
  }

  private initData(options: any) {
    if (options.infuraId) {
      this.infuraId = options.infuraId;
    }
    if (options.networks) {
      this.setNetworkList(options.networks, options.infuraId)
    }
  }

  initRpcWallet(defaultChainId: number) {
    if (this.rpcWalletId) {
      return this.rpcWalletId;
    }
    const clientWallet = Wallet.getClientInstance();
    const networkList: INetwork[] = Object.values(application.store?.networkMap || []);
    const instanceId = clientWallet.initRpcWallet({
      networks: networkList,
      defaultChainId,
      infuraId: application.store?.infuraId,
      multicalls: application.store?.multicalls
    });
    this.rpcWalletId = instanceId;
    if (clientWallet.address) {
      const rpcWallet = Wallet.getRpcWalletInstance(instanceId);
      rpcWallet.address = clientWallet.address;
    }
    return instanceId;
  }

  getRpcWallet() {
    return this.rpcWalletId ? Wallet.getRpcWalletInstance(this.rpcWalletId) : null;
  }

  isRpcWalletConnected() {
    const wallet = this.getRpcWallet();
    return wallet?.isConnected;
  }

  getChainId() {
    const rpcWallet = this.getRpcWallet();
    return rpcWallet?.chainId;
  }

  private setNetworkList(networkList: INetwork[], infuraId?: string) {
    const wallet = Wallet.getClientInstance();
    this.networkMap = {};
    const defaultNetworkList = getNetworkList();
    const defaultNetworkMap = defaultNetworkList.reduce((acc, cur) => {
      acc[cur.chainId] = cur;
      return acc;
    }, {});
    for (let network of networkList) {
      const networkInfo = defaultNetworkMap[network.chainId];
      if (!networkInfo) continue;
      if (infuraId && network.rpcUrls && network.rpcUrls.length > 0) {
        for (let i = 0; i < network.rpcUrls.length; i++) {
          network.rpcUrls[i] = network.rpcUrls[i].replace(/{InfuraId}/g, infuraId);
        }
      }
      this.networkMap[network.chainId] = {
        ...networkInfo,
        ...network
      };
      wallet.setNetworkInfo(this.networkMap[network.chainId]);
    }
  }

  async setApprovalModelAction(options: IERC20ApprovalEventOptions) {
    const approvalOptions = {
      ...options,
      spenderAddress: ''
    };
    let wallet = this.getRpcWallet();
    this.approvalModel = new ERC20ApprovalModel(wallet, approvalOptions);
    let approvalModelAction = this.approvalModel.getAction();
    return approvalModelAction;
  }

  getAddresses(chainId?: number) {
    return coreAddress[chainId || this.getChainId()];
  }

  getGovToken(chainId: number): ITokenObject {
    let govToken;
    let address = this.getAddresses(chainId).GovToken;
    if (chainId == 43113 || chainId == 43114 || chainId == 42161 || chainId == 421613 || chainId == 80001 || chainId == 137) {
      govToken = { address: address, decimals: 18, symbol: "veOSWAP", name: 'Vote-escrowed OSWAP', chainId };
    } else {
      govToken = { address: address, decimals: 18, symbol: "OSWAP", name: 'OpenSwap', chainId };
    }
    return govToken;
  }
}

export function isClientWalletConnected() {
  const wallet = Wallet.getClientInstance();
  return wallet.isConnected;
}

export const getWETH = (chainId: number): ITokenObject => {
  let wrappedToken = WETHByChainId[chainId];
  return wrappedToken;
}

export function formatNumber(value: number | string, decimalFigures?: number) {
  decimalFigures = decimalFigures || 4;
  const newValue = new BigNumber(value).toFixed(decimalFigures);
  return FormatUtils.formatNumber(newValue, { decimalFigures: decimalFigures });
}