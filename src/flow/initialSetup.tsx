import {
    application,
    Button,
    Container,
    ControlElement,
    customElements,
    IEventBus,
    Label,
    Module,
    Styles
} from "@ijstech/components";
import { BigNumber, Constants, IEventBusRegistry, Wallet } from "@ijstech/eth-wallet";
import { ActionType } from "../interface";
import ScomTokenInput from "@scom/scom-token-input";
import { tokenStore } from "@scom/scom-token-list";
import ScomWalletModal from "@scom/scom-wallet-modal";
import { isClientWalletConnected, State } from "../store/index";

const Theme = Styles.Theme.ThemeVars;

interface ScomGovernanceStakingFlowInitialSetupElement extends ControlElement {
    data?: any;
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            ['i-scom-governance-staking-flow-initial-setup']: ScomGovernanceStakingFlowInitialSetupElement;
        }
    }
}

@customElements('i-scom-governance-staking-flow-initial-setup')
export default class ScomGovernanceStakingFlowInitialSetup extends Module {
    private lblConnectedStatus: Label;
    private btnConnectWallet: Button;
    private btnStake: Button;
    private btnUnstake: Button;
    private lblStakeMsg: Label;
    private tokenInput: ScomTokenInput;
    private mdWallet: ScomWalletModal;
    private _state: State;
    private tokenRequirements: any;
    private executionProperties: any;
    private walletEvents: IEventBusRegistry[] = [];
    private action: ActionType;

    get state(): State {
        return this._state;
    }
    set state(value: State) {
        this._state = value;
    }
    private get rpcWallet() {
        return this.state.getRpcWallet();
    }
    private get chainId() {
        return this.executionProperties.chainId || this.executionProperties.defaultChainId;
    }
    private async resetRpcWallet() {
        await this.state.initRpcWallet(this.chainId);
    }
    async setData(value: any) {
        this.executionProperties = value.executionProperties;
        this.tokenRequirements = value.tokenRequirements;
        await this.resetRpcWallet();
        await this.initializeWidgetConfig();
    }
    private async initWallet() {
        try {
            const rpcWallet = this.rpcWallet;
            await rpcWallet.init();
        } catch (err) {
            console.log(err);
        }
    }
    private async initializeWidgetConfig() {
        const connected = isClientWalletConnected();
        this.updateConnectStatus(connected);
        await this.initWallet();
        const rpcWallet = this.rpcWallet;
        const token = this.state.getGovToken(this.chainId);
        this.tokenInput.chainId = this.chainId
        this.tokenInput.tokenDataListProp = [token];
        this.tokenInput.token = token
        await tokenStore.updateTokenBalances(rpcWallet, [token]);
    }
    async connectWallet() {
        if (!isClientWalletConnected()) {
            if (this.mdWallet) {
                await application.loadPackage('@scom/scom-wallet-modal', '*');
                this.mdWallet.networks = this.executionProperties.networks;
                this.mdWallet.wallets = this.executionProperties.wallets;
                this.mdWallet.showModal();
            }
        }
    }
    private updateConnectStatus(connected: boolean) {
        if (connected) {
            this.lblConnectedStatus.caption = 'Connected with ' + Wallet.getClientInstance().address;
            this.btnConnectWallet.visible = false;
        } else {
            this.lblConnectedStatus.caption = 'Please connect your wallet first';
            this.btnConnectWallet.visible = true;
        }
    }
    private registerEvents() {
        let clientWallet = Wallet.getClientInstance();
        this.walletEvents.push(clientWallet.registerWalletEvent(this, Constants.ClientWalletEvent.AccountsChanged, async (payload: Record<string, any>) => {
            const { account } = payload;
            let connected = !!account;
            this.updateConnectStatus(connected);
        }));
    }
    onHide() {
        let clientWallet = Wallet.getClientInstance();
        for (let event of this.walletEvents) {
            clientWallet.unregisterWalletEvent(event);
        }
        this.walletEvents = [];
    }
    init() {
        super.init();
        this.tokenInput.style.setProperty('--input-background', '#232B5A');
        this.tokenInput.style.setProperty('--input-font_color', '#fff');
        this.registerEvents();
    }
    handleClickAction(target: Button) {
        this.action = target.isSameNode(this.btnStake) ? 'add' : 'remove';
        if (this.action === 'add') {
            this.btnStake.background.color = Theme.colors.primary.main;
            this.btnStake.font = { color: Theme.colors.primary.contrastText };
            this.btnStake.icon.name = 'check-circle';
            this.btnUnstake.background.color = Theme.colors.primary.contrastText;
            this.btnUnstake.font = { color: Theme.colors.primary.main };
            this.btnUnstake.icon = undefined;
        } else {
            this.btnStake.background.color = Theme.colors.primary.contrastText;
            this.btnStake.font = { color: Theme.colors.primary.main };
            this.btnStake.icon = undefined;
            this.btnUnstake.background.color = Theme.colors.primary.main;
            this.btnUnstake.font = { color: Theme.colors.primary.contrastText };
            this.btnUnstake.icon.name = 'check-circle';
        }
        const token = this.state.getGovToken(this.chainId);
        this.lblStakeMsg.caption = `How much ${token.symbol} you want to ${this.action === 'add' ? 'stake' : 'unstake'}?`;
        this.lblStakeMsg.visible = true;
        this.tokenInput.visible = true;
    }
    private handleClickStart = async () => {
        this.tokenInput.readOnly = true;
        this.btnStake.enabled = false;
        this.btnUnstake.enabled = false;
        const tokenBalances = await tokenStore.getTokenBalancesByChainId(this.chainId);
        const balance = tokenBalances[this.tokenInput.token.address.toLowerCase()];
        this.tokenRequirements[0].tokenOut.amount = this.tokenInput.value;
        this.executionProperties.tokenInputValue = this.tokenInput.value;
        this.executionProperties.action = this.action;
        const isBalanceSufficient = new BigNumber(balance).gte(this.tokenInput.value);
        if (this.state.handleNextFlowStep)
            this.state.handleNextFlowStep({
                isInitialSetup: true,
                tokenAcquisition: !isBalanceSufficient,
                tokenRequirements: this.tokenRequirements,
                executionProperties: this.executionProperties
            });
    }
    render() {
        return (
            <i-vstack gap="1rem" padding={{ top: 10, bottom: 10, left: 20, right: 20 }}>
                <i-label caption="Manage Stake"></i-label>

                <i-vstack gap="1rem">
                    <i-label id="lblConnectedStatus"></i-label>
                    <i-hstack>
                        <i-button
                            id="btnConnectWallet"
                            caption='Connect Wallet'
                            font={{ color: Theme.colors.primary.contrastText }}
                            padding={{ top: '0.25rem', bottom: '0.25rem', left: '0.75rem', right: '0.75rem' }}
                            onClick={this.connectWallet.bind(this)}
                        ></i-button>
                    </i-hstack>
                    <i-label caption="What would you like to do?"></i-label>
                    <i-hstack verticalAlignment="center" gap="0.5rem">
                        <i-button
                            id="btnStake"
                            caption="Stake"
                            font={{ color: Theme.colors.primary.main }}
                            padding={{ top: '0.25rem', bottom: '0.25rem', left: '0.75rem', right: '0.75rem' }}
                            border={{ width: 1, style: 'solid', color: Theme.colors.primary.main }}
                            background={{ color: Theme.colors.primary.contrastText }}
                            onClick={this.handleClickAction.bind(this)}
                        ></i-button>
                        <i-button
                            id="btnUnstake"
                            caption="Unstake"
                            font={{ color: Theme.colors.primary.main }}
                            padding={{ top: '0.25rem', bottom: '0.25rem', left: '0.75rem', right: '0.75rem' }}
                            border={{ width: 1, style: 'solid', color: Theme.colors.primary.main }}
                            background={{ color: Theme.colors.primary.contrastText }}
                            onClick={this.handleClickAction.bind(this)}
                        ></i-button>
                    </i-hstack>
                    <i-label id="lblStakeMsg" caption="How much OSWAP you want to stake?" visible={false}></i-label>
                    <i-hstack width="50%" verticalAlignment="center">
                        <i-scom-token-input
                            id="tokenInput"
                            width="100%"
                            background={{ color: Theme.input.background }}
                            border={{ radius: '1rem' }}
                            font={{ size: '1.25rem' }}
                            placeholder="0.0"
                            tokenReadOnly={true}
                            isBalanceShown={false}
                            isBtnMaxShown={false}
                            visible={false}
                        ></i-scom-token-input>
                    </i-hstack>
                    <i-hstack horizontalAlignment='center'>
                        <i-button
                            id="btnStart"
                            caption="Start"
                            padding={{ top: '0.25rem', bottom: '0.25rem', left: '0.75rem', right: '0.75rem' }}
                            font={{ color: Theme.colors.primary.contrastText, size: '1.5rem' }}
                            onClick={this.handleClickStart}
                        ></i-button>
                    </i-hstack>
                </i-vstack>
                <i-scom-wallet-modal id="mdWallet" wallets={[]} />
            </i-vstack>
        )
    }
}