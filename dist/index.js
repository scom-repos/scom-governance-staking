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
        137: {
            GovToken: "0x29E65d6f3e7a609E0138a1331D42D23159124B8E",
            OAXDEX_Governance: "0x5580B68478e714C02850251353Cc58B85D4033C3",
        },
        80001: {
            GovToken: "0xb0AF504638BDe5e53D6EaE1119dEd13411c35cF2",
            OAXDEX_Governance: "0x198b150E554F46aee505a7fb574F5D7895889772",
        },
        43113: {
            GovToken: "0x27eF998b96c9A66937DBAc38c405Adcd7fa5e7DB",
            OAXDEX_Governance: "0xC025b30e6D4cBe4B6978a1A71a86e6eCB9F87F92",
        },
        43114: {
            GovToken: "0x29E65d6f3e7a609E0138a1331D42D23159124B8E",
            OAXDEX_Governance: "0x845308010c3b699150cdd54dcf0e7c4b8653e6b2",
        },
        42161: {
            GovToken: "0x29E65d6f3e7a609E0138a1331D42D23159124B8E",
            OAXDEX_Governance: "0x5580B68478e714C02850251353Cc58B85D4033C3",
        },
        421613: {
            GovToken: "0x5580B68478e714C02850251353Cc58B85D4033C3",
            OAXDEX_Governance: "0x6f460B0Bf633E22503Efa460429B0Ab32d655B9D",
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
                govToken = { address: address, decimals: 18, symbol: "veOSWAP", name: 'Vote-escrowed OSWAP', chainId };
            }
            else {
                govToken = { address: address, decimals: 18, symbol: "OSWAP", name: 'OpenSwap', chainId };
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
    function formatNumber(value, decimalFigures) {
        decimalFigures = decimalFigures || 4;
        const newValue = new eth_wallet_1.BigNumber(value).toFixed(decimalFigures);
        return components_2.FormatUtils.formatNumber(newValue, { decimalFigures: decimalFigures });
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
    exports.getVotingValue = exports.getGovState = exports.stakeOf = exports.getMinStakePeriod = exports.doUnstake = exports.doStake = void 0;
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
    exports.stakeOf = stakeOf;
    const freezedStake = async function (state, address) {
        const wallet = state.getRpcWallet();
        const chainId = state.getChainId();
        const gov = state.getAddresses(chainId).OAXDEX_Governance;
        const govContract = new oswap_openswap_contract_1.Contracts.OAXDEX_Governance(wallet, gov);
        let result = await govContract.freezedStake(address);
        let minStakePeriod = await govContract.minStakePeriod();
        let newResult = { amount: eth_wallet_2.Utils.fromDecimals(result.amount, govTokenDecimals(state)), timestamp: result.timestamp.toNumber() * 1000, lockTill: (result.timestamp.toNumber() + minStakePeriod.toNumber()) * 1000 };
        return newResult;
    };
    async function getGovState(state) {
        const wallet = state.getRpcWallet();
        const chainId = state.getChainId();
        const address = state.getAddresses(chainId).OAXDEX_Governance;
        if (address) {
            let stakeOfResult = await (0, exports.stakeOf)(state, wallet.account.address);
            let freezeStakeResult = await freezedStake(state, wallet.account.address);
            let stakedBalance = new eth_wallet_2.BigNumber(freezeStakeResult.amount).plus(stakeOfResult);
            const govStakeObject = {
                stakedBalance: stakedBalance.toFixed(),
                lockTill: freezeStakeResult.lockTill,
                votingBalance: stakeOfResult.toFixed(),
                freezeStakeAmount: freezeStakeResult.amount.toFixed(),
                freezeStakeTimestamp: freezeStakeResult.timestamp
            };
            return govStakeObject;
        }
        return null;
    }
    exports.getGovState = getGovState;
    async function getVotingValue(state, param1) {
        var _a;
        let result = {};
        const wallet = state.getRpcWallet();
        const chainId = state.getChainId();
        const address = (_a = state.getAddresses(chainId)) === null || _a === void 0 ? void 0 : _a.OAXDEX_Governance;
        if (address) {
            const govContract = new oswap_openswap_contract_1.Contracts.OAXDEX_Governance(wallet, address);
            const params = await govContract.getVotingParams(eth_wallet_2.Utils.stringToBytes32(param1));
            result = {
                minExeDelay: params.minExeDelay.toNumber(),
                minVoteDuration: params.minVoteDuration.toNumber(),
                maxVoteDuration: params.maxVoteDuration.toNumber(),
                minOaxTokenToCreateVote: Number(eth_wallet_2.Utils.fromDecimals(params.minOaxTokenToCreateVote).toFixed()),
                minQuorum: Number(eth_wallet_2.Utils.fromDecimals(params.minQuorum).toFixed())
            };
        }
        return result;
    }
    exports.getVotingValue = getVotingValue;
});
define("@scom/scom-governance-staking/formSchema.ts", ["require", "exports", "@scom/scom-network-picker"], function (require, exports, scom_network_picker_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const chainIds = [1, 56, 137, 250, 97, 80001, 43113, 43114, 42161, 421613];
    const networks = chainIds.map(v => { return { chainId: v }; });
    exports.default = {
        dataSchema: {
            type: 'object',
            properties: {
                networks: {
                    type: 'array',
                    required: true,
                    items: {
                        type: 'object',
                        properties: {
                            chainId: {
                                type: 'number',
                                enum: chainIds,
                                required: true
                            }
                        }
                    }
                },
            }
        },
        uiSchema: {
            type: 'VerticalLayout',
            elements: [
                {
                    type: 'Control',
                    scope: '#/properties/networks',
                    options: {
                        detail: {
                            type: 'VerticalLayout'
                        }
                    }
                }
            ]
        },
        customControls() {
            return {
                '#/properties/networks/properties/chainId': {
                    render: () => {
                        const networkPicker = new scom_network_picker_1.default(undefined, {
                            type: 'combobox',
                            networks
                        });
                        return networkPicker;
                    },
                    getData: (control) => {
                        var _a;
                        return (_a = control.selectedNetwork) === null || _a === void 0 ? void 0 : _a.chainId;
                    },
                    setData: (control, value) => {
                        control.setNetworkByChainId(value);
                    }
                }
            };
        }
    };
});
define("@scom/scom-governance-staking/flow/initialSetup.tsx", ["require", "exports", "@ijstech/components", "@ijstech/eth-wallet", "@scom/scom-token-list", "@scom/scom-governance-staking/store/index.ts"], function (require, exports, components_4, eth_wallet_3, scom_token_list_2, index_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_4.Styles.Theme.ThemeVars;
    let ScomGovernanceStakingFlowInitialSetup = class ScomGovernanceStakingFlowInitialSetup extends components_4.Module {
        constructor() {
            super(...arguments);
            this.walletEvents = [];
            this.handleClickStart = async () => {
                this.tokenInput.readOnly = true;
                this.btnStake.enabled = false;
                this.btnUnstake.enabled = false;
                const tokenBalances = await scom_token_list_2.tokenStore.getTokenBalancesByChainId(this.chainId);
                const balance = tokenBalances[this.tokenInput.token.address.toLowerCase()];
                this.tokenRequirements[0].tokenOut.amount = this.tokenInput.value;
                this.executionProperties.tokenInputValue = this.tokenInput.value;
                this.executionProperties.action = this.action;
                const isBalanceSufficient = new eth_wallet_3.BigNumber(balance).gte(this.tokenInput.value);
                if (this.state.handleUpdateStepStatus) {
                    this.state.handleUpdateStepStatus({
                        status: "Completed",
                        color: Theme.colors.success.main
                    });
                }
                if (this.state.handleNextFlowStep)
                    this.state.handleNextFlowStep({
                        isInitialSetup: true,
                        tokenAcquisition: !isBalanceSufficient,
                        tokenRequirements: this.tokenRequirements,
                        executionProperties: this.executionProperties
                    });
            };
        }
        get state() {
            return this._state;
        }
        set state(value) {
            this._state = value;
        }
        get rpcWallet() {
            return this.state.getRpcWallet();
        }
        get chainId() {
            return this.executionProperties.chainId || this.executionProperties.defaultChainId;
        }
        async resetRpcWallet() {
            await this.state.initRpcWallet(this.chainId);
        }
        async setData(value) {
            this.executionProperties = value.executionProperties;
            this.tokenRequirements = value.tokenRequirements;
            await this.resetRpcWallet();
            await this.initializeWidgetConfig();
        }
        async initWallet() {
            try {
                const rpcWallet = this.rpcWallet;
                await rpcWallet.init();
            }
            catch (err) {
                console.log(err);
            }
        }
        async initializeWidgetConfig() {
            const connected = (0, index_1.isClientWalletConnected)();
            this.updateConnectStatus(connected);
            await this.initWallet();
            const token = this.state.getGovToken(this.chainId);
            this.tokenInput.chainId = this.chainId;
            this.tokenInput.tokenDataListProp = [token];
            this.tokenInput.token = token;
            await scom_token_list_2.tokenStore.updateTokenBalancesByChainId(this.chainId, [token]);
        }
        async connectWallet() {
            if (!(0, index_1.isClientWalletConnected)()) {
                if (this.mdWallet) {
                    await components_4.application.loadPackage('@scom/scom-wallet-modal', '*');
                    this.mdWallet.networks = this.executionProperties.networks;
                    this.mdWallet.wallets = this.executionProperties.wallets;
                    this.mdWallet.showModal();
                }
            }
        }
        updateConnectStatus(connected) {
            if (connected) {
                this.lblConnectedStatus.caption = 'Connected with ' + eth_wallet_3.Wallet.getClientInstance().address;
                this.btnConnectWallet.visible = false;
            }
            else {
                this.lblConnectedStatus.caption = 'Please connect your wallet first';
                this.btnConnectWallet.visible = true;
            }
        }
        registerEvents() {
            let clientWallet = eth_wallet_3.Wallet.getClientInstance();
            this.walletEvents.push(clientWallet.registerWalletEvent(this, eth_wallet_3.Constants.ClientWalletEvent.AccountsChanged, async (payload) => {
                const { account } = payload;
                let connected = !!account;
                this.updateConnectStatus(connected);
            }));
        }
        onHide() {
            let clientWallet = eth_wallet_3.Wallet.getClientInstance();
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
        handleClickAction(target) {
            this.action = target.isSameNode(this.btnStake) ? 'add' : 'remove';
            if (this.action === 'add') {
                this.btnStake.background.color = Theme.colors.primary.main;
                this.btnStake.font = { color: Theme.colors.primary.contrastText };
                this.btnStake.icon.name = 'check-circle';
                this.btnUnstake.background.color = Theme.colors.primary.contrastText;
                this.btnUnstake.font = { color: Theme.colors.primary.main };
                this.btnUnstake.icon = undefined;
            }
            else {
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
        render() {
            return (this.$render("i-vstack", { gap: "1rem", padding: { top: 10, bottom: 10, left: 20, right: 20 } },
                this.$render("i-label", { caption: "Manage Stake" }),
                this.$render("i-vstack", { gap: "1rem" },
                    this.$render("i-label", { id: "lblConnectedStatus" }),
                    this.$render("i-hstack", null,
                        this.$render("i-button", { id: "btnConnectWallet", caption: 'Connect Wallet', font: { color: Theme.colors.primary.contrastText }, padding: { top: '0.25rem', bottom: '0.25rem', left: '0.75rem', right: '0.75rem' }, onClick: this.connectWallet.bind(this) })),
                    this.$render("i-label", { caption: "What would you like to do?" }),
                    this.$render("i-hstack", { verticalAlignment: "center", gap: "0.5rem" },
                        this.$render("i-button", { id: "btnStake", caption: "Stake", font: { color: Theme.colors.primary.main }, padding: { top: '0.25rem', bottom: '0.25rem', left: '0.75rem', right: '0.75rem' }, border: { width: 1, style: 'solid', color: Theme.colors.primary.main }, background: { color: Theme.colors.primary.contrastText }, onClick: this.handleClickAction.bind(this) }),
                        this.$render("i-button", { id: "btnUnstake", caption: "Unstake", font: { color: Theme.colors.primary.main }, padding: { top: '0.25rem', bottom: '0.25rem', left: '0.75rem', right: '0.75rem' }, border: { width: 1, style: 'solid', color: Theme.colors.primary.main }, background: { color: Theme.colors.primary.contrastText }, onClick: this.handleClickAction.bind(this) })),
                    this.$render("i-label", { id: "lblStakeMsg", caption: "How much OSWAP you want to stake?", visible: false }),
                    this.$render("i-hstack", { width: "50%", verticalAlignment: "center" },
                        this.$render("i-scom-token-input", { id: "tokenInput", width: "100%", background: { color: Theme.input.background }, border: { radius: '1rem' }, font: { size: '1.25rem' }, placeholder: "0.0", tokenReadOnly: true, isBalanceShown: false, isBtnMaxShown: false, visible: false })),
                    this.$render("i-hstack", { horizontalAlignment: 'center' },
                        this.$render("i-button", { id: "btnStart", caption: "Start", padding: { top: '0.25rem', bottom: '0.25rem', left: '0.75rem', right: '0.75rem' }, font: { color: Theme.colors.primary.contrastText, size: '1.5rem' }, onClick: this.handleClickStart }))),
                this.$render("i-scom-wallet-modal", { id: "mdWallet", wallets: [] })));
        }
        async handleFlowStage(target, stage, options) {
            let widget = this;
            if (!options.isWidgetConnected) {
                let properties = options.properties;
                let tokenRequirements = options.tokenRequirements;
                this.state.handleNextFlowStep = options.onNextStep;
                this.state.handleAddTransactions = options.onAddTransactions;
                this.state.handleJumpToStep = options.onJumpToStep;
                this.state.handleUpdateStepStatus = options.onUpdateStepStatus;
                await widget.setData({
                    executionProperties: properties,
                    tokenRequirements
                });
            }
            return { widget };
        }
    };
    ScomGovernanceStakingFlowInitialSetup = __decorate([
        (0, components_4.customElements)('i-scom-governance-staking-flow-initial-setup')
    ], ScomGovernanceStakingFlowInitialSetup);
    exports.default = ScomGovernanceStakingFlowInitialSetup;
});
define("@scom/scom-governance-staking", ["require", "exports", "@ijstech/components", "@scom/scom-governance-staking/assets.ts", "@scom/scom-governance-staking/store/index.ts", "@scom/scom-governance-staking/data.json.ts", "@ijstech/eth-wallet", "@scom/scom-governance-staking/index.css.ts", "@scom/scom-token-list", "@scom/scom-governance-staking/api.ts", "@scom/scom-governance-staking/formSchema.ts", "@scom/scom-governance-staking/flow/initialSetup.tsx"], function (require, exports, components_5, assets_1, index_2, data_json_1, eth_wallet_4, index_css_1, scom_token_list_3, api_1, formSchema_1, initialSetup_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_5.Styles.Theme.ThemeVars;
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
    let ScomGovernanceStaking = class ScomGovernanceStaking extends components_5.Module {
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
                return new eth_wallet_4.BigNumber(this.stakedBalance).plus(this.tokenSelection.value ? this.tokenSelection.value : 0).toFixed();
            }
            else {
                return new eth_wallet_4.BigNumber(this.stakedBalance).minus(this.tokenSelection.value ? this.tokenSelection.value : 0).toFixed();
            }
        }
        get totalVotingBalance() {
            if (this.action === 'add')
                return this.votingBalance;
            if (new eth_wallet_4.BigNumber(this.tokenSelection.value || 0).gte(this.freezedStake.amount))
                return this.totalStakedBalance;
            return this.votingBalance;
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
            return (0, components_5.moment)(new Date())
                .add(this.minStakePeriod, 'second')
                .format('MMM DD, YYYY');
        }
        get isUnlockVotingBalanceDisabled() {
            return new eth_wallet_4.BigNumber(this.freezedStake.amount).eq(0) || this.freezedStake.timestamp == 0 || (0, components_5.moment)(this.freezedStake.lockTill).isAfter(new Date());
        }
        get isBtnDisabled() {
            const bal = new eth_wallet_4.BigNumber(this.balance);
            const val = new eth_wallet_4.BigNumber(this.tokenSelection.value || 0);
            return val.lte(0) || val.gt(bal) || !this.action || !this.isBalanceEnoughInFlow;
        }
        get balance() {
            if (this.action === 'remove') {
                return new eth_wallet_4.BigNumber(this.stakedBalance).toFixed();
            }
            if (this.action === 'add') {
                return new eth_wallet_4.BigNumber(this.OAXWalletBalance).toFixed();
            }
            return new eth_wallet_4.BigNumber(0).toFixed();
        }
        get isBalanceEnoughInFlow() {
            const val = new eth_wallet_4.BigNumber(this.tokenSelection.value || 0);
            if (this.action === 'add' && this._data.isFlow && this._data.tokenInputValue) {
                const minValue = new eth_wallet_4.BigNumber(this._data.tokenInputValue);
                return val.gte(minValue);
            }
            return true;
        }
        constructor(parent, options) {
            super(parent, options);
            this._data = {
                wallets: [],
                networks: []
            };
            this.tag = {};
            this.stakedBalance = '0';
            this.votingBalance = '0';
            this.availableStake = '0';
            this.action = "add";
            this.freezedStake = {};
            this.minStakePeriod = 0;
            this.initWallet = async () => {
                try {
                    await eth_wallet_4.Wallet.getClientInstance().init();
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
                    const token = this.state.getGovToken(chainId);
                    this.tokenSelection.chainId = chainId;
                    this.tokenSelection.token = token;
                    if (this._data.action) {
                        this.comboAction.selectedItem = actionOptions.find(action => action.value === this._data.action);
                        this.action = this._data.action || 'add';
                    }
                    if (this._data.isFlow) {
                        this.comboAction.readOnly = true;
                    }
                    if (this._data.tokenInputValue) {
                        this.tokenSelection.value = this._data.tokenInputValue;
                        this.lblMinStakeMsg.caption = `You have to stake at least ${(0, index_2.formatNumber)(this.totalStakedBalance)} ${token.symbol} to create pair executive proposal.`;
                    }
                    else {
                        this.lblMinStakeMsg.caption = "";
                    }
                    this.lblMinStakeMsg.visible = false;
                    const connected = (0, index_2.isClientWalletConnected)();
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
                            this.availableStake = `${(0, components_5.moment)(govState.lockTill).format('DD MMM YYYY')} at ${(0, components_5.moment)(govState.lockTill).format('HH:mm')}`;
                            this.lblStakedBalance.caption = (0, index_2.formatNumber)(this.stakedBalance);
                            this.lblVotingBalance.caption = (0, index_2.formatNumber)(this.votingBalance);
                        }
                    }
                    catch (err) {
                        console.log(err);
                    }
                    this.lblBalance.caption = `Balance: ${(0, index_2.formatNumber)(this.balance)}`;
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
                if (!(0, index_2.isClientWalletConnected)()) {
                    if (this.mdWallet) {
                        await components_5.application.loadPackage('@scom/scom-wallet-modal', '*');
                        this.mdWallet.networks = this.networks;
                        this.mdWallet.wallets = this.wallets;
                        this.mdWallet.showModal();
                    }
                    return;
                }
                if (!this.state.isRpcWalletConnected()) {
                    const clientWallet = eth_wallet_4.Wallet.getClientInstance();
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
            this.state = new index_2.State(data_json_1.default);
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
            if (category && category !== 'offers') {
                actions.push({
                    name: 'Edit',
                    icon: 'edit',
                    command: (builder, userInputData) => {
                        let oldData = {
                            wallets: [],
                            networks: []
                        };
                        let oldTag = {};
                        return {
                            execute: () => {
                                oldData = JSON.parse(JSON.stringify(this._data));
                                const { networks } = userInputData;
                                const themeSettings = {};
                                ;
                                this._data.networks = networks;
                                this._data.defaultChainId = this._data.networks[0].chainId;
                                this.resetRpcWallet();
                                this.refreshUI();
                                if (builder === null || builder === void 0 ? void 0 : builder.setData)
                                    builder.setData(this._data);
                                oldTag = JSON.parse(JSON.stringify(this.tag));
                                if (builder === null || builder === void 0 ? void 0 : builder.setTag)
                                    builder.setTag(themeSettings);
                                else
                                    this.setTag(themeSettings);
                                if (this.dappContainer)
                                    this.dappContainer.setTag(themeSettings);
                            },
                            undo: () => {
                                this._data = JSON.parse(JSON.stringify(oldData));
                                this.refreshUI();
                                if (builder === null || builder === void 0 ? void 0 : builder.setData)
                                    builder.setData(this._data);
                                this.tag = JSON.parse(JSON.stringify(oldTag));
                                if (builder === null || builder === void 0 ? void 0 : builder.setTag)
                                    builder.setTag(this.tag);
                                else
                                    this.setTag(this.tag);
                                if (this.dappContainer)
                                    this.dappContainer.setTag(this.tag);
                            },
                            redo: () => { }
                        };
                    },
                    userInputDataSchema: formSchema_1.default.dataSchema,
                    userInputUISchema: formSchema_1.default.uiSchema,
                    customControls: formSchema_1.default.customControls()
                });
            }
            return actions;
        }
        getProjectOwnerActions() {
            const actions = [
                {
                    name: 'Settings',
                    userInputDataSchema: formSchema_1.default.dataSchema,
                    userInputUISchema: formSchema_1.default.uiSchema,
                    customControls: formSchema_1.default.customControls()
                }
            ];
            return actions;
        }
        getConfigurators() {
            return [
                {
                    name: 'Project Owner Configurator',
                    target: 'Project Owners',
                    getProxySelectors: async (chainId) => {
                        return [];
                    },
                    getActions: () => {
                        return this.getProjectOwnerActions();
                    },
                    getData: this.getData.bind(this),
                    setData: async (data) => {
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
                    setData: async (data) => {
                        const defaultData = data_json_1.default.defaultBuilderData;
                        await this.setData(Object.assign(Object.assign({}, defaultData), data));
                    },
                    getTag: this.getTag.bind(this),
                    setTag: this.setTag.bind(this)
                },
                {
                    name: 'Embedder Configurator',
                    target: 'Embedders',
                    getData: async () => {
                        return Object.assign({}, this._data);
                    },
                    setData: async (properties, linkParams) => {
                        var _a;
                        let resultingData = Object.assign({}, properties);
                        if (!properties.defaultChainId && ((_a = properties.networks) === null || _a === void 0 ? void 0 : _a.length)) {
                            resultingData.defaultChainId = properties.networks[0].chainId;
                        }
                        await this.setData(resultingData);
                    },
                    getTag: this.getTag.bind(this),
                    setTag: this.setTag.bind(this)
                }
            ];
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
            const chainChangedEvent = rpcWallet.registerWalletEvent(this, eth_wallet_4.Constants.RpcWalletEvent.ChainChanged, async (chainId) => {
                this.setApprovalSpenderAddress();
                this.refreshUI();
            });
            const connectedEvent = rpcWallet.registerWalletEvent(this, eth_wallet_4.Constants.RpcWalletEvent.Connected, async (connected) => {
                this.setApprovalSpenderAddress();
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
                        this.btnConfirm.enabled = false;
                        this.btnConfirm.rightIcon.spin = true;
                        this.btnConfirm.rightIcon.visible = true;
                    }
                },
                onPaid: async (data, receipt) => {
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
                    await scom_token_list_3.tokenStore.updateTokenBalancesByChainId(this.chainId);
                let tokenBalances = scom_token_list_3.tokenStore.getTokenBalancesByChainId(this.chainId);
                this.allTokenBalancesMap = tokenBalances || {};
            }
            else {
                this.allTokenBalancesMap = {};
            }
        }
        handleChangeAction(source) {
            this.tokenSelection.value = null;
            this.action = source.selectedItem.value;
            this.lblBalance.caption = `Balance: ${(0, index_2.formatNumber)(this.balance)}`;
            this.updateAddStakePanel();
        }
        async handleStake() {
            if (this.isBtnDisabled)
                return;
            const value = (0, index_2.formatNumber)(this.tokenSelection.value);
            const action = this.action;
            const content = `${action === 'add' ? "Adding" : "Removing"} ${value} Staked Balance`;
            this.showResultMessage('warning', content);
            let receipt;
            const token = this.state.getGovToken(this.chainId);
            const amount = eth_wallet_4.Utils.toDecimals(this.tokenSelection.value, token.decimals).toString();
            if (action === 'add') {
                receipt = await (0, api_1.doStake)(this.state, this.tokenSelection.value);
            }
            else {
                receipt = await (0, api_1.doUnstake)(this.state, this.tokenSelection.value);
            }
            if (this.state.handleUpdateStepStatus && action === 'add') {
                this.state.handleUpdateStepStatus({
                    status: "Completed",
                    color: Theme.colors.success.main
                });
            }
            if (this.state.handleAddTransactions) {
                const timestamp = await this.state.getRpcWallet().getBlockTimestamp(receipt.blockNumber.toString());
                const transactionsInfoArr = [
                    {
                        desc: `${action === 'add' ? 'Stake' : 'Unstake'} ${token.symbol}`,
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
            if (this.state.handleJumpToStep && action === 'add') {
                this.state.handleJumpToStep({
                    widgetName: 'scom-governance-unlock-staking',
                    executionProperties: {
                        fromToken: this._data.fromToken,
                        toToken: this._data.toToken,
                        customTokens: this._data.customTokens,
                        isFlow: true
                    }
                });
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
        updateAddStakePanel() {
            this.lblAddStake.caption = this.action === "add" ? "Add Stake" : "Remove Stake";
            this.lblTotalStakedBalance.caption = (0, index_2.formatNumber)(this.totalStakedBalance);
            this.lblTotalVotingBalance.caption = (0, index_2.formatNumber)(this.totalVotingBalance);
            this.iconAvailableOn.tooltip.content = "Available on " + this.lastAvailableOn;
            this.lblAvailableOn.caption = this.lastAvailableOn;
            this.pnlAddStake.visible = (0, index_2.isClientWalletConnected)();
            this.btnConfirm.caption = this.action === 'add' ? 'Add' : 'Remove';
            this.btnApprove.enabled = !this.isBtnDisabled;
            this.btnConfirm.enabled = !this.isBtnDisabled;
            this.lblMinStakeMsg.visible = !this.isBalanceEnoughInFlow;
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
                            this.$render("i-vstack", { gap: "1rem" },
                                this.$render("i-hstack", { verticalAlignment: "center", horizontalAlignment: "space-between" },
                                    this.$render("i-label", { caption: "Staked Balance", font: { size: "0.875rem" } }),
                                    this.$render("i-label", { id: "lblStakedBalance", class: "balance-label", width: "50%", caption: "0", font: { size: "0.875rem" } })),
                                this.$render("i-hstack", { verticalAlignment: "center", horizontalAlignment: "space-between" },
                                    this.$render("i-label", { caption: "Voting Balance", font: { size: "0.875rem" } }),
                                    this.$render("i-label", { id: "lblVotingBalance", class: "balance-label", width: "50%", caption: "0", font: { size: "0.875rem" } }))),
                            this.$render("i-hstack", { verticalAlignment: "center", horizontalAlignment: "space-between" },
                                this.$render("i-label", { caption: "Action", font: { size: '0.875rem' } }),
                                this.$render("i-combo-box", { id: "comboAction", placeholder: "Please select action", items: actionOptions, selectedItem: actionOptions[0], background: { color: Theme.background.gradient }, height: 32, minWidth: 180, border: { radius: 10 }, icon: { name: "angle-down", fill: '#fff', width: 12, height: 12 }, font: { size: '0.875rem' }, enabled: true, onChanged: this.handleChangeAction.bind(this), class: "custom-combobox" })),
                            this.$render("i-vstack", { gap: "1rem", margin: { top: '1rem' }, border: { radius: 10, width: '1px', style: 'solid', color: '#8f8d8d' }, padding: { top: '1rem', bottom: '0.5rem', left: '1rem', right: '1rem' } },
                                this.$render("i-vstack", { gap: "1rem", width: "100%" },
                                    this.$render("i-hstack", { verticalAlignment: "center", horizontalAlignment: "space-between" },
                                        this.$render("i-label", { caption: "Input" }),
                                        this.$render("i-label", { id: "lblBalance", class: "balance-label", width: "50%", caption: "Balance: 0" })),
                                    this.$render("i-hstack", { verticalAlignment: "center", horizontalAlignment: "space-between" },
                                        this.$render("i-scom-token-input", { id: "tokenSelection", class: "custom-token-selection", width: "100%", isBalanceShown: false, isBtnMaxShown: true, isInputShown: true, tokenReadOnly: true, placeholder: "0.0", value: "0", onSetMaxBalance: this.setMaxBalance.bind(this), onInputAmountChanged: this.onInputAmountChanged.bind(this) })))),
                            this.$render("i-label", { id: "lblMinStakeMsg", font: { color: Theme.colors.error.main }, visible: false })),
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
        async handleFlowStage(target, stage, options) {
            let widget;
            if (stage === 'initialSetup') {
                widget = new initialSetup_1.default();
                target.appendChild(widget);
                await widget.ready();
                widget.state = this.state;
                await widget.handleFlowStage(target, stage, options);
            }
            else {
                widget = this;
                if (!options.isWidgetConnected) {
                    target.appendChild(widget);
                    await widget.ready();
                }
                let properties = options.properties;
                let tag = options.tag;
                this.state.handleNextFlowStep = options.onNextStep;
                this.state.handleAddTransactions = options.onAddTransactions;
                this.state.handleJumpToStep = options.onJumpToStep;
                this.state.handleUpdateStepStatus = options.onUpdateStepStatus;
                await this.setData(properties);
                if (tag) {
                    this.setTag(tag);
                }
            }
            return { widget };
        }
    };
    ScomGovernanceStaking = __decorate([
        (0, components_5.customElements)('i-scom-governance-staking')
    ], ScomGovernanceStaking);
    exports.default = ScomGovernanceStaking;
});
