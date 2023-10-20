/// <reference path="@scom/scom-dapp-container/@ijstech/eth-wallet/index.d.ts" />
/// <reference path="@ijstech/eth-wallet/index.d.ts" />
/// <reference path="@ijstech/eth-contract/index.d.ts" />
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
        handleNextFlowStep: (data: any) => Promise<void>;
        handleAddTransactions: (data: any) => Promise<void>;
        handleJumpToStep: (data: any) => Promise<void>;
        handleUpdateStepStatus: (data: any) => Promise<void>;
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
    export function formatNumber(value: number | string, decimalFigures?: number): string;
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
    export type ActionType = "add" | "remove";
    export interface IGovernanceStaking extends IGovernanceStakingFlow {
        wallets: IWalletPlugin[];
        networks: INetworkConfig[];
        defaultChainId?: number;
        showHeader?: boolean;
        tokenInputValue?: string;
        action?: ActionType;
    }
    interface IGovernanceStakingFlow {
        isFlow?: boolean;
        prevStep?: string;
        fromToken?: string;
        toToken?: string;
    }
}
/// <amd-module name="@scom/scom-governance-staking/index.css.ts" />
declare module "@scom/scom-governance-staking/index.css.ts" {
    const _default_2: string;
    export default _default_2;
}
/// <amd-module name="@scom/scom-governance-staking/api.ts" />
declare module "@scom/scom-governance-staking/api.ts" {
    import { BigNumber } from "@ijstech/eth-wallet";
    import { State } from "@scom/scom-governance-staking/store/index.ts";
    export function doStake(state: State, amount: BigNumber | number | string): Promise<import("@ijstech/eth-contract").TransactionReceipt>;
    export function doUnstake(state: State, amount: BigNumber | number | string): Promise<import("@ijstech/eth-contract").TransactionReceipt>;
    export function doUnlockStake(state: State): Promise<import("@ijstech/eth-contract").TransactionReceipt>;
    export function getMinStakePeriod(state: State): Promise<number>;
    export const stakeOf: (state: State, address: string) => Promise<BigNumber>;
    export function getGovState(state: State): Promise<{
        stakedBalance: string;
        lockTill: number;
        votingBalance: string;
        freezeStakeAmount: string;
        freezeStakeTimestamp: number;
    }>;
    export function getVotingValue(state: State, param1: any): Promise<{
        minExeDelay?: number;
        minVoteDuration?: number;
        maxVoteDuration?: number;
        minOaxTokenToCreateVote?: number;
        minQuorum?: number;
    }>;
}
/// <amd-module name="@scom/scom-governance-staking/formSchema.ts" />
declare module "@scom/scom-governance-staking/formSchema.ts" {
    import ScomNetworkPicker from '@scom/scom-network-picker';
    const _default_3: {
        dataSchema: {
            type: string;
            properties: {
                networks: {
                    type: string;
                    required: boolean;
                    items: {
                        type: string;
                        properties: {
                            chainId: {
                                type: string;
                                enum: number[];
                                required: boolean;
                            };
                        };
                    };
                };
            };
        };
        uiSchema: {
            type: string;
            elements: {
                type: string;
                scope: string;
                options: {
                    detail: {
                        type: string;
                    };
                };
            }[];
        };
        customControls(): {
            '#/properties/networks/properties/chainId': {
                render: () => ScomNetworkPicker;
                getData: (control: ScomNetworkPicker) => number;
                setData: (control: ScomNetworkPicker, value: number) => void;
            };
        };
    };
    export default _default_3;
}
/// <amd-module name="@scom/scom-governance-staking/flow/initialSetup.tsx" />
declare module "@scom/scom-governance-staking/flow/initialSetup.tsx" {
    import { Button, Control, ControlElement, Module } from "@ijstech/components";
    import { State } from "@scom/scom-governance-staking/store/index.ts";
    interface ScomGovernanceStakingFlowInitialSetupElement extends ControlElement {
        data?: any;
    }
    global {
        namespace JSX {
            interface IntrinsicElements {
                ['i-scom-governance-staking-flow-initial-setup']: ScomGovernanceStakingFlowInitialSetupElement;
            }
        }
    }
    export default class ScomGovernanceStakingFlowInitialSetup extends Module {
        private lblConnectedStatus;
        private btnConnectWallet;
        private btnStake;
        private btnUnstake;
        private lblStakeMsg;
        private tokenInput;
        private mdWallet;
        private _state;
        private tokenRequirements;
        private executionProperties;
        private walletEvents;
        private action;
        get state(): State;
        set state(value: State);
        private get rpcWallet();
        private get chainId();
        private resetRpcWallet;
        setData(value: any): Promise<void>;
        private initWallet;
        private initializeWidgetConfig;
        connectWallet(): Promise<void>;
        private updateConnectStatus;
        private registerEvents;
        onHide(): void;
        init(): void;
        handleClickAction(target: Button): void;
        private handleClickStart;
        render(): any;
        handleFlowStage(target: Control, stage: string, options: any): Promise<{
            widget: ScomGovernanceStakingFlowInitialSetup;
        }>;
    }
}
/// <amd-module name="@scom/scom-governance-staking" />
declare module "@scom/scom-governance-staking" {
    import { Control, ControlElement, Module, Container } from '@ijstech/components';
    import { INetworkConfig } from '@scom/scom-network-picker';
    import { IWalletPlugin } from '@scom/scom-wallet-modal';
    import { ActionType, IGovernanceStaking } from "@scom/scom-governance-staking/interface.ts";
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
        private lblFreezedStake;
        private mdUnlock;
        private lblAvailVotingBalance;
        private btnLock;
        private lblStakeSettingStatus1;
        private lblStakeSettingStatus2;
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
        private pnlActionButtons;
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
        get isUnlockVotingBalanceDisabled(): boolean;
        get isBtnDisabled(): boolean;
        get balance(): string;
        constructor(parent?: Container, options?: ControlElement);
        removeRpcWalletEvents(): void;
        onHide(): void;
        isEmptyData(value: IGovernanceStaking): boolean;
        init(): Promise<void>;
        private _getActions;
        private getProjectOwnerActions;
        getConfigurators(): ({
            name: string;
            target: string;
            getProxySelectors: (chainId: number) => Promise<any[]>;
            getActions: () => any[];
            getData: any;
            setData: (data: any) => Promise<void>;
            getTag: any;
            setTag: any;
        } | {
            name: string;
            target: string;
            getActions: any;
            getData: any;
            setData: (data: any) => Promise<void>;
            getTag: any;
            setTag: any;
            getProxySelectors?: undefined;
        } | {
            name: string;
            target: string;
            getData: () => Promise<{
                wallets: IWalletPlugin[];
                networks: INetworkConfig[];
                defaultChainId?: number;
                showHeader?: boolean;
                tokenInputValue?: string;
                action?: ActionType;
                isFlow?: boolean;
                prevStep?: string;
                fromToken?: string;
                toToken?: string;
            }>;
            setData: (properties: IGovernanceStaking, linkParams?: Record<string, any>) => Promise<void>;
            getTag: any;
            setTag: any;
            getProxySelectors?: undefined;
            getActions?: undefined;
        })[];
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
        private toggleUnlockModal;
        private getAddVoteBalanceErrMsg;
        private addVoteBalance;
        private handleConfirm;
        handleStake(): Promise<void>;
        private onApproveToken;
        onInputAmountChanged(source: Control): void;
        private setMaxBalance;
        private updateLockPanel;
        private updateAddStakePanel;
        render(): any;
        handleFlowStage(target: Control, stage: string, options: any): Promise<{
            widget: any;
        }>;
    }
}
