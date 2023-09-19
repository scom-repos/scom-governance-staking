/// <reference path="@scom/scom-dapp-container/@ijstech/eth-wallet/index.d.ts" />
/// <reference path="@ijstech/eth-wallet/index.d.ts" />
/// <reference path="@scom/scom-token-input/@ijstech/eth-wallet/index.d.ts" />
/// <reference path="@scom/scom-token-input/@scom/scom-token-modal/@ijstech/eth-wallet/index.d.ts" />
/// <amd-module name="@scom/scom-governance-staking/assets.ts" />
declare module "@scom/scom-governance-staking/assets.ts" {
    function fullPath(path: string): string;
    const _default: {
        fullPath: typeof fullPath;
    };
    export default _default;
}
/// <amd-module name="@scom/scom-governance-staking/store/core.ts" />
declare module "@scom/scom-governance-staking/store/core.ts" {
    export interface CoreAddress {
        GovToken: string;
        OAXDEX_Governance: string;
    }
    export const coreAddress: {
        [chainId: number]: CoreAddress;
    };
}
/// <amd-module name="@scom/scom-governance-staking/store/utils.ts" />
declare module "@scom/scom-governance-staking/store/utils.ts" {
    import { ERC20ApprovalModel, IERC20ApprovalEventOptions, INetwork } from "@ijstech/eth-wallet";
    import { ITokenObject } from "@scom/scom-token-list";
    export class State {
        infuraId: string;
        networkMap: {
            [key: number]: INetwork;
        };
        rpcWalletId: string;
        approvalModel: ERC20ApprovalModel;
        constructor(options: any);
        private initData;
        initRpcWallet(defaultChainId: number): string;
        getRpcWallet(): import("@ijstech/eth-wallet").IRpcWallet;
        isRpcWalletConnected(): boolean;
        getChainId(): number;
        private setNetworkList;
        setApprovalModelAction(options: IERC20ApprovalEventOptions): Promise<import("@ijstech/eth-wallet").IERC20ApprovalAction>;
        getAddresses(chainId?: number): import("@scom/scom-governance-staking/store/core.ts").CoreAddress;
        getGovToken(chainId: number): ITokenObject;
    }
    export function isClientWalletConnected(): boolean;
    export const getWETH: (chainId: number) => ITokenObject;
}
/// <amd-module name="@scom/scom-governance-staking/store/index.ts" />
declare module "@scom/scom-governance-staking/store/index.ts" {
    export * from "@scom/scom-governance-staking/store/utils.ts";
}
/// <amd-module name="@scom/scom-governance-staking/data.json.ts" />
declare module "@scom/scom-governance-staking/data.json.ts" {
    const _default_1: {
        infuraId: string;
        networks: {
            chainId: number;
            explorerTxUrl: string;
            explorerAddressUrl: string;
        }[];
        defaultBuilderData: {
            defaultChainId: number;
            networks: {
                chainId: number;
            }[];
            wallets: {
                name: string;
            }[];
            showHeader: boolean;
            showFooter: boolean;
        };
    };
    export default _default_1;
}
/// <amd-module name="@scom/scom-governance-staking/interface.ts" />
declare module "@scom/scom-governance-staking/interface.ts" {
    import { INetworkConfig } from "@scom/scom-network-picker";
    import { IWalletPlugin } from "@scom/scom-wallet-modal";
    export interface IGovernanceStaking {
        wallets: IWalletPlugin[];
        networks: INetworkConfig[];
        defaultChainId?: number;
        showHeader?: boolean;
    }
}
/// <amd-module name="@scom/scom-governance-staking/index.css.ts" />
declare module "@scom/scom-governance-staking/index.css.ts" {
    const _default_2: string;
    export default _default_2;
}
/// <amd-module name="@scom/scom-governance-staking/api.ts" />
declare module "@scom/scom-governance-staking/api.ts" {
    import { State } from "@scom/scom-governance-staking/store/index.ts";
    export function getMinStakePeriod(state: State): Promise<number>;
    export function getGovState(state: State): Promise<{
        stakedBalance: number;
        lockTill: any;
        votingBalance: number;
        freezeStakeAmount: any;
        freezeStakeTimestamp: any;
    }>;
}
/// <amd-module name="@scom/scom-governance-staking" />
declare module "@scom/scom-governance-staking" {
    import { Control, ControlElement, Module } from '@ijstech/components';
    import { INetworkConfig } from '@scom/scom-network-picker';
    import { IWalletPlugin } from '@scom/scom-wallet-modal';
    import { IGovernanceStaking } from "@scom/scom-governance-staking/interface.ts";
    interface ScomGovernanceStakingElement extends ControlElement {
        lazyLoad?: boolean;
        networks: INetworkConfig[];
        wallets: IWalletPlugin[];
        defaultChainId?: number;
        showHeader?: boolean;
    }
    global {
        namespace JSX {
            interface IntrinsicElements {
                ['i-scom-governance-staking']: ScomGovernanceStakingElement;
            }
        }
    }
    export default class ScomGovernanceStaking extends Module {
        private dappContainer;
        private loadingElm;
        private lblStakedBalance;
        private lblVotingBalance;
        private pnlLock;
        private comboAction;
        private lblBalance;
        private tokenSelection;
        private pnlAddStake;
        private lblAddStake;
        private lblTotalStakedBalance;
        private lblTotalVotingBalance;
        private iconAvailableOn;
        private lblAvailableOn;
        private btnApprove;
        private btnConfirm;
        private btnConnect;
        private txStatusModal;
        private mdWallet;
        private state;
        private _data;
        tag: any;
        private stakedBalance;
        private votingBalance;
        private availableStake;
        private action;
        private freezedStake;
        private minStakePeriod;
        private allTokenBalancesMap;
        private approvalModelAction;
        private get chainId();
        get defaultChainId(): number;
        set defaultChainId(value: number);
        get wallets(): IWalletPlugin[];
        set wallets(value: IWalletPlugin[]);
        get networks(): INetworkConfig[];
        set networks(value: INetworkConfig[]);
        get showHeader(): boolean;
        set showHeader(value: boolean);
        private get totalStakedBalance();
        private get totalVotingBalance();
        private get OAXWalletBalance();
        private get lastAvailableOn();
        get isBtnDisabled(): boolean;
        get balance(): string;
        removeRpcWalletEvents(): void;
        onHide(): void;
        isEmptyData(value: IGovernanceStaking): boolean;
        init(): Promise<void>;
        private _getActions;
        private getProjectOwnerActions;
        getConfigurators(): any[];
        private getData;
        private setData;
        getTag(): Promise<any>;
        private updateTag;
        private setTag;
        private resetRpcWallet;
        private refreshUI;
        private initWallet;
        private initializeWidgetConfig;
        private initApprovalModelAction;
        private setApprovalSpenderAddress;
        private showResultMessage;
        private connectWallet;
        private updateBalance;
        private handleChangeAction;
        private handleConfirm;
        handleStake(): Promise<void>;
        private onApproveToken;
        onInputAmountChanged(source: Control): void;
        private setMaxBalance;
        private updateAddStakePanel;
        render(): any;
    }
}
