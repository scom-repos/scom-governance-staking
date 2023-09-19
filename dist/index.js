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
    exports.formatNumber = exports.getWETH = exports.isClientWalletConnected = exports.State = void 0;
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
    const formatNumberWithSeparators = (value, precision) => {
        if (!value)
            value = 0;
        if (precision) {
            let outputStr = '';
            if (value >= 1) {
                const unit = Math.pow(10, precision);
                const rounded = Math.floor(value * unit) / unit;
                outputStr = rounded.toLocaleString('en-US', { maximumFractionDigits: precision });
            }
            else {
                outputStr = value.toLocaleString('en-US', { maximumSignificantDigits: precision });
            }
            if (outputStr.length > 18) {
                outputStr = outputStr.substring(0, 18) + '...';
            }
            return outputStr;
        }
        return value.toLocaleString('en-US');
    };
    function formatNumber(val) {
        if (typeof val === 'string') {
            val = new eth_wallet_1.BigNumber(val).toNumber();
        }
        return formatNumberWithSeparators(val, 4);
    }
    exports.formatNumber = formatNumber;
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
            }
        }
    });
});
define("@scom/scom-governance-staking", ["require", "exports", "@ijstech/components", "@scom/scom-governance-staking/assets.ts", "@scom/scom-governance-staking/store/index.ts", "@scom/scom-governance-staking/data.json.ts", "@ijstech/eth-wallet", "@scom/scom-governance-staking/index.css.ts", "@scom/scom-token-list"], function (require, exports, components_4, assets_1, index_1, data_json_1, eth_wallet_2, index_css_1, scom_token_list_2) {
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
            this.stakedBalance = '0';
            this.votingBalance = '0';
            this.availableStake = '0';
            this.action = "add";
            this.initWallet = async () => {
                try {
                    await eth_wallet_2.Wallet.getClientInstance().init();
                    const rpcWallet = this.state.getRpcWallet();
                    await rpcWallet.init();
                }
                catch (err) {
                    console.log(err);
                }
            };
            this.initializeWidgetConfig = async () => {
                setTimeout(async () => {
                    await this.initWallet();
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
                    const clientWallet = eth_wallet_2.Wallet.getClientInstance();
                    await clientWallet.switchNetwork(this.chainId);
                }
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
                return new eth_wallet_2.BigNumber(this.stakedBalance).plus(this.inputElm.value ? this.inputElm.value : 0).toFixed();
            }
            else {
                return new eth_wallet_2.BigNumber(this.stakedBalance).minus(this.inputElm.value ? this.inputElm.value : 0).toFixed();
            }
        }
        get govTokenAddress() {
            var _a;
            return ((_a = this.state.getGovToken(this.chainId)) === null || _a === void 0 ? void 0 : _a.address) || '';
        }
        get OAXWalletBalance() {
            const balances = scom_token_list_2.tokenStore.tokenBalances || [];
            return balances[this.govTokenAddress.toLowerCase()] || '0';
        }
        get balance() {
            if (this.action === 'remove') {
                return new eth_wallet_2.BigNumber(this.stakedBalance).toFixed();
            }
            if (this.action === 'add') {
                return new eth_wallet_2.BigNumber(this.OAXWalletBalance).toFixed();
            }
            return new eth_wallet_2.BigNumber(0).toFixed();
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
            const chainChangedEvent = rpcWallet.registerWalletEvent(this, eth_wallet_2.Constants.RpcWalletEvent.ChainChanged, async (chainId) => {
                this.refreshUI();
            });
            const connectedEvent = rpcWallet.registerWalletEvent(this, eth_wallet_2.Constants.RpcWalletEvent.Connected, async (connected) => {
                this.refreshUI();
            });
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
        handleChangeAction(source) {
        }
        onInputTextChange(source) {
            const val = source.value;
            if (val && val < 0) {
                this.inputElm.value = null;
            }
            //   this.renderAddStack();
            //   this.approvalModelAction.checkAllowance(tokenStore.govToken, this.inputElm.value);
        }
        renderAddStack() {
            this.pnlAddStake.clearInnerHTML();
            if (!(0, index_1.isClientWalletConnected)())
                return;
            const font = { size: '0.875rem', color: Theme.text.third };
            this.pnlAddStake.appendChild(this.$render("i-vstack", { class: "none-select", gap: "10px" },
                this.$render("i-label", { caption: `${this.action === 'add' ? 'Add' : 'Remove'} Stake`, font: { color: Theme.text.third } }),
                this.$render("i-hstack", { horizontalAlignment: "space-between", verticalAlignment: "center" },
                    this.$render("i-hstack", { opacity: 0.75, gap: "0.5rem" },
                        this.$render("i-label", { caption: "Staked Balance", font: font }),
                        this.$render("i-icon", { name: "question-circle", fill: "#fff", width: 14, height: 14, tooltip: { content: 'Your locked staked. Cannot be used for voting at governance portal.', placement: 'right' } })),
                    this.$render("i-label", { caption: (0, index_1.formatNumber)(this.totalStakedBalance), font: font }))));
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
                                    this.$render("i-label", { id: "lblStakedBalance", caption: "0", font: { size: "0.875rem" } })),
                                this.$render("i-hstack", { id: "pnlLock", position: "relative" }),
                                this.$render("i-hstack", { verticalAlignment: "center", horizontalAlignment: "space-between" },
                                    this.$render("i-label", { caption: "Voting Balance", font: { size: "0.875rem" } }),
                                    this.$render("i-label", { id: "lblVotingBalance", caption: "0", font: { size: "0.875rem" } }))),
                            this.$render("i-hstack", { verticalAlignment: "center", horizontalAlignment: "space-between" },
                                this.$render("i-label", { caption: "Action", font: { size: '0.875rem' } }),
                                this.$render("i-combo-box", { id: "comboAction", placeholder: "Please select action", items: actionOptions, selectedItem: actionOptions[0], background: { color: Theme.background.gradient }, height: 32, minWidth: 180, border: { radius: 10 }, icon: { name: "angle-down", fill: '#fff', width: 12, height: 12 }, font: { size: '0.875rem' }, enabled: true, onChanged: this.handleChangeAction.bind(this), class: "custom-combobox" })),
                            this.$render("i-vstack", { gap: "1rem", margin: { top: '1rem' }, border: { radius: 10, width: '1px', style: 'solid', color: '#8f8d8d' }, padding: { top: '0.5rem', bottom: '0.5rem', left: '1rem', right: '1rem' } },
                                this.$render("i-vstack", { gap: "1rem", width: "100%" },
                                    this.$render("i-hstack", { verticalAlignment: "center", horizontalAlignment: "space-between" },
                                        this.$render("i-scom-token-input", { id: "tokenSelection", title: this.$render("i-label", { margin: { bottom: '0.5rem' }, caption: "Input" }), isBalanceShown: true }))))),
                        this.$render("i-vstack", { id: "pnlAddStake", padding: { left: '2.5rem', right: '2.5rem', top: '1rem' }, maxWidth: 440, margin: { left: 'auto', right: 'auto' }, visible: false })),
                    this.$render("i-scom-tx-status-modal", { id: "txStatusModal" }),
                    this.$render("i-scom-wallet-modal", { id: "mdWallet", wallets: [] }))));
        }
    };
    ScomGovernanceStaking = __decorate([
        (0, components_4.customElements)('i-scom-governance-staking')
    ], ScomGovernanceStaking);
    exports.default = ScomGovernanceStaking;
});
