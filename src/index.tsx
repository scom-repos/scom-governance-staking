import {
    application,
    Button,
    ComboBox,
    Control,
    ControlElement,
    customElements,
    HStack,
    Label,
    Module,
    Panel,
    Styles,
    VStack
} from '@ijstech/components';
import ScomDappContainer from '@scom/scom-dapp-container';
import Assets from './assets';
import { INetworkConfig } from '@scom/scom-network-picker';
import ScomWalletModal, { IWalletPlugin } from '@scom/scom-wallet-modal';
import ScomTxStatusModal from '@scom/scom-tx-status-modal';

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
]

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
    private inputGroup: VStack;
    private pnlAddStake: VStack;
    private txStatusModal: ScomTxStatusModal;
    private mdWallet: ScomWalletModal;

    private handleChangeAction(source: Control) {
    }

    render() {
        return (
            <i-scom-dapp-container id="dappContainer">
                <i-panel background={{ color: Theme.background.main }}>
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
                                id="inputGroup"
                                gap="1rem" margin={{ top: '1rem' }}
                                border={{ radius: 10, width: '1px', style: 'solid', color: '#8f8d8d' }}
                                padding={{ top: '0.5rem', bottom: '0.5rem', left: '1rem', right: '1rem' }}
                            ></i-vstack>
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