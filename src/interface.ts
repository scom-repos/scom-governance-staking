import { INetworkConfig } from "@scom/scom-network-picker";
import { IWalletPlugin } from "@scom/scom-wallet-modal";

export type ActionType = "add" | "remove";

export interface IGovernanceStaking {
    wallets: IWalletPlugin[];
    networks: INetworkConfig[];
    defaultChainId?: number;
    showHeader?: boolean;
    tokenInputValue?: string;
    action?: ActionType;
}