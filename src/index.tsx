import {
    application,
    Button,
    ComboBox,
    Control,
    ControlElement,
    customElements,
    HStack,
    Input,
    Label,
    Module,
    Panel,
    Styles,
    VStack,
    moment,
    IComboItem,
    Icon,
    Modal,
    Container
} from '@ijstech/components';
import ScomDappContainer from '@scom/scom-dapp-container';
import Assets from './assets';
import { INetworkConfig } from '@scom/scom-network-picker';
import ScomWalletModal, { IWalletPlugin } from '@scom/scom-wallet-modal';
import ScomTxStatusModal from '@scom/scom-tx-status-modal';
import { formatNumber, isClientWalletConnected, State } from './store/index';
import configData from './data.json';
import { ActionType, IGovernanceStaking } from './interface';
import { BigNumber, Constants, IERC20ApprovalAction, TransactionReceipt, Utils, Wallet } from '@ijstech/eth-wallet';
import customStyles from './index.css';
import { ITokenObject, tokenStore } from '@scom/scom-token-list';
import ScomTokenInput from '@scom/scom-token-input';
import { doStake, doUnstake, doUnlockStake, getGovState, getMinStakePeriod, getVotingValue, stakeOf } from './api';
import formSchema from './formSchema';
import ScomGovernanceStakingFlowInitialSetup from './flow/initialSetup';

const Theme = Styles.Theme.ThemeVars;

const actionOptions = [
    {
        value: 'add',
        label: 'Add Stake'
    },
    {
        value: 'remove',
        label: 'Remove Stake'
    }
];

interface ScomGovernanceStakingElement extends ControlElement {
    lazyLoad?: boolean;
    networks: INetworkConfig[];
    wallets: IWalletPlugin[];
    defaultChainId?: number;
    showHeader?: boolean;
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            ['i-scom-governance-staking']: ScomGovernanceStakingElement;
        }
    }
}

@customElements('i-scom-governance-staking')
export default class ScomGovernanceStaking extends Module {
    private dappContainer: ScomDappContainer;
    private loadingElm: Panel;
    private lblStakedBalance: Label;
    private lblVotingBalance: Label;
    private pnlLock: HStack;
    private lblFreezedStake: Label;
    private mdUnlock: Modal;
    private lblAvailVotingBalance: Label;
    private btnLock: Button;
    private lblStakeSettingStatus1: Label;
    private lblStakeSettingStatus2: Label;
    private comboAction: ComboBox;
    private lblBalance: Label;
    private tokenSelection: ScomTokenInput;
    private pnlAddStake: VStack;
    private lblAddStake: Label;
    private lblTotalStakedBalance: Label;
    private lblTotalVotingBalance: Label;
    private iconAvailableOn: Icon;
    private lblAvailableOn: Label;
    private btnApprove: Button;
    private btnConfirm: Button;
    private btnConnect: Button;
    private pnlActionButtons: HStack;
    private txStatusModal: ScomTxStatusModal;
    private mdWallet: ScomWalletModal;
    private state: State;
    private _data: IGovernanceStaking = {
        wallets: [],
        networks: []
    };
    tag: any = {};
    private stakedBalance: string = '0';
    private votingBalance: string = '0';
    private availableStake: string = '0';
    private action: ActionType = "add";
    private freezedStake: any = {};
    private minStakePeriod: number = 0;
    private allTokenBalancesMap: any;
    private approvalModelAction: IERC20ApprovalAction;

    private get chainId() {
        return this.state.getChainId();
    }

    get defaultChainId() {
        return this._data.defaultChainId;
    }

    set defaultChainId(value: number) {
        this._data.defaultChainId = value;
    }

    get wallets() {
        return this._data.wallets ?? [];
    }
    set wallets(value: IWalletPlugin[]) {
        this._data.wallets = value;
    }

    get networks() {
        return this._data.networks ?? [];
    }
    set networks(value: INetworkConfig[]) {
        this._data.networks = value;
    }

    get showHeader() {
        return this._data.showHeader ?? true;
    }
    set showHeader(value: boolean) {
        this._data.showHeader = value;
    }

    private get totalStakedBalance(): string {
        if (this.action === 'add') {
            return new BigNumber(this.stakedBalance).plus(this.tokenSelection.value ? this.tokenSelection.value : 0).toFixed();
        } else {
            return new BigNumber(this.stakedBalance).minus(this.tokenSelection.value ? this.tokenSelection.value : 0).toFixed();
        }
    }

    private get totalVotingBalance(): string {
        if (this.action === 'add')
            return this.votingBalance;
        if (new BigNumber(this.tokenSelection.value || 0).gte(this.freezedStake.amount))
            return this.totalStakedBalance;
        return this.votingBalance;
    }

    private get OAXWalletBalance(): number {
        const token = this.state.getGovToken(this.chainId);
        if (token) {
            const address = token?.address || "";
            return address ? this.allTokenBalancesMap[address.toLowerCase()] ?? 0 : this.allTokenBalancesMap[token.symbol] || 0;
        } else {
            return 0;
        }
    }

    private get lastAvailableOn() {
        return moment(new Date())
            .add(this.minStakePeriod, 'second')
            .format('MMM DD, YYYY');
    }

    get isUnlockVotingBalanceDisabled() {
        return new BigNumber(this.freezedStake.amount).eq(0) || this.freezedStake.timestamp == 0 || moment(this.freezedStake.lockTill).isAfter(new Date());
    }

    get isBtnDisabled() {
        const bal = new BigNumber(this.balance);
        const val = new BigNumber(this.tokenSelection.value || 0);
        return val.lte(0) || val.gt(bal) || !this.action;
    }

    get balance() {
        if (this.action === 'remove') {
            return new BigNumber(this.stakedBalance).toFixed();
        }
        if (this.action === 'add') {
            return new BigNumber(this.OAXWalletBalance).toFixed();
        }
        return new BigNumber(0).toFixed();
    }

    constructor(parent?: Container, options?: ControlElement) {
        super(parent, options);
        this.state = new State(configData);
    }

    removeRpcWalletEvents() {
        const rpcWallet = this.state.getRpcWallet();
        if (rpcWallet) rpcWallet.unregisterAllWalletEvents();
    }

    onHide() {
        this.dappContainer.onHide();
        this.removeRpcWalletEvents();
    }

    isEmptyData(value: IGovernanceStaking) {
        return !value || !value.networks || value.networks.length === 0;
    }

    async init() {
        this.isReadyCallbackQueued = true;
        super.init();
        const lazyLoad = this.getAttribute('lazyLoad', true, false);
        if (!lazyLoad) {
            const networks = this.getAttribute('networks', true);
            const wallets = this.getAttribute('wallets', true);
            const defaultChainId = this.getAttribute('defaultChainId', true);
            const showHeader = this.getAttribute('showHeader', true);
            const data: IGovernanceStaking = {
                networks,
                wallets,
                defaultChainId,
                showHeader
            }
            if (!this.isEmptyData(data)) {
                await this.setData(data);
            }
        }
        this.loadingElm.visible = false;
        this.isReadyCallbackQueued = false;
        this.executeReadyCallback();
    }

    private _getActions(category?: string) {
        const actions: any[] = [];
        if (category && category !== 'offers') {
            actions.push({
                name: 'Edit',
                icon: 'edit',
                command: (builder: any, userInputData: any) => {
                    let oldData: IGovernanceStaking = {
                        wallets: [],
                        networks: []
                    };
                    let oldTag = {};
                    return {
                        execute: () => {
                            oldData = JSON.parse(JSON.stringify(this._data));
                            const { networks } = userInputData;
                            const themeSettings = {};;
                            this._data.networks = networks;
                            this._data.defaultChainId = this._data.networks[0].chainId;
                            this.resetRpcWallet();
                            this.refreshUI();
                            if (builder?.setData)
                                builder.setData(this._data);

                            oldTag = JSON.parse(JSON.stringify(this.tag));
                            if (builder?.setTag)
                                builder.setTag(themeSettings);
                            else
                                this.setTag(themeSettings);
                            if (this.dappContainer)
                                this.dappContainer.setTag(themeSettings);
                        },
                        undo: () => {
                            this._data = JSON.parse(JSON.stringify(oldData));
                            this.refreshUI();
                            if (builder?.setData)
                                builder.setData(this._data);

                            this.tag = JSON.parse(JSON.stringify(oldTag));
                            if (builder?.setTag)
                                builder.setTag(this.tag);
                            else
                                this.setTag(this.tag);
                            if (this.dappContainer)
                                this.dappContainer.setTag(this.tag);
                        },
                        redo: () => { }
                    }
                },
                userInputDataSchema: formSchema.dataSchema,
                userInputUISchema: formSchema.uiSchema,
                customControls: formSchema.customControls()
            });
        }
        return actions;
    }

    private getProjectOwnerActions() {
        const actions: any[] = [
            {
                name: 'Settings',
                userInputDataSchema: formSchema.dataSchema,
                userInputUISchema: formSchema.uiSchema,
                customControls: formSchema.customControls()
            }
        ];
        return actions;
    }

    getConfigurators() {
        return [
            {
                name: 'Project Owner Configurator',
                target: 'Project Owners',
                getProxySelectors: async (chainId: number) => {
                    return [];
                },
                getActions: () => {
                    return this.getProjectOwnerActions();
                },
                getData: this.getData.bind(this),
                setData: async (data: any) => {
                    await this.setData(data);
                },
                getTag: this.getTag.bind(this),
                setTag: this.setTag.bind(this)
            },
            {
                name: 'Builder Configurator',
                target: 'Builders',
                getActions: this._getActions.bind(this),
                getData: this.getData.bind(this),
                setData: async (data: any) => {
                    const defaultData = configData.defaultBuilderData;
                    await this.setData({ ...defaultData, ...data });
                },
                getTag: this.getTag.bind(this),
                setTag: this.setTag.bind(this)
            },
            {
                name: 'Embedder Configurator',
                target: 'Embedders',
                getData: async () => {
                    return { ...this._data }
                },
                setData: async (properties: IGovernanceStaking, linkParams?: Record<string, any>) => {
                    let resultingData = {
                      ...properties
                    };
                    if (!properties.defaultChainId && properties.networks?.length) {
                        resultingData.defaultChainId = properties.networks[0].chainId;
                    }
                    await this.setData(resultingData);
                },
                getTag: this.getTag.bind(this),
                setTag: this.setTag.bind(this)
            }
        ];
    }

    private getData() {
        return this._data;
    }

    private async setData(data: IGovernanceStaking) {
        this._data = data;
        this.resetRpcWallet();
        if (!this.approvalModelAction) this.initApprovalModelAction();
        this.setApprovalSpenderAddress();
        await this.refreshUI();
    }

    async getTag() {
        return this.tag;
    }

    private updateTag(type: 'light' | 'dark', value: any) {
        this.tag[type] = this.tag[type] ?? {};
        for (let prop in value) {
            if (value.hasOwnProperty(prop))
                this.tag[type][prop] = value[prop];
        }
    }

    private setTag(value: any) {
        const newValue = value || {};
        for (let prop in newValue) {
            if (newValue.hasOwnProperty(prop)) {
                if (prop === 'light' || prop === 'dark')
                    this.updateTag(prop, newValue[prop]);
                else
                    this.tag[prop] = newValue[prop];
            }
        }
        if (this.dappContainer)
            this.dappContainer.setTag(this.tag);
    }

    private resetRpcWallet() {
        this.removeRpcWalletEvents();
        const rpcWalletId = this.state.initRpcWallet(this.defaultChainId);
        const rpcWallet = this.state.getRpcWallet();
        const chainChangedEvent = rpcWallet.registerWalletEvent(this, Constants.RpcWalletEvent.ChainChanged, async (chainId: number) => {
            this.setApprovalSpenderAddress();
            this.refreshUI();
        });
        const connectedEvent = rpcWallet.registerWalletEvent(this, Constants.RpcWalletEvent.Connected, async (connected: boolean) => {
            this.setApprovalSpenderAddress();
            this.refreshUI();
        });
        const data: any = {
            defaultChainId: this.defaultChainId,
            wallets: this.wallets,
            networks: this.networks,
            showHeader: this.showHeader,
            rpcWalletId: rpcWallet.instanceId
        };
        if (this.dappContainer?.setData) this.dappContainer.setData(data);
    }

    private async refreshUI() {
        await this.initializeWidgetConfig();
    }

    private initWallet = async () => {
        try {
            await Wallet.getClientInstance().init();
            const rpcWallet = this.state.getRpcWallet();
            await rpcWallet.init();
        } catch (err) {
            console.log(err);
        }
    }
    private initializeWidgetConfig = async () => {
        setTimeout(async () => {
            const chainId = this.chainId;
            await this.initWallet();
            await this.updateBalance();
            this.tokenSelection.chainId = chainId;
            this.tokenSelection.token = this.state.getGovToken(chainId);
            if (this._data.action) {
                this.comboAction.selectedItem = actionOptions.find(action => action.value === this._data.action);
                this.action = this._data.action || 'add';
            }
            if (this._data.tokenInputValue) {
                this.tokenSelection.value = this._data.tokenInputValue;
            }
            const connected = isClientWalletConnected();
            if (!connected || !this.state.isRpcWalletConnected()) {
                this.btnConnect.caption = connected ? "Switch Network" : "Connect Wallet";
                this.btnConnect.visible = true;
                this.btnConnect.enabled = true;
                this.pnlActionButtons.visible = false;
            } else {
                this.btnConnect.visible = false;
                this.btnConnect.enabled = false;
                this.pnlActionButtons.visible = true;
            }
            const token = this.state.getGovToken(this.chainId);
            this.approvalModelAction.checkAllowance(token, this.tokenSelection.value);
            try {
                if (connected) {
                    this.minStakePeriod = await getMinStakePeriod(this.state);
                    const govState = await getGovState(this.state);
                    this.freezedStake = {
                        amount: govState.freezeStakeAmount,
                        lockTill: govState.lockTill,
                        timestamp: govState.freezeStakeTimestamp
                    }
                    this.stakedBalance = govState.stakedBalance;
                    this.votingBalance = govState.votingBalance;
                    this.availableStake = `${moment(govState.lockTill).format('DD MMM YYYY')} at ${moment(govState.lockTill).format(
                        'HH:mm',
                    )}`;
                    this.lblStakedBalance.caption = formatNumber(this.stakedBalance);
                    this.lblVotingBalance.caption = formatNumber(this.votingBalance);
                }
            } catch (err) {
                console.log(err)
            }
            this.lblBalance.caption = `Balance: ${formatNumber(this.balance)}`;
            this.updateLockPanel();
            this.updateAddStakePanel();
        });
    }

    private async initApprovalModelAction() {
        this.approvalModelAction = await this.state.setApprovalModelAction({
            sender: this,
            payAction: this.handleStake,
            onToBeApproved: async (token: ITokenObject) => {
                this.btnApprove.visible = true;
                this.btnApprove.enabled = true;
                this.btnConfirm.visible = false;
            },
            onToBePaid: async (token: ITokenObject) => {
                this.btnApprove.visible = false;
                this.btnConfirm.visible = true;
                this.btnConfirm.enabled = !this.isBtnDisabled;
            },
            onApproving: async (token: ITokenObject, receipt?: string) => {
                this.btnApprove.rightIcon.spin = true;
                this.btnApprove.rightIcon.visible = true;
                this.btnApprove.caption = `Approving ${token.symbol}`;
                if (receipt)
                    this.showResultMessage('success', receipt);
            },
            onApproved: async (token: ITokenObject) => {
                this.btnApprove.rightIcon.visible = false;
                this.btnApprove.caption = 'Approve';
            },
            onApprovingError: async (token: ITokenObject, err: Error) => {
                this.showResultMessage('error', err);
                this.btnApprove.caption = 'Approve';
                this.btnApprove.rightIcon.visible = false;
            },
            onPaying: async (receipt?: string) => {
                if (receipt) {
                    this.showResultMessage('success', receipt);
                    this.btnConfirm.enabled = false;
                    this.btnConfirm.rightIcon.spin = true;
                    this.btnConfirm.rightIcon.visible = true;
                }
            },
            onPaid: async (data?: any, receipt?: TransactionReceipt) => {
                this.btnConfirm.rightIcon.visible = false;
                this.tokenSelection.value = '0';
                this.refreshUI();
            },
            onPayingError: async (err: Error) => {
                this.showResultMessage('error', err);
            }
        });
    }

    private setApprovalSpenderAddress() {
        if (!this.state.approvalModel) return;
        this.state.approvalModel.spenderAddress = this.state.getAddresses().OAXDEX_Governance;
    }

    private showResultMessage = (status: 'warning' | 'success' | 'error', content?: string | Error) => {
        if (!this.txStatusModal) return;
        let params: any = { status };
        if (status === 'success') {
            params.txtHash = content;
        } else {
            params.content = content;
        }
        this.txStatusModal.message = { ...params };
        this.txStatusModal.showModal();
    }

    private connectWallet = async () => {
        if (!isClientWalletConnected()) {
            if (this.mdWallet) {
                await application.loadPackage('@scom/scom-wallet-modal', '*');
                this.mdWallet.networks = this.networks;
                this.mdWallet.wallets = this.wallets;
                this.mdWallet.showModal();
            }
            return;
        }
        if (!this.state.isRpcWalletConnected()) {
            const clientWallet = Wallet.getClientInstance();
            await clientWallet.switchNetwork(this.chainId);
        }
    }

    private async updateBalance() {
        const rpcWallet = this.state.getRpcWallet();
        if (rpcWallet.address) {
            if (!this.isEmptyData(this._data)) await tokenStore.updateTokenBalancesByChainId(this.chainId);
            let tokenBalances = tokenStore.getTokenBalancesByChainId(this.chainId);
            this.allTokenBalancesMap = tokenBalances || {};
        } else {
            this.allTokenBalancesMap = {};
        }
    }

    private handleChangeAction(source: Control) {
        this.tokenSelection.value = null;
        this.action = ((source as ComboBox).selectedItem as IComboItem).value as ActionType;
        this.lblBalance.caption = `Balance: ${formatNumber(this.balance)}`;
        this.updateAddStakePanel();
    }

    private toggleUnlockModal() {
        this.updateLockPanel();
        this.mdUnlock.visible = !this.mdUnlock.visible
    }

    private getAddVoteBalanceErrMsg(err: any) {
        const processError = (err: any) => {
            if (err) {
                if (!err.code) {
                    try {
                        return JSON.parse(err.message.substr(err.message.indexOf('{')));
                    } catch (moreErr) {
                        err = { code: 777, message: "Unknown Error" };
                    }
                } else {
                    return err;
                }
            } else {
                return { code: 778, message: "Error is Empty" };
            }
        }
        let errorContent = '';
        err = processError(err);
        switch (err.message) {
            case 'Transaction was not mined within 50 blocks, please make sure your transaction was properly sent. Be aware that it might still be mined!':
                console.log('@Implement: A proper way handling this error');
                break;
            case 'Govenence: Nothing to stake':
                errorContent = 'You have nothing to stake';
                break;
            case 'execution reverted: Governance: Freezed period not passed':
                errorContent = 'Freezed period not passed';
                break;
            case 'execution reverted: Governance: insufficient balance':
                errorContent = 'Insufficient balance';
                break;
            default:
                switch (err.code) {
                    case 4001:
                        errorContent = 'Transaction rejected by the user.';
                        break;
                    case 3:
                        errorContent = 'Unlock value exceed locked fund';
                        break;
                    case 778: //custom error code: error is empty
                    case 777: //custom error code: err.code is undefined AND went error again while JSON.parse
                }
        }
        return errorContent;
    }

    private async addVoteBalance() {
        if (this.isUnlockVotingBalanceDisabled) return;
        try {
            this.showResultMessage('warning', 'You have staked!');
            const token = this.state.getGovToken(this.chainId);
            const receipt = await doUnlockStake(this.state);
            const amount = Utils.toDecimals(this.freezedStake.amount, token.decimals).toString();
            const wallet = this.state.getRpcWallet();
            if (receipt) {
                this.showResultMessage('success', receipt.transactionHash);
                if (this.state.handleAddTransactions) {
                    const timestamp = await wallet.getBlockTimestamp(receipt.blockNumber.toString());
                    const transactionsInfoArr = [
                        {
                            desc: `Unlock ${token.symbol}`,
                            fromToken: token,
                            toToken: null,
                            fromTokenAmount: amount,
                            toTokenAmount: '-',
                            hash: receipt.transactionHash,
                            timestamp
                        }
                    ];
                    this.state.handleAddTransactions({
                        list: transactionsInfoArr
                    });
                }
            }
            if (this.state.handleJumpToStep && this._data.isFlow && this._data.prevStep =='scom-group-queue-pair') {
                const paramValueObj = await getVotingValue(this.state, 'vote');
                const minThreshold = paramValueObj.minOaxTokenToCreateVote;
                const votingBalance = (await stakeOf(this.state, wallet.account.address)).toNumber();
                if (votingBalance >= minThreshold) {
                    this.state.handleJumpToStep({
                        widgetName: 'scom-governance-proposal',
                        executionProperties: {
                            fromToken: this._data.fromToken,
                            toToken: this._data.toToken,
                            isFlow: true
                        }
                    })
                }
            }
            this.refreshUI();
        } catch (error) {
            console.error('unlockStake', error);
            let errMsg = this.getAddVoteBalanceErrMsg(error);
            this.showResultMessage('error', errMsg);
        }
    }

    private handleConfirm = async () => {
        this.approvalModelAction.doPayAction();
    }

    async handleStake() {
        if (this.isBtnDisabled) return;
        const value = formatNumber(this.tokenSelection.value);
        const content = `${this.action === 'add' ? "Adding" : "Removing"} ${value} Staked Balance`;
        this.showResultMessage('warning', content);
        let receipt;
        const token = this.state.getGovToken(this.chainId);
        const amount = Utils.toDecimals(this.tokenSelection.value, token.decimals).toString();
        if (this.action === 'add') {
            receipt = await doStake(this.state, this.tokenSelection.value);
        } else {
            receipt = await doUnstake(this.state, this.tokenSelection.value);
        }
        if (this.state.handleAddTransactions) {
            const timestamp = await this.state.getRpcWallet().getBlockTimestamp(receipt.blockNumber.toString());
            const transactionsInfoArr = [
                {
                    desc: `${this.action === 'add' ? 'Stake' : 'Unstake'} ${token.symbol}`,
                    fromToken: token,
                    toToken: null,
                    fromTokenAmount: amount,
                    toTokenAmount: '-',
                    hash: receipt.transactionHash,
                    timestamp
                }
            ];
            this.state.handleAddTransactions({
                list: transactionsInfoArr
            });
        }
    }

    private onApproveToken = async () => {
        this.showResultMessage('warning', 'Approving');
        const token = this.state.getGovToken(this.chainId);
        this.approvalModelAction.doApproveAction(token, this.tokenSelection.value);
    }

    onInputAmountChanged(source: Control) {
        const val = (source as Input).value;
        if (val && val < 0) {
            this.tokenSelection.value = null
        }
        this.updateAddStakePanel();
        const token = this.state.getGovToken(this.chainId);
        this.approvalModelAction.checkAllowance(token, this.tokenSelection.value);
    }

    private setMaxBalance() {
        this.tokenSelection.value = this.balance;
        this.updateAddStakePanel();
        const token = this.state.getGovToken(this.chainId);
        this.approvalModelAction.checkAllowance(token, this.tokenSelection.value);
    }

    private updateLockPanel() {
        this.pnlLock.visible = this.freezedStake.timestamp > 0;
        if (!this.pnlLock.visible) return;
        this.lblFreezedStake.caption = this.freezedStake.amount + " Staked Balance available to add";
        this.lblAvailVotingBalance.caption = !this.freezedStake || new BigNumber(this.freezedStake.amount).eq(0) ? 'Unavailable stake' : this.availableStake;
        this.btnLock.caption = this.isUnlockVotingBalanceDisabled ? "Lock" : "Unlock";
        this.btnLock.icon.name = this.isUnlockVotingBalanceDisabled ? "lock" : "lock-open";
        this.btnLock.enabled = !this.isUnlockVotingBalanceDisabled;
        const tokenSymbol = this.state.getGovToken(this.chainId)?.symbol || '';
        if (!this.isUnlockVotingBalanceDisabled) {
            this.lblStakeSettingStatus1.caption = "Currently you can move to Voting Balance:";
            this.lblStakeSettingStatus2.caption = `${formatNumber(this.freezedStake.amount)} ${tokenSymbol}`;
        } else if (new BigNumber(this.freezedStake.amount).eq(0)) {
            this.lblStakeSettingStatus1.caption = "Stake some tokens to your Staked Balance";
            this.lblStakeSettingStatus2.caption = `Wallet Balance: ${formatNumber(this.OAXWalletBalance)} ${tokenSymbol}`;
        } else {
            this.lblStakeSettingStatus1.caption = "Currently your Staked Balance:";
            this.lblStakeSettingStatus2.caption = `${formatNumber(this.stakedBalance)} ${tokenSymbol}`;
        }
    }

    private updateAddStakePanel() {
        this.lblAddStake.caption = this.action === "add" ? "Add Stake" : "Remove Stake";
        this.lblTotalStakedBalance.caption = formatNumber(this.totalStakedBalance);
        this.lblTotalVotingBalance.caption = formatNumber(this.totalVotingBalance);
        this.iconAvailableOn.tooltip.content = "Available on " + this.lastAvailableOn;
        this.lblAvailableOn.caption = this.lastAvailableOn;
        this.pnlAddStake.visible = isClientWalletConnected();
        this.btnConfirm.caption = this.action === 'add' ? 'Add' : 'Remove';
        this.btnApprove.enabled = !this.isBtnDisabled;
        this.btnConfirm.enabled = !this.isBtnDisabled;
    }

    render() {
        return (
            <i-scom-dapp-container id="dappContainer">
                <i-panel class={customStyles} background={{ color: Theme.background.main }}>
                    <i-panel>
                        <i-vstack id="loadingElm" class="i-loading-overlay">
                            <i-vstack class="i-loading-spinner" horizontalAlignment="center" verticalAlignment="center">
                                <i-icon
                                    class="i-loading-spinner_icon"
                                    image={{ url: Assets.fullPath('img/loading.svg'), width: 36, height: 36 }}
                                />
                                <i-label
                                    caption="Loading..." font={{ color: '#FD4A4C', size: '1.5em' }}
                                    class="i-loading-spinner_text"
                                />
                            </i-vstack>
                        </i-vstack>
                        <i-vstack
                            width="100%"
                            height="100%"
                            maxWidth={440}
                            padding={{ top: "1rem", bottom: "1rem", left: "1rem", right: "1rem" }}
                            margin={{ left: 'auto', right: 'auto' }}
                            gap="1rem"
                        >
                            <i-hstack width="100%" horizontalAlignment="center" margin={{ top: "1rem", bottom: "1rem" }}>
                                <i-label caption="Manage Stake" font={{ size: '1rem', bold: true, color: Theme.text.third }}></i-label>
                            </i-hstack>
                            <i-vstack gap="1rem">
                                <i-hstack verticalAlignment="center" horizontalAlignment="space-between">
                                    <i-label caption="Staked Balance" font={{ size: "0.875rem" }}></i-label>
                                    <i-label id="lblStakedBalance" class="balance-label" width="50%" caption="0" font={{ size: "0.875rem" }}></i-label>
                                </i-hstack>
                                <i-hstack id="pnlLock" position="relative" visible={false}>
                                    <i-hstack verticalAlignment="center" gap={10}>
                                        <i-label id="lblFreezedStake" font={{ color: Theme.colors.primary.main, size: '0.875rem' }}></i-label>
                                        <i-panel>
                                            <i-button
                                                class="btn-os"
                                                height="auto"
                                                padding={{ top: '0.2rem', bottom: '0.2rem', left: '0.5rem', right: '0.5rem' }}
                                                caption="Unlock"
                                                onClick={this.toggleUnlockModal.bind(this)}
                                            ></i-button>
                                        </i-panel>
                                    </i-hstack>
                                    <i-modal
                                        id="mdUnlock"
                                        popupPlacement='bottom'
                                        maxWidth={400}
                                        minWidth={400}
                                        showBackdrop={false}
                                        background={{ color: 'transparent' }}
                                        margin={{ top: -10 }}
                                        height="auto"
                                    >
                                        <i-panel class="custom-shadow" padding={{ top: 20 }}>
                                            <i-panel
                                                class="has-caret"
                                                padding={{ top: 12, bottom: 12, left: 16, right: 16 }}
                                                background={{ color: Theme.background.modal }}
                                                border={{ radius: 4 }}
                                            >
                                                <i-vstack
                                                    padding={{ bottom: '0.5rem' }}
                                                    border={{ bottom: { width: 2, style: 'solid', color: Theme.divider } }}
                                                    gap="0.5rem"
                                                >
                                                    <i-label caption="Stake Setting" font={{ size: '1rem', color: Theme.text.third }}></i-label>
                                                    <i-label font={{ size: '0.875rem' }} caption="You'll be able to move your Staked Balance to Voting Balance; which will give privilage to participate our Polls and Executive Proposals."></i-label>
                                                </i-vstack>
                                                <i-hstack
                                                    padding={{ top: '0.5rem', bottom: '0.5rem' }}
                                                    border={{ bottom: { width: 2, style: 'solid', color: Theme.divider } }}
                                                    horizontalAlignment="space-between"
                                                    gap="0.5rem"
                                                >
                                                    <i-vstack gap="0.5rem">
                                                        <i-label caption="Voting Balance Available" font={{ size: '1rem', color: Theme.text.third }}></i-label>
                                                        <i-label id="lblAvailVotingBalance" font={{ size: '0.875rem' }}></i-label>
                                                    </i-vstack>
                                                    <i-panel>
                                                        <i-button
                                                            id="btnLock"
                                                            class="btn-os"
                                                            height="auto"
                                                            padding={{ top: '0.75rem', bottom: '0.75rem', left: '1.5rem', right: '1.5rem' }}
                                                            caption="Lock"
                                                            icon={{ width: 16, height: 16, name: 'lock', fill: '#fff' }}
                                                            enabled={false}
                                                            onClick={this.addVoteBalance.bind(this)}
                                                        ></i-button>
                                                    </i-panel>
                                                </i-hstack>
                                                <i-vstack padding={{ top: '0.5rem' }} gap="0.5rem">
                                                    <i-label id="lblStakeSettingStatus1" font={{ size: '1rem', color: Theme.text.third }}></i-label>
                                                    <i-label id="lblStakeSettingStatus2" font={{ size: '0.875rem' }}></i-label>
                                                </i-vstack>
                                            </i-panel>
                                        </i-panel>
                                    </i-modal>
                                </i-hstack>
                                <i-hstack verticalAlignment="center" horizontalAlignment="space-between">
                                    <i-label caption="Voting Balance" font={{ size: "0.875rem" }}></i-label>
                                    <i-label id="lblVotingBalance" class="balance-label" width="50%" caption="0" font={{ size: "0.875rem" }}></i-label>
                                </i-hstack>
                            </i-vstack>
                            <i-hstack verticalAlignment="center" horizontalAlignment="space-between" >
                                <i-label caption="Action" font={{ size: '0.875rem' }}></i-label>
                                <i-combo-box
                                    id="comboAction"
                                    placeholder="Please select action"
                                    items={actionOptions}
                                    selectedItem={actionOptions[0]}
                                    background={{ color: Theme.background.gradient }}
                                    height={32} minWidth={180} border={{ radius: 10 }}
                                    icon={{ name: "angle-down", fill: '#fff', width: 12, height: 12 }}
                                    font={{ size: '0.875rem' }}
                                    enabled={true}
                                    onChanged={this.handleChangeAction.bind(this)}
                                    class="custom-combobox"
                                ></i-combo-box>
                            </i-hstack>
                            <i-vstack
                                gap="1rem" margin={{ top: '1rem' }}
                                border={{ radius: 10, width: '1px', style: 'solid', color: '#8f8d8d' }}
                                padding={{ top: '1rem', bottom: '0.5rem', left: '1rem', right: '1rem' }}
                            >
                                <i-vstack gap="1rem" width="100%">
                                    <i-hstack verticalAlignment="center" horizontalAlignment="space-between">
                                        <i-label caption="Input"></i-label>
                                        <i-label id="lblBalance" class="balance-label" width="50%" caption="Balance: 0"></i-label>
                                    </i-hstack>
                                    <i-hstack verticalAlignment="center" horizontalAlignment="space-between">
                                        <i-scom-token-input
                                            id="tokenSelection"
                                            class="custom-token-selection"
                                            width="100%"
                                            isBalanceShown={false}
                                            isBtnMaxShown={true}
                                            isInputShown={true}
                                            tokenReadOnly={true}
                                            placeholder="0.0"
                                            value="0"
                                            onSetMaxBalance={this.setMaxBalance.bind(this)}
                                            onInputAmountChanged={this.onInputAmountChanged.bind(this)}
                                        ></i-scom-token-input>
                                    </i-hstack>
                                </i-vstack>
                            </i-vstack>
                        </i-vstack>
                        <i-vstack
                            id="pnlAddStake"
                            padding={{ top: '1rem', bottom: '1rem', left: '1rem', right: '1rem' }}
                            maxWidth={440}
                            margin={{ left: 'auto', right: 'auto' }}
                            visible={false}
                        >
                            <i-vstack class="none-select" gap="10px">
                                <i-label id="lblAddStake" caption="Add Stake" font={{ size: '1rem', color: Theme.text.third }}></i-label>
                                <i-hstack horizontalAlignment="space-between" verticalAlignment="center">
                                    <i-hstack opacity={0.75} gap="0.5rem">
                                        <i-label caption="Staked Balance" font={{ size: '0.875rem', color: Theme.text.third }}></i-label>
                                        <i-icon
                                            name="question-circle"
                                            fill="#fff" width={14} height={14}
                                            tooltip={{ content: 'Your locked staked. Cannot be used for voting at governance portal.', placement: 'right' }}
                                        ></i-icon>
                                    </i-hstack>
                                    <i-label id="lblTotalStakedBalance" class="balance-label" width="50%" caption="0" font={{ size: '0.875rem', color: Theme.text.third }}></i-label>
                                </i-hstack>
                                <i-hstack horizontalAlignment="space-between" verticalAlignment="center">
                                    <i-hstack opacity={0.75} gap="0.5rem">
                                        <i-label caption="Voting Balance" font={{ size: '0.875rem', color: Theme.text.third }}></i-label>
                                        <i-icon
                                            name="question-circle"
                                            fill="#fff" width={14} height={14}
                                            tooltip={{ content: 'Voting balance allows use to participate at governance portal.', placement: 'right' }}
                                        ></i-icon>
                                    </i-hstack>
                                    <i-label id="lblTotalVotingBalance" class="balance-label" width="50%" caption="0" font={{ size: '0.875rem', color: Theme.text.third }}></i-label>
                                </i-hstack>
                                <i-hstack horizontalAlignment="space-between" verticalAlignment="center">
                                    <i-hstack opacity={0.75} gap="0.5rem">
                                        <i-label caption="Available on" font={{ size: '0.875rem', color: Theme.text.third }}></i-label>
                                        <i-icon
                                            id="iconAvailableOn"
                                            name="question-circle"
                                            fill="#fff" width={14} height={14}
                                            tooltip={{ content: "Available on", placement: 'right' }}
                                        ></i-icon>
                                    </i-hstack>
                                    <i-label id="lblAvailableOn" caption="-" font={{ size: '0.875rem', color: Theme.text.third }}></i-label>
                                </i-hstack>
                            </i-vstack>
                        </i-vstack>
                        <i-vstack
                            class="none-select"
                            padding={{ top: '1rem', bottom: '1rem', left: '1rem', right: '1rem' }}
                            maxWidth={440}
                            margin={{ left: 'auto', right: 'auto' }}
                        >
                            <i-hstack gap="0.5rem">
                                <i-hstack id="pnlActionButtons" width="100%" gap="0.5rem" visible={false}>
                                    <i-button
                                        id="btnApprove"
                                        caption="Approve"
                                        height="auto" width="100%"
                                        padding={{ top: '0.75rem', bottom: '0.75rem', left: '1.5rem', right: '1.5rem' }}
                                        rightIcon={{ spin: true, visible: false }}
                                        class="btn-os"
                                        enabled={false}
                                        visible={false}
                                        onClick={this.onApproveToken.bind(this)}
                                    ></i-button>
                                    <i-button
                                        id="btnConfirm"
                                        caption='Add'
                                        height="auto" width="100%"
                                        padding={{ top: '0.75rem', bottom: '0.75rem', left: '1.5rem', right: '1.5rem' }}
                                        rightIcon={{ spin: true, visible: false }}
                                        enabled={false}
                                        visible={false}
                                        class="btn-os"
                                        onClick={this.handleConfirm.bind(this)}
                                    ></i-button>
                                </i-hstack>
                                <i-button
                                    id="btnConnect"
                                    caption="Connect Wallet"
                                    enabled={false}
                                    visible={false}
                                    width="100%"
                                    padding={{ top: '0.75rem', bottom: '0.75rem', left: '1.5rem', right: '1.5rem' }}
                                    class="btn-os"
                                    onClick={this.connectWallet.bind(this)}
                                ></i-button>
                            </i-hstack>
                        </i-vstack>
                    </i-panel>
                    <i-scom-tx-status-modal id="txStatusModal" />
                    <i-scom-wallet-modal id="mdWallet" wallets={[]} />
                </i-panel>
            </i-scom-dapp-container>
        )
    }
    
    async handleFlowStage(target: Control, stage: string, options: any) {
        let widget;
        if (stage === 'initialSetup') {
            widget = new ScomGovernanceStakingFlowInitialSetup();
            target.appendChild(widget);
            await widget.ready();
            widget.state = this.state;
			let properties = options.properties;
			let tokenRequirements = options.tokenRequirements;
			this.state.handleNextFlowStep = options.onNextStep;
            this.state.handleAddTransactions = options.onAddTransactions;
            this.state.handleJumpToStep = options.onJumpToStep;
			await widget.setData({ 
				executionProperties: properties, 
				tokenRequirements
			});
        } else {
            widget = this;
            target.appendChild(widget);
            await widget.ready();
			let properties = options.properties;
			let tag = options.tag;
            this.state.handleNextFlowStep = options.onNextStep;
            this.state.handleAddTransactions = options.onAddTransactions;
            this.state.handleJumpToStep = options.onJumpToStep;
			await this.setData(properties);
			if (tag) {
				this.setTag(tag);
			}
        }

        return { widget }
    }
}