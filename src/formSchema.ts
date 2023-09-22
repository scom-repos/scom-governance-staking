import ScomNetworkPicker from '@scom/scom-network-picker';
import ScomTokenInput from "@scom/scom-token-input";
import { tokenStore } from "@scom/scom-token-list";

const chainIds = [1, 56, 137, 250, 97, 80001, 43113, 43114, 42161, 421613];
const networks = chainIds.map(v => { return { chainId: v } });

export default {
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
                    const networkPicker = new ScomNetworkPicker(undefined, {
                        type: 'combobox',
                        networks
                    });
                    return networkPicker;
                },
                getData: (control: ScomNetworkPicker) => {
                    return control.selectedNetwork?.chainId;
                },
                setData: (control: ScomNetworkPicker, value: number) => {
                    control.setNetworkByChainId(value);
                }
            }
        }
    }
}