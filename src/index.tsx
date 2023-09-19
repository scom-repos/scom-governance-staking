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
    FormatUtils,
    moment,
    IComboItem,
    Icon
} from '@ijstech/components';
import ScomDappContainer from '@scom/scom-dapp-container';
import Assets from './assets';
import { INetworkConfig } from '@scom/scom-network-picker';
import ScomWalletModal, { IWalletPlugin } from '@scom/scom-wallet-modal';
import ScomTxStatusModal from '@scom/scom-tx-status-modal';
import { isClientWalletConnected, State } from './store/index';
import configData from './data.json';
import { IGovernanceStaking } from './interface';
import { BigNumber, Constants, Wallet } from '@ijstech/eth-wallet';
import customStyles from './index.css';
import { tokenStore } from '@scom/scom-token-list';
import ScomTokenInput from '@scom/scom-token-input';
import { getGovState, getMinStakePeriod } from './api';

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

type ActionType = "add" | "remove";

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
    private txStatusModal: ScomTxStatusModal;
    private mdWallet: ScomWalletModal;
    private state: State;
    private _data: IGovernanceStaking = {
        wallets: [],
        networks: []
    };
    tag: any = {};
    private stakedBalance: number = 0;
    private votingBalance: number = 0;
    private availableStake: string = '0';
    private action: ActionType = "add";
    private freezedStake: any = {};
    private minStakePeriod: number = 0;

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
            return this.votingBalance.toString();
        if (new BigNumber(this.tokenSelection.value || 0).gte(this.freezedStake.amount))
            return this.totalStakedBalance;
        return this.votingBalance.toString();
    }

    private get govTokenAddress() {
        return this.state.getGovToken(this.chainId)?.address || ''
    }

    private get OAXWalletBalance(): string {
        const balances = tokenStore.tokenBalances || [];
        return balances[this.govTokenAddress.toLowerCase()] || '0';
    }

    private get lastAvailableOn() {
        return moment(new Date())
            .add(this.minStakePeriod, 'second')
            .format('MMM DD, YYYY');
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
        this.state = new State(configData);
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
        return actions;
    }

    private getProjectOwnerActions() {
        const actions: any[] = [];
        return actions;
    }

    getConfigurators() {
        return [];
    }

    private getData() {
        return this._data;
    }

    private async setData(data: IGovernanceStaking) {
        this._data = data;
        this.resetRpcWallet();
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
            this.refreshUI();
        });
        const connectedEvent = rpcWallet.registerWalletEvent(this, Constants.RpcWalletEvent.Connected, async (connected: boolean) => {
            this.refreshUI();
        });
        if (rpcWallet.instanceId) {
            if (this.tokenSelection) this.tokenSelection.rpcWalletId = rpcWallet.instanceId;
        }
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
            this.tokenSelection.token = this.state.getGovToken(chainId);
            const connected = isClientWalletConnected();
            if (!connected || !this.state.isRpcWalletConnected()) {
                this.btnConnect.caption = connected ? "Switch Network" : "Connect Wallet";
                this.btnConnect.visible = true;
                this.btnConnect.enabled = true;
                this.btnApprove.visible = false;
                this.btnConfirm.visible = false;
            } else {
                this.btnConnect.visible = false;
                this.btnConnect.enabled = false;
            }
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
                    this.lblStakedBalance.caption = FormatUtils.formatNumberWithSeparators(this.stakedBalance);
                    this.lblVotingBalance.caption = FormatUtils.formatNumberWithSeparators(this.votingBalance);
                }
            } catch (err) {
                console.log(err)
            }
            this.updateAddStakePanel();
        });
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

    private handleChangeAction(source: Control) {
        this.tokenSelection.value = null;
        this.action = ((source as ComboBox).selectedItem as IComboItem).value as ActionType;
        this.lblBalance.caption = `Balance: ${FormatUtils.formatNumberWithSeparators(this.balance)}`;
        this.updateAddStakePanel();
    }

    private handleConfirm = async () => {
        const callback = async (err: Error, receipt?: string) => {
            if (err) {
                this.showResultMessage('error', err);
            } else if (receipt) {
                this.showResultMessage('success', receipt);
                // this.confirmBtn.rightIcon.spin = true;
                // this.confirmBtn.rightIcon.visible = true;
            }
        };

        const confirmationCallback = async (receipt: any) => {
            // this.confirmBtn.rightIcon.visible = false;
        };

        // registerSendTxEvents({
        //     transactionHash: callback,
        //     confirmation: confirmationCallback
        // });
        await this.handleStake();
    }

    async handleStake() {
    }

    private onApproveToken = async () => {
        this.showResultMessage('warning', 'Approving');
        //   this.approvalModelAction.doApproveAction(tokenStore.govToken, this.tokenSelection.value);
    }

    onInputTextChange(source: Control) {
        const val = (source as Input).value;
        if (val && val < 0) {
            this.tokenSelection.value = null
        }
        this.updateAddStakePanel();
        //   this.approvalModelAction.checkAllowance(tokenStore.govToken, this.tokenSelection.value);
    }

    private setMaxBalance() {
        this.tokenSelection.value = this.balance;
        this.updateAddStakePanel();
        //   this.approvalModelAction.checkAllowance(tokenStore.govToken, this.tokenSelection.value);
    }

    private updateAddStakePanel() {
        this.lblAddStake.caption = this.action === "add" ? "Add Stake" : "Remove Stake";
        this.lblTotalStakedBalance.caption = FormatUtils.formatNumberWithSeparators(this.totalStakedBalance);
        this.lblTotalVotingBalance.caption = FormatUtils.formatNumberWithSeparators(this.totalVotingBalance);
        this.iconAvailableOn.tooltip.content = "Available on " + this.lastAvailableOn;
        this.lblAvailableOn.caption = this.lastAvailableOn;
        this.pnlAddStake.visible = isClientWalletConnected();
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
                            <i-vstack gap="0.5rem">
                                <i-hstack verticalAlignment="center" horizontalAlignment="space-between">
                                    <i-label caption="Staked Balance" font={{ size: "0.875rem" }}></i-label>
                                    <i-label id="lblStakedBalance" caption="0" font={{ size: "0.875rem" }}></i-label>
                                </i-hstack>
                                <i-hstack id="pnlLock" position="relative"></i-hstack>
                                <i-hstack verticalAlignment="center" horizontalAlignment="space-between">
                                    <i-label caption="Voting Balance" font={{ size: "0.875rem" }}></i-label>
                                    <i-label id="lblVotingBalance" caption="0" font={{ size: "0.875rem" }}></i-label>
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
                                padding={{ top: '0.5rem', bottom: '0.5rem', left: '1rem', right: '1rem' }}
                            >
                                <i-vstack gap="1rem" width="100%">
                                    <i-hstack verticalAlignment="center" horizontalAlignment="space-between">
                                        <i-label caption="Input"></i-label>
                                        <i-label id="lblBalance" caption="Balance: 0"></i-label>
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
                                    <i-label id="lblTotalStakedBalance" caption="0" font={{ size: '0.875rem', color: Theme.text.third }}></i-label>
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
                                    <i-label id="lblTotalVotingBalance" caption="0" font={{ size: '0.875rem', color: Theme.text.third }}></i-label>
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
                                <i-button
                                    id="btnApprove"
                                    caption="Approve"
                                    height="auto" width="100%"
                                    padding={{ top: '0.75rem', bottom: '0.75rem', left: '1.5rem', right: '1.5rem' }}
                                    border={{ radius: 5 }}
                                    font={{ weight: 600 }}
                                    rightIcon={{ spin: true, visible: false }}
                                    class="btn-os"
                                    enabled={false}
                                    visible={false}
                                    onClick={this.onApproveToken.bind(this)}
                                ></i-button>
                                <i-button
                                    id="btnConfirm"
                                    caption={this.action === 'add' ? 'Add' : 'Remove'}
                                    height="auto" width="100%"
                                    padding={{ top: '0.75rem', bottom: '0.75rem', left: '1.5rem', right: '1.5rem' }}
                                    border={{ radius: 5 }}
                                    font={{ weight: 600 }}
                                    rightIcon={{ spin: true, visible: false }}
                                    enabled={false}
                                    visible={false}
                                    class="btn-os"
                                    onClick={this.handleConfirm.bind(this)}
                                ></i-button>
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
}