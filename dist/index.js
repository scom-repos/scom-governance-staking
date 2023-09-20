var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("@scom/scom-governance-staking/assets.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let moduleDir = components_1.application.currentModuleDir;
    function fullPath(path) {
        if (path.indexOf('://') > 0)
            return path;
        return `${moduleDir}/${path}`;
    }
    exports.default = {
        fullPath
    };
});
define("@scom/scom-governance-staking/store/core.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.coreAddress = void 0;
    exports.coreAddress = {
        56: {
            GovToken: "0xb32aC3C79A94aC1eb258f3C830bBDbc676483c93",
            OAXDEX_Governance: "0x510a179AA399672e26e54Ed8Ce0e822cc9D0a98D",
        },
        97: {
            GovToken: "0x45eee762aaeA4e5ce317471BDa8782724972Ee19",
            OAXDEX_Governance: "0xDfC070E2dbDAdcf892aE2ed2E2C426aDa835c528",
        },
        43113: {
            GovToken: "0x27eF998b96c9A66937DBAc38c405Adcd7fa5e7DB",
            OAXDEX_Governance: "0xC025b30e6D4cBe4B6978a1A71a86e6eCB9F87F92",
        },
        43114: {
            GovToken: "0x29E65d6f3e7a609E0138a1331D42D23159124B8E",
            OAXDEX_Governance: "0x845308010c3b699150cdd54dcf0e7c4b8653e6b2",
        },
    };
});
define("@scom/scom-governance-staking/store/utils.ts", ["require", "exports", "@ijstech/components", "@ijstech/eth-wallet", "@scom/scom-network-list", "@scom/scom-token-list", "@scom/scom-governance-staking/store/core.ts"], function (require, exports, components_2, eth_wallet_1, scom_network_list_1, scom_token_list_1, core_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getWETH = exports.isClientWalletConnected = exports.State = void 0;
    class State {
        constructor(options) {
            this.infuraId = '';
            this.networkMap = {};
            this.rpcWalletId = '';
            this.networkMap = (0, scom_network_list_1.default)();
            this.initData(options);
        }
        initData(options) {
            if (options.infuraId) {
                this.infuraId = options.infuraId;
            }
            if (options.networks) {
                this.setNetworkList(options.networks, options.infuraId);
            }
        }
        initRpcWallet(defaultChainId) {
            var _a, _b, _c;
            if (this.rpcWalletId) {
                return this.rpcWalletId;
            }
            const clientWallet = eth_wallet_1.Wallet.getClientInstance();
            const networkList = Object.values(((_a = components_2.application.store) === null || _a === void 0 ? void 0 : _a.networkMap) || []);
            const instanceId = clientWallet.initRpcWallet({
                networks: networkList,
                defaultChainId,
                infuraId: (_b = components_2.application.store) === null || _b === void 0 ? void 0 : _b.infuraId,
                multicalls: (_c = components_2.application.store) === null || _c === void 0 ? void 0 : _c.multicalls
            });
            this.rpcWalletId = instanceId;
            if (clientWallet.address) {
                const rpcWallet = eth_wallet_1.Wallet.getRpcWalletInstance(instanceId);
                rpcWallet.address = clientWallet.address;
            }
            return instanceId;
        }
        getRpcWallet() {
            return this.rpcWalletId ? eth_wallet_1.Wallet.getRpcWalletInstance(this.rpcWalletId) : null;
        }
        isRpcWalletConnected() {
            const wallet = this.getRpcWallet();
            return wallet === null || wallet === void 0 ? void 0 : wallet.isConnected;
        }
        getChainId() {
            const rpcWallet = this.getRpcWallet();
            return rpcWallet === null || rpcWallet === void 0 ? void 0 : rpcWallet.chainId;
        }
        setNetworkList(networkList, infuraId) {
            const wallet = eth_wallet_1.Wallet.getClientInstance();
            this.networkMap = {};
            const defaultNetworkList = (0, scom_network_list_1.default)();
            const defaultNetworkMap = defaultNetworkList.reduce((acc, cur) => {
                acc[cur.chainId] = cur;
                return acc;
            }, {});
            for (let network of networkList) {
                const networkInfo = defaultNetworkMap[network.chainId];
                if (!networkInfo)
                    continue;
                if (infuraId && network.rpcUrls && network.rpcUrls.length > 0) {
                    for (let i = 0; i < network.rpcUrls.length; i++) {
                        network.rpcUrls[i] = network.rpcUrls[i].replace(/{InfuraId}/g, infuraId);
                    }
                }
                this.networkMap[network.chainId] = Object.assign(Object.assign({}, networkInfo), network);
                wallet.setNetworkInfo(this.networkMap[network.chainId]);
            }
        }
        async setApprovalModelAction(options) {
            const approvalOptions = Object.assign(Object.assign({}, options), { spenderAddress: '' });
            let wallet = this.getRpcWallet();
            this.approvalModel = new eth_wallet_1.ERC20ApprovalModel(wallet, approvalOptions);
            let approvalModelAction = this.approvalModel.getAction();
            return approvalModelAction;
        }
        getAddresses(chainId) {
            return core_1.coreAddress[chainId || this.getChainId()];
        }
        getGovToken(chainId) {
            let govToken;
            let address = this.getAddresses(chainId).GovToken;
            if (chainId == 43113 || chainId == 43114 || chainId == 42161 || chainId == 421613 || chainId == 80001 || chainId == 137) {
                govToken = { address: address, decimals: 18, symbol: "veOSWAP", name: 'Vote-escrowed OSWAP' };
            }
            else {
                govToken = { address: address, decimals: 18, symbol: "OSWAP", name: 'OpenSwap' };
            }
            return govToken;
        }
    }
    exports.State = State;
    function isClientWalletConnected() {
        const wallet = eth_wallet_1.Wallet.getClientInstance();
        return wallet.isConnected;
    }
    exports.isClientWalletConnected = isClientWalletConnected;
    const getWETH = (chainId) => {
        let wrappedToken = scom_token_list_1.WETHByChainId[chainId];
        return wrappedToken;
    };
    exports.getWETH = getWETH;
});
define("@scom/scom-governance-staking/store/index.ts", ["require", "exports", "@scom/scom-governance-staking/store/utils.ts"], function (require, exports, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name='@scom/scom-governance-staking/store/index.ts'/> 
    __exportStar(utils_1, exports);
});
define("@scom/scom-governance-staking/data.json.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name='@scom/scom-governance-staking/data.json.ts'/> 
    exports.default = {
        "infuraId": "adc596bf88b648e2a8902bc9093930c5",
        "networks": [
            {
                "chainId": 97,
                "explorerTxUrl": "https://testnet.bscscan.com/tx/",
                "explorerAddressUrl": "https://testnet.bscscan.com/address/"
            },
            {
                "chainId": 43113,
                "explorerTxUrl": "https://testnet.snowtrace.io/tx/",
                "explorerAddressUrl": "https://testnet.snowtrace.io/address/"
            }
        ],
        "defaultBuilderData": {
            "defaultChainId": 43113,
            "networks": [
                {
                    "chainId": 43113
                },
                {
                    "chainId": 97
                }
            ],
            "wallets": [
                {
                    "name": "metamask"
                }
            ],
            "showHeader": true,
            "showFooter": true
        }
    };
});
define("@scom/scom-governance-staking/interface.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("@scom/scom-governance-staking/index.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_3.Styles.Theme.ThemeVars;
    exports.default = components_3.Styles.style({
        $nest: {
            '.custom-combobox .selection': {
                background: 'transparent',
                $nest: {
                    'input': {
                        background: 'transparent',
                        color: '#fff'
                    }
                }
            },
            'input': {
                background: 'transparent',
                color: '#fff'
            },
            '.custom-combobox .icon-btn': {
                background: 'transparent',
                border: 'none'
            },
            '.none-select': {
                userSelect: 'none'
            },
            '.custom-shadow': {
                boxShadow: '0 2px 8px rgb(0 0 0 / 15%)'
            },
            '.has-caret': {
                position: 'relative',
                $nest: {
                    '&::before': {
                        position: 'absolute',
                        content: '""',
                        top: -14,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        border: '7px solid transparent',
                        borderBottomColor: Theme.background.modal,
                        visibility: 'inherit'
                    }
                }
            },
            '.custom-token-selection #gridTokenInput': {
                background: 'transparent',
                padding: '0 !important',
                $nest: {
                    '#btnMax': {
                        background: Theme.background.gradient,
                        color: '#fff !important',
                        padding: '1px 8px !important',
                        borderRadius: 6,
                        fontSize: '1rem',
                        fontWeight: 600
                    },
                    '#btnToken': {
                        paddingRight: '0 !important',
                        opacity: 1
                    },
                    '#btnToken i-label': {
                        color: Theme.text.third,
                        fontWeight: 700
                    }
                }
            },
            '.balance-label': {
                textAlign: 'right',
                textOverflow: 'ellipsis',
                overflow: 'hidden'
            },
            '.btn-os': {
                color: '#fff',
                fontWeight: 600,
                fontSize: '1rem',
                borderRadius: 5,
                background: Theme.background.gradient,
                $nest: {
                    '&:disabled': {
                        color: '#fff'
                    }
                }
            }
        }
    });
});
define("@scom/scom-governance-staking/api.ts", ["require", "exports", "@ijstech/eth-wallet", "@scom/oswap-openswap-contract"], function (require, exports, eth_wallet_2, oswap_openswap_contract_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getGovState = exports.getMinStakePeriod = exports.doUnlockStake = exports.doUnstake = exports.doStake = void 0;
    async function doStake(state, amount) {
        const wallet = eth_wallet_2.Wallet.getClientInstance();
        const chainId = state.getChainId();
        const gov = state.getAddresses(chainId).OAXDEX_Governance;
        const govContract = new oswap_openswap_contract_1.Contracts.OAXDEX_Governance(wallet, gov);
        const decimals = govTokenDecimals(state);
        if (!(amount instanceof eth_wallet_2.BigNumber)) {
            amount = new eth_wallet_2.BigNumber(amount);
        }
        const receipt = await govContract.stake(amount.shiftedBy(decimals));
        return receipt;
    }
    exports.doStake = doStake;
    async function doUnstake(state, amount) {
        const wallet = eth_wallet_2.Wallet.getClientInstance();
        const chainId = state.getChainId();
        const gov = state.getAddresses(chainId).OAXDEX_Governance;
        const govContract = new oswap_openswap_contract_1.Contracts.OAXDEX_Governance(wallet, gov);
        const decimals = govTokenDecimals(state);
        if (!(amount instanceof eth_wallet_2.BigNumber)) {
            amount = new eth_wallet_2.BigNumber(amount);
        }
        const receipt = await govContract.unstake(amount.shiftedBy(decimals));
        return receipt;
    }
    exports.doUnstake = doUnstake;
    async function doUnlockStake(state) {
        const wallet = eth_wallet_2.Wallet.getClientInstance();
        const chainId = state.getChainId();
        const gov = state.getAddresses(chainId).OAXDEX_Governance;
        const govContract = new oswap_openswap_contract_1.Contracts.OAXDEX_Governance(wallet, gov);
        const receipt = await govContract.unlockStake();
        return receipt;
    }
    exports.doUnlockStake = doUnlockStake;
    async function getMinStakePeriod(state) {
        const wallet = state.getRpcWallet();
        const chainId = state.getChainId();
        const address = state.getAddresses(chainId).OAXDEX_Governance;
        const govContract = new oswap_openswap_contract_1.Contracts.OAXDEX_Governance(wallet, address);
        let result = await govContract.minStakePeriod();
        return result.toNumber();
    }
    exports.getMinStakePeriod = getMinStakePeriod;
    const govTokenDecimals = (state) => {
        const chainId = state.getChainId();
        return state.getGovToken(chainId).decimals || 18;
    };
    const stakeOf = async function (state, address) {
        const wallet = state.getRpcWallet();
        const chainId = state.getChainId();
        const gov = state.getAddresses(chainId).OAXDEX_Governance;
        const govContract = new oswap_openswap_contract_1.Contracts.OAXDEX_Governance(wallet, gov);
        let result = await govContract.stakeOf(address);
        result = eth_wallet_2.Utils.fromDecimals(result, govTokenDecimals(state));
        return result;
    };
    const freezedStake = async function (state, address) {
        const wallet = state.getRpcWallet();
        const chainId = state.getChainId();
        const gov = state.getAddresses(chainId).OAXDEX_Governance;
        const govContract = new oswap_openswap_contract_1.Contracts.OAXDEX_Governance(wallet, gov);
        let result = await govContract.freezedStake(address);
        let minStakePeriod = await govContract.minStakePeriod();
        let newResult = { amount: eth_wallet_2.Utils.fromDecimals(result.amount, govTokenDecimals(state)), timestamp: Number(result.timestamp) * 1000, lockTill: (Number(result.timestamp) + Number(minStakePeriod)) * 1000 };
        return newResult;
    };
    async function getGovState(state) {
        const wallet = state.getRpcWallet();
        const chainId = state.getChainId();
        const address = state.getAddresses(chainId).OAXDEX_Governance;
        if (address) {
            let stakeOfResult = await stakeOf(state, wallet.account.address);
            let freezeStakeResult = await freezedStake(state, wallet.account.address);
            let stakedBalance = new eth_wallet_2.BigNumber(freezeStakeResult.amount).plus(stakeOfResult);
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
    exports.getGovState = getGovState;
});
define("@scom/scom-governance-staking", ["require", "exports", "@ijstech/components", "@scom/scom-governance-staking/assets.ts", "@scom/scom-governance-staking/store/index.ts", "@scom/scom-governance-staking/data.json.ts", "@ijstech/eth-wallet", "@scom/scom-governance-staking/index.css.ts", "@scom/scom-token-list", "@scom/scom-governance-staking/api.ts"], function (require, exports, components_4, assets_1, index_1, data_json_1, eth_wallet_3, index_css_1, scom_token_list_2, api_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_4.Styles.Theme.ThemeVars;
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
    let ScomGovernanceStaking = class ScomGovernanceStaking extends components_4.Module {
        constructor() {
            super(...arguments);
            this._data = {
                wallets: [],
                networks: []
            };
            this.tag = {};
            this.stakedBalance = 0;
            this.votingBalance = 0;
            this.availableStake = '0';
            this.action = "add";
            this.freezedStake = {};
            this.minStakePeriod = 0;
            this.initWallet = async () => {
                try {
                    await eth_wallet_3.Wallet.getClientInstance().init();
                    const rpcWallet = this.state.getRpcWallet();
                    await rpcWallet.init();
                }
                catch (err) {
                    console.log(err);
                }
            };
            this.initializeWidgetConfig = async () => {
                setTimeout(async () => {
                    const chainId = this.chainId;
                    await this.initWallet();
                    await this.updateBalance();
                    this.tokenSelection.token = this.state.getGovToken(chainId);
                    const connected = (0, index_1.isClientWalletConnected)();
                    if (!connected || !this.state.isRpcWalletConnected()) {
                        this.btnConnect.caption = connected ? "Switch Network" : "Connect Wallet";
                        this.btnConnect.visible = true;
                        this.btnConnect.enabled = true;
                        this.pnlActionButtons.visible = false;
                    }
                    else {
                        this.btnConnect.visible = false;
                        this.btnConnect.enabled = false;
                        this.pnlActionButtons.visible = true;
                    }
                    const token = this.state.getGovToken(this.chainId);
                    this.approvalModelAction.checkAllowance(token, this.tokenSelection.value);
                    try {
                        if (connected) {
                            this.minStakePeriod = await (0, api_1.getMinStakePeriod)(this.state);
                            const govState = await (0, api_1.getGovState)(this.state);
                            this.freezedStake = {
                                amount: govState.freezeStakeAmount,
                                lockTill: govState.lockTill,
                                timestamp: govState.freezeStakeTimestamp
                            };
                            this.stakedBalance = govState.stakedBalance;
                            this.votingBalance = govState.votingBalance;
                            this.availableStake = `${(0, components_4.moment)(govState.lockTill).format('DD MMM YYYY')} at ${(0, components_4.moment)(govState.lockTill).format('HH:mm')}`;
                            this.lblStakedBalance.caption = components_4.FormatUtils.formatNumberWithSeparators(this.stakedBalance, 4);
                            this.lblVotingBalance.caption = components_4.FormatUtils.formatNumberWithSeparators(this.votingBalance, 4);
                        }
                    }
                    catch (err) {
                        console.log(err);
                    }
                    this.lblBalance.caption = `Balance: ${components_4.FormatUtils.formatNumberWithSeparators(this.balance, 4)}`;
                    this.updateLockPanel();
                    this.updateAddStakePanel();
                });
            };
            this.showResultMessage = (status, content) => {
                if (!this.txStatusModal)
                    return;
                let params = { status };
                if (status === 'success') {
                    params.txtHash = content;
                }
                else {
                    params.content = content;
                }
                this.txStatusModal.message = Object.assign({}, params);
                this.txStatusModal.showModal();
            };
            this.connectWallet = async () => {
                if (!(0, index_1.isClientWalletConnected)()) {
                    if (this.mdWallet) {
                        await components_4.application.loadPackage('@scom/scom-wallet-modal', '*');
                        this.mdWallet.networks = this.networks;
                        this.mdWallet.wallets = this.wallets;
                        this.mdWallet.showModal();
                    }
                    return;
                }
                if (!this.state.isRpcWalletConnected()) {
                    const clientWallet = eth_wallet_3.Wallet.getClientInstance();
                    await clientWallet.switchNetwork(this.chainId);
                }
            };
            this.handleConfirm = async () => {
                this.approvalModelAction.doPayAction();
            };
            this.onApproveToken = async () => {
                this.showResultMessage('warning', 'Approving');
                const token = this.state.getGovToken(this.chainId);
                this.approvalModelAction.doApproveAction(token, this.tokenSelection.value);
            };
        }
        get chainId() {
            return this.state.getChainId();
        }
        get defaultChainId() {
            return this._data.defaultChainId;
        }
        set defaultChainId(value) {
            this._data.defaultChainId = value;
        }
        get wallets() {
            var _a;
            return (_a = this._data.wallets) !== null && _a !== void 0 ? _a : [];
        }
        set wallets(value) {
            this._data.wallets = value;
        }
        get networks() {
            var _a;
            return (_a = this._data.networks) !== null && _a !== void 0 ? _a : [];
        }
        set networks(value) {
            this._data.networks = value;
        }
        get showHeader() {
            var _a;
            return (_a = this._data.showHeader) !== null && _a !== void 0 ? _a : true;
        }
        set showHeader(value) {
            this._data.showHeader = value;
        }
        get totalStakedBalance() {
            if (this.action === 'add') {
                return new eth_wallet_3.BigNumber(this.stakedBalance).plus(this.tokenSelection.value ? this.tokenSelection.value : 0).toFixed();
            }
            else {
                return new eth_wallet_3.BigNumber(this.stakedBalance).minus(this.tokenSelection.value ? this.tokenSelection.value : 0).toFixed();
            }
        }
        get totalVotingBalance() {
            if (this.action === 'add')
                return this.votingBalance.toString();
            if (new eth_wallet_3.BigNumber(this.tokenSelection.value || 0).gte(this.freezedStake.amount))
                return this.totalStakedBalance;
            return this.votingBalance.toString();
        }
        get OAXWalletBalance() {
            var _a;
            const token = this.state.getGovToken(this.chainId);
            if (token) {
                const address = (token === null || token === void 0 ? void 0 : token.address) || "";
                return address ? (_a = this.allTokenBalancesMap[address.toLowerCase()]) !== null && _a !== void 0 ? _a : 0 : this.allTokenBalancesMap[token.symbol] || 0;
            }
            else {
                return 0;
            }
        }
        get lastAvailableOn() {
            return (0, components_4.moment)(new Date())
                .add(this.minStakePeriod, 'second')
                .format('MMM DD, YYYY');
        }
        get isUnlockVotingBalanceDisabled() {
            return this.freezedStake.amount == 0 || this.freezedStake.timestamp == 0 || (0, components_4.moment)(this.freezedStake.lockTill).isAfter(new Date());
        }
        get isBtnDisabled() {
            const bal = new eth_wallet_3.BigNumber(this.balance);
            const val = new eth_wallet_3.BigNumber(this.tokenSelection.value || 0);
            return val.lte(0) || val.gt(bal) || !this.action;
        }
        get balance() {
            if (this.action === 'remove') {
                return new eth_wallet_3.BigNumber(this.stakedBalance).toFixed();
            }
            if (this.action === 'add') {
                return new eth_wallet_3.BigNumber(this.OAXWalletBalance).toFixed();
            }
            return new eth_wallet_3.BigNumber(0).toFixed();
        }
        removeRpcWalletEvents() {
            const rpcWallet = this.state.getRpcWallet();
            if (rpcWallet)
                rpcWallet.unregisterAllWalletEvents();
        }
        onHide() {
            this.dappContainer.onHide();
            this.removeRpcWalletEvents();
        }
        isEmptyData(value) {
            return !value || !value.networks || value.networks.length === 0;
        }
        async init() {
            this.isReadyCallbackQueued = true;
            super.init();
            this.state = new index_1.State(data_json_1.default);
            const lazyLoad = this.getAttribute('lazyLoad', true, false);
            if (!lazyLoad) {
                const networks = this.getAttribute('networks', true);
                const wallets = this.getAttribute('wallets', true);
                const defaultChainId = this.getAttribute('defaultChainId', true);
                const showHeader = this.getAttribute('showHeader', true);
                const data = {
                    networks,
                    wallets,
                    defaultChainId,
                    showHeader
                };
                if (!this.isEmptyData(data)) {
                    await this.setData(data);
                }
            }
            this.loadingElm.visible = false;
            this.isReadyCallbackQueued = false;
            this.executeReadyCallback();
        }
        _getActions(category) {
            const actions = [];
            return actions;
        }
        getProjectOwnerActions() {
            const actions = [];
            return actions;
        }
        getConfigurators() {
            return [];
        }
        getData() {
            return this._data;
        }
        async setData(data) {
            this._data = data;
            this.resetRpcWallet();
            if (!this.approvalModelAction)
                this.initApprovalModelAction();
            this.setApprovalSpenderAddress();
            await this.refreshUI();
        }
        async getTag() {
            return this.tag;
        }
        updateTag(type, value) {
            var _a;
            this.tag[type] = (_a = this.tag[type]) !== null && _a !== void 0 ? _a : {};
            for (let prop in value) {
                if (value.hasOwnProperty(prop))
                    this.tag[type][prop] = value[prop];
            }
        }
        setTag(value) {
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
        resetRpcWallet() {
            var _a;
            this.removeRpcWalletEvents();
            const rpcWalletId = this.state.initRpcWallet(this.defaultChainId);
            const rpcWallet = this.state.getRpcWallet();
            const chainChangedEvent = rpcWallet.registerWalletEvent(this, eth_wallet_3.Constants.RpcWalletEvent.ChainChanged, async (chainId) => {
                this.setApprovalSpenderAddress();
                this.refreshUI();
            });
            const connectedEvent = rpcWallet.registerWalletEvent(this, eth_wallet_3.Constants.RpcWalletEvent.Connected, async (connected) => {
                this.setApprovalSpenderAddress();
                this.refreshUI();
            });
            if (rpcWallet.instanceId) {
                if (this.tokenSelection)
                    this.tokenSelection.rpcWalletId = rpcWallet.instanceId;
            }
            const data = {
                defaultChainId: this.defaultChainId,
                wallets: this.wallets,
                networks: this.networks,
                showHeader: this.showHeader,
                rpcWalletId: rpcWallet.instanceId
            };
            if ((_a = this.dappContainer) === null || _a === void 0 ? void 0 : _a.setData)
                this.dappContainer.setData(data);
        }
        async refreshUI() {
            await this.initializeWidgetConfig();
        }
        async initApprovalModelAction() {
            this.approvalModelAction = await this.state.setApprovalModelAction({
                sender: this,
                payAction: this.handleStake,
                onToBeApproved: async (token) => {
                    this.btnApprove.visible = true;
                    this.btnApprove.enabled = true;
                    this.btnConfirm.visible = false;
                },
                onToBePaid: async (token) => {
                    this.btnApprove.visible = false;
                    this.btnConfirm.visible = true;
                    this.btnConfirm.enabled = !this.isBtnDisabled;
                },
                onApproving: async (token, receipt) => {
                    this.btnApprove.rightIcon.spin = true;
                    this.btnApprove.rightIcon.visible = true;
                    this.btnApprove.caption = `Approving ${token.symbol}`;
                    if (receipt)
                        this.showResultMessage('success', receipt);
                },
                onApproved: async (token) => {
                    this.btnApprove.rightIcon.visible = false;
                    this.btnApprove.caption = 'Approve';
                },
                onApprovingError: async (token, err) => {
                    this.showResultMessage('error', err);
                    this.btnApprove.caption = 'Approve';
                    this.btnApprove.rightIcon.visible = false;
                },
                onPaying: async (receipt) => {
                    if (receipt) {
                        this.showResultMessage('success', receipt);
                        this.tokenSelection.value = '0';
                        this.btnConfirm.enabled = false;
                        this.btnConfirm.rightIcon.spin = true;
                        this.btnConfirm.rightIcon.visible = true;
                    }
                },
                onPaid: async () => {
                    this.btnConfirm.rightIcon.visible = false;
                    this.tokenSelection.value = '0';
                    this.refreshUI();
                },
                onPayingError: async (err) => {
                    this.showResultMessage('error', err);
                }
            });
        }
        setApprovalSpenderAddress() {
            if (!this.state.approvalModel)
                return;
            this.state.approvalModel.spenderAddress = this.state.getAddresses().OAXDEX_Governance;
        }
        async updateBalance() {
            const rpcWallet = this.state.getRpcWallet();
            if (rpcWallet.address) {
                if (!this.isEmptyData(this._data))
                    await scom_token_list_2.tokenStore.updateAllTokenBalances(rpcWallet);
                let tokenBalances = scom_token_list_2.tokenStore.getTokenBalancesByChainId(this.chainId);
                this.allTokenBalancesMap = tokenBalances || {};
            }
            else {
                this.allTokenBalancesMap = {};
            }
        }
        handleChangeAction(source) {
            this.tokenSelection.value = null;
            this.action = source.selectedItem.value;
            this.lblBalance.caption = `Balance: ${components_4.FormatUtils.formatNumberWithSeparators(this.balance, 4)}`;
            this.updateAddStakePanel();
        }
        toggleUnlockModal() {
            this.mdUnlock.visible = !this.mdUnlock.visible;
        }
        getAddVoteBalanceErrMsg(err) {
            const processError = (err) => {
                if (err) {
                    if (!err.code) {
                        try {
                            return JSON.parse(err.message.substr(err.message.indexOf('{')));
                        }
                        catch (moreErr) {
                            err = { code: 777, message: "Unknown Error" };
                        }
                    }
                    else {
                        return err;
                    }
                }
                else {
                    return { code: 778, message: "Error is Empty" };
                }
            };
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
        async addVoteBalance() {
            if (this.isUnlockVotingBalanceDisabled)
                return;
            try {
                this.showResultMessage('warning', 'You have staked!');
                const receipt = await (0, api_1.doUnlockStake)(this.state);
                if (receipt)
                    this.showResultMessage('success', receipt.transactionHash);
                this.refreshUI();
            }
            catch (error) {
                console.error('unlockStake', error);
                let errMsg = this.getAddVoteBalanceErrMsg(error);
                this.showResultMessage('error', errMsg);
            }
        }
        async handleStake() {
            if (this.isBtnDisabled)
                return;
            const value = components_4.FormatUtils.formatNumberWithSeparators(this.tokenSelection.value);
            const content = `${this.action === 'add' ? "Adding" : "Removing"} ${value} Staked Balance`;
            this.showResultMessage('warning', content);
            if (this.action === 'add') {
                await (0, api_1.doStake)(this.state, this.tokenSelection.value);
            }
            else {
                await (0, api_1.doUnstake)(this.state, this.tokenSelection.value);
            }
        }
        onInputAmountChanged(source) {
            const val = source.value;
            if (val && val < 0) {
                this.tokenSelection.value = null;
            }
            this.updateAddStakePanel();
            const token = this.state.getGovToken(this.chainId);
            this.approvalModelAction.checkAllowance(token, this.tokenSelection.value);
        }
        setMaxBalance() {
            this.tokenSelection.value = this.balance;
            this.updateAddStakePanel();
            const token = this.state.getGovToken(this.chainId);
            this.approvalModelAction.checkAllowance(token, this.tokenSelection.value);
        }
        updateLockPanel() {
            var _a;
            this.pnlLock.visible = this.freezedStake.timestamp > 0;
            if (!this.pnlLock.visible)
                return;
            this.lblFreezedStake.caption = this.freezedStake.amount + " Staked Balance available to add";
            this.lblAvailVotingBalance.caption = !this.freezedStake || this.freezedStake.amount == 0 ? 'Unavailable stake' : this.availableStake;
            this.btnLock.caption = this.isUnlockVotingBalanceDisabled ? "Lock" : "Unlock";
            this.btnLock.icon.name = this.isUnlockVotingBalanceDisabled ? "lock" : "lock-open";
            this.btnLock.enabled = !this.isUnlockVotingBalanceDisabled;
            const tokenSymbol = ((_a = this.state.getGovToken(this.chainId)) === null || _a === void 0 ? void 0 : _a.symbol) || '';
            if (!this.isUnlockVotingBalanceDisabled) {
                this.lblStakeSettingStatus1.caption = "Currently you can move to Voting Balance:";
                this.lblStakeSettingStatus2.caption = `${components_4.FormatUtils.formatNumberWithSeparators(this.freezedStake.amount, 4)} ${tokenSymbol}`;
            }
            else if (this.freezedStake.amount == 0) {
                this.lblStakeSettingStatus1.caption = "Stake some tokens to your Staked Balance";
                this.lblStakeSettingStatus2.caption = `Wallet Balance: ${components_4.FormatUtils.formatNumberWithSeparators(this.OAXWalletBalance, 4)} ${tokenSymbol}`;
            }
            else {
                this.lblStakeSettingStatus1.caption = "Currently your Staked Balance:";
                this.lblStakeSettingStatus2.caption = `${components_4.FormatUtils.formatNumberWithSeparators(this.stakedBalance, 4)} ${tokenSymbol}`;
            }
        }
        updateAddStakePanel() {
            this.lblAddStake.caption = this.action === "add" ? "Add Stake" : "Remove Stake";
            this.lblTotalStakedBalance.caption = components_4.FormatUtils.formatNumberWithSeparators(this.totalStakedBalance, 4);
            this.lblTotalVotingBalance.caption = components_4.FormatUtils.formatNumberWithSeparators(this.totalVotingBalance, 4);
            this.iconAvailableOn.tooltip.content = "Available on " + this.lastAvailableOn;
            this.lblAvailableOn.caption = this.lastAvailableOn;
            this.pnlAddStake.visible = (0, index_1.isClientWalletConnected)();
            this.btnConfirm.caption = this.action === 'add' ? 'Add' : 'Remove';
            this.btnApprove.enabled = !this.isBtnDisabled;
            this.btnConfirm.enabled = !this.isBtnDisabled;
        }
        render() {
            return (this.$render("i-scom-dapp-container", { id: "dappContainer" },
                this.$render("i-panel", { class: index_css_1.default, background: { color: Theme.background.main } },
                    this.$render("i-panel", null,
                        this.$render("i-vstack", { id: "loadingElm", class: "i-loading-overlay" },
                            this.$render("i-vstack", { class: "i-loading-spinner", horizontalAlignment: "center", verticalAlignment: "center" },
                                this.$render("i-icon", { class: "i-loading-spinner_icon", image: { url: assets_1.default.fullPath('img/loading.svg'), width: 36, height: 36 } }),
                                this.$render("i-label", { caption: "Loading...", font: { color: '#FD4A4C', size: '1.5em' }, class: "i-loading-spinner_text" }))),
                        this.$render("i-vstack", { width: "100%", height: "100%", maxWidth: 440, padding: { top: "1rem", bottom: "1rem", left: "1rem", right: "1rem" }, margin: { left: 'auto', right: 'auto' }, gap: "1rem" },
                            this.$render("i-hstack", { width: "100%", horizontalAlignment: "center", margin: { top: "1rem", bottom: "1rem" } },
                                this.$render("i-label", { caption: "Manage Stake", font: { size: '1rem', bold: true, color: Theme.text.third } })),
                            this.$render("i-vstack", { gap: "0.5rem" },
                                this.$render("i-hstack", { verticalAlignment: "center", horizontalAlignment: "space-between" },
                                    this.$render("i-label", { caption: "Staked Balance", font: { size: "0.875rem" } }),
                                    this.$render("i-label", { id: "lblStakedBalance", class: "balance-label", width: "50%", caption: "0", font: { size: "0.875rem" } })),
                                this.$render("i-hstack", { id: "pnlLock", position: "relative", visible: false },
                                    this.$render("i-hstack", { verticalAlignment: "center", gap: 10 },
                                        this.$render("i-label", { id: "lblFreezedStake", font: { color: Theme.colors.primary.main, size: '0.875rem' } }),
                                        this.$render("i-panel", null,
                                            this.$render("i-button", { class: "btn-os", height: "auto", padding: { top: '0.2rem', bottom: '0.2rem', left: '0.5rem', right: '0.5rem' }, caption: "Unlock", onClick: this.toggleUnlockModal.bind(this) }))),
                                    this.$render("i-modal", { id: "mdUnlock", popupPlacement: 'bottom', maxWidth: 400, minWidth: 400, showBackdrop: false, background: { color: 'transparent' }, margin: { top: -10 }, height: "auto" },
                                        this.$render("i-panel", { class: "custom-shadow", padding: { top: 20 } },
                                            this.$render("i-panel", { class: "has-caret", padding: { top: 12, bottom: 12, left: 16, right: 16 }, background: { color: Theme.background.modal }, border: { radius: 4 } },
                                                this.$render("i-vstack", { padding: { bottom: '0.5rem' }, border: { bottom: { width: 2, style: 'solid', color: Theme.divider } }, gap: "0.5rem" },
                                                    this.$render("i-label", { caption: "Stake Setting", font: { size: '1rem', color: Theme.text.third } }),
                                                    this.$render("i-label", { font: { size: '0.875rem' }, caption: "You'll be able to move your Staked Balance to Voting Balance; which will give privilage to participate our Polls and Executive Proposals." })),
                                                this.$render("i-hstack", { padding: { top: '0.5rem', bottom: '0.5rem' }, border: { bottom: { width: 2, style: 'solid', color: Theme.divider } }, horizontalAlignment: "space-between", gap: "0.5rem" },
                                                    this.$render("i-vstack", { gap: "0.5rem" },
                                                        this.$render("i-label", { caption: "Voting Balance Available", font: { size: '1rem', color: Theme.text.third } }),
                                                        this.$render("i-label", { id: "lblAvailVotingBalance", font: { size: '0.875rem' } })),
                                                    this.$render("i-panel", null,
                                                        this.$render("i-button", { id: "btnLock", class: "btn-os", height: "auto", padding: { top: '0.75rem', bottom: '0.75rem', left: '1.5rem', right: '1.5rem' }, caption: "Lock", icon: { width: 16, height: 16, name: 'lock', fill: '#fff' }, enabled: false, onClick: this.addVoteBalance.bind(this) }))),
                                                this.$render("i-vstack", { padding: { top: '0.5rem' }, gap: "0.5rem" },
                                                    this.$render("i-label", { id: "lblStakeSettingStatus1", font: { size: '1rem', color: Theme.text.third } }),
                                                    this.$render("i-label", { id: "lblStakeSettingStatus2", font: { size: '0.875rem' } })))))),
                                this.$render("i-hstack", { verticalAlignment: "center", horizontalAlignment: "space-between" },
                                    this.$render("i-label", { caption: "Voting Balance", font: { size: "0.875rem" } }),
                                    this.$render("i-label", { id: "lblVotingBalance", class: "balance-label", width: "50%", caption: "0", font: { size: "0.875rem" } }))),
                            this.$render("i-hstack", { verticalAlignment: "center", horizontalAlignment: "space-between" },
                                this.$render("i-label", { caption: "Action", font: { size: '0.875rem' } }),
                                this.$render("i-combo-box", { id: "comboAction", placeholder: "Please select action", items: actionOptions, selectedItem: actionOptions[0], background: { color: Theme.background.gradient }, height: 32, minWidth: 180, border: { radius: 10 }, icon: { name: "angle-down", fill: '#fff', width: 12, height: 12 }, font: { size: '0.875rem' }, enabled: true, onChanged: this.handleChangeAction.bind(this), class: "custom-combobox" })),
                            this.$render("i-vstack", { gap: "1rem", margin: { top: '1rem' }, border: { radius: 10, width: '1px', style: 'solid', color: '#8f8d8d' }, padding: { top: '0.5rem', bottom: '0.5rem', left: '1rem', right: '1rem' } },
                                this.$render("i-vstack", { gap: "1rem", width: "100%" },
                                    this.$render("i-hstack", { verticalAlignment: "center", horizontalAlignment: "space-between" },
                                        this.$render("i-label", { caption: "Input" }),
                                        this.$render("i-label", { id: "lblBalance", class: "balance-label", width: "50%", caption: "Balance: 0" })),
                                    this.$render("i-hstack", { verticalAlignment: "center", horizontalAlignment: "space-between" },
                                        this.$render("i-scom-token-input", { id: "tokenSelection", class: "custom-token-selection", width: "100%", isBalanceShown: false, isBtnMaxShown: true, isInputShown: true, tokenReadOnly: true, placeholder: "0.0", value: "0", onSetMaxBalance: this.setMaxBalance.bind(this), onInputAmountChanged: this.onInputAmountChanged.bind(this) }))))),
                        this.$render("i-vstack", { id: "pnlAddStake", padding: { top: '1rem', bottom: '1rem', left: '1rem', right: '1rem' }, maxWidth: 440, margin: { left: 'auto', right: 'auto' }, visible: false },
                            this.$render("i-vstack", { class: "none-select", gap: "10px" },
                                this.$render("i-label", { id: "lblAddStake", caption: "Add Stake", font: { size: '1rem', color: Theme.text.third } }),
                                this.$render("i-hstack", { horizontalAlignment: "space-between", verticalAlignment: "center" },
                                    this.$render("i-hstack", { opacity: 0.75, gap: "0.5rem" },
                                        this.$render("i-label", { caption: "Staked Balance", font: { size: '0.875rem', color: Theme.text.third } }),
                                        this.$render("i-icon", { name: "question-circle", fill: "#fff", width: 14, height: 14, tooltip: { content: 'Your locked staked. Cannot be used for voting at governance portal.', placement: 'right' } })),
                                    this.$render("i-label", { id: "lblTotalStakedBalance", class: "balance-label", width: "50%", caption: "0", font: { size: '0.875rem', color: Theme.text.third } })),
                                this.$render("i-hstack", { horizontalAlignment: "space-between", verticalAlignment: "center" },
                                    this.$render("i-hstack", { opacity: 0.75, gap: "0.5rem" },
                                        this.$render("i-label", { caption: "Voting Balance", font: { size: '0.875rem', color: Theme.text.third } }),
                                        this.$render("i-icon", { name: "question-circle", fill: "#fff", width: 14, height: 14, tooltip: { content: 'Voting balance allows use to participate at governance portal.', placement: 'right' } })),
                                    this.$render("i-label", { id: "lblTotalVotingBalance", class: "balance-label", width: "50%", caption: "0", font: { size: '0.875rem', color: Theme.text.third } })),
                                this.$render("i-hstack", { horizontalAlignment: "space-between", verticalAlignment: "center" },
                                    this.$render("i-hstack", { opacity: 0.75, gap: "0.5rem" },
                                        this.$render("i-label", { caption: "Available on", font: { size: '0.875rem', color: Theme.text.third } }),
                                        this.$render("i-icon", { id: "iconAvailableOn", name: "question-circle", fill: "#fff", width: 14, height: 14, tooltip: { content: "Available on", placement: 'right' } })),
                                    this.$render("i-label", { id: "lblAvailableOn", caption: "-", font: { size: '0.875rem', color: Theme.text.third } })))),
                        this.$render("i-vstack", { class: "none-select", padding: { top: '1rem', bottom: '1rem', left: '1rem', right: '1rem' }, maxWidth: 440, margin: { left: 'auto', right: 'auto' } },
                            this.$render("i-hstack", { gap: "0.5rem" },
                                this.$render("i-hstack", { id: "pnlActionButtons", width: "100%", gap: "0.5rem", visible: false },
                                    this.$render("i-button", { id: "btnApprove", caption: "Approve", height: "auto", width: "100%", padding: { top: '0.75rem', bottom: '0.75rem', left: '1.5rem', right: '1.5rem' }, rightIcon: { spin: true, visible: false }, class: "btn-os", enabled: false, visible: false, onClick: this.onApproveToken.bind(this) }),
                                    this.$render("i-button", { id: "btnConfirm", caption: 'Add', height: "auto", width: "100%", padding: { top: '0.75rem', bottom: '0.75rem', left: '1.5rem', right: '1.5rem' }, rightIcon: { spin: true, visible: false }, enabled: false, visible: false, class: "btn-os", onClick: this.handleConfirm.bind(this) })),
                                this.$render("i-button", { id: "btnConnect", caption: "Connect Wallet", enabled: false, visible: false, width: "100%", padding: { top: '0.75rem', bottom: '0.75rem', left: '1.5rem', right: '1.5rem' }, class: "btn-os", onClick: this.connectWallet.bind(this) })))),
                    this.$render("i-scom-tx-status-modal", { id: "txStatusModal" }),
                    this.$render("i-scom-wallet-modal", { id: "mdWallet", wallets: [] }))));
        }
    };
    ScomGovernanceStaking = __decorate([
        (0, components_4.customElements)('i-scom-governance-staking')
    ], ScomGovernanceStaking);
    exports.default = ScomGovernanceStaking;
});
