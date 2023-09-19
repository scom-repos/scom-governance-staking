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
    FormatUtils
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
    private inputElm: Input;
    private tokenSelection: ScomTokenInput;
    private pnlAddStake: VStack;
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
            return new BigNumber(this.stakedBalance).plus(this.inputElm.value ? this.inputElm.value : 0).toFixed();
        } else {
            return new BigNumber(this.stakedBalance).minus(this.inputElm.value ? this.inputElm.value : 0).toFixed();
        }
    }

    private get govTokenAddress() {
        return this.state.getGovToken(this.chainId)?.address || ''
    }

    private get OAXWalletBalance(): string {
        const balances = tokenStore.tokenBalances || [];
        return balances[this.govTokenAddress.toLowerCase()] || '0';
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
    }

    onInputTextChange(source: Control) {
        const val = (source as Input).value;
        if (val && val < 0) {
            this.inputElm.value = null
        }
        //   this.renderAddStake();
        //   this.approvalModelAction.checkAllowance(tokenStore.govToken, this.inputElm.value);
    }

    private setMaxBalance() {
      this.inputElm.value = this.balance;
      this.renderAddStake();
    //   this.approvalModelAction.checkAllowance(tokenStore.govToken, this.inputElm.value);
    }

    private renderAddStake() {
        this.pnlAddStake.clearInnerHTML();
        if (!isClientWalletConnected()) return;
        const font = { size: '0.875rem', color: Theme.text.third };
        this.pnlAddStake.appendChild(
            <i-vstack class="none-select" gap="10px">
                <i-label caption={`${this.action === 'add' ? 'Add' : 'Remove'} Stake`} font={{ color: Theme.text.third }}></i-label>
                <i-hstack horizontalAlignment="space-between" verticalAlignment="center">
                    <i-hstack opacity={0.75} gap="0.5rem">
                        <i-label caption="Staked Balance" font={font}></i-label>
                        <i-icon
                            name="question-circle"
                            fill="#fff" width={14} height={14}
                            tooltip={{ content: 'Your locked staked. Cannot be used for voting at governance portal.', placement: 'right' }}
                        ></i-icon>
                    </i-hstack>
                    <i-label caption={FormatUtils.formatNumberWithSeparators(this.totalStakedBalance, 4)} font={font}></i-label>
                </i-hstack>
            </i-vstack>
        )
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
                                        <i-scom-token-input
                                            id="tokenSelection"
                                            class="custom-token-selection"
                                            width="100%"
                                            title={<i-label margin={{ bottom: '0.5rem' }} caption="Input"></i-label>}
                                            isBalanceShown={true}
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
                            padding={{ left: '2.5rem', right: '2.5rem', top: '1rem' }}
                            maxWidth={440} margin={{ left: 'auto', right: 'auto' }}
                            visible={false}
                        ></i-vstack>
                    </i-panel>
                    <i-scom-tx-status-modal id="txStatusModal" />
                    <i-scom-wallet-modal id="mdWallet" wallets={[]} />
                </i-panel>
            </i-scom-dapp-container>
        )
    }
}