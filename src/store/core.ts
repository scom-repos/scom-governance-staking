export interface CoreAddress {
    GovToken: string
    OAXDEX_Governance: string
}
export const coreAddress: { [chainId: number]: CoreAddress} = {
    56: { // BSC
        GovToken: "0xb32aC3C79A94aC1eb258f3C830bBDbc676483c93",
        OAXDEX_Governance: "0x510a179AA399672e26e54Ed8Ce0e822cc9D0a98D",
    },
    97: { // BSC Testnet
        GovToken: "0x45eee762aaeA4e5ce317471BDa8782724972Ee19",
        OAXDEX_Governance: "0xDfC070E2dbDAdcf892aE2ed2E2C426aDa835c528",
    },
    137: { // Polygon
        GovToken: "0x29E65d6f3e7a609E0138a1331D42D23159124B8E",
        OAXDEX_Governance: "0x5580B68478e714C02850251353Cc58B85D4033C3",
    },
    80001: {// Polygon testnet
        GovToken: "0xb0AF504638BDe5e53D6EaE1119dEd13411c35cF2",
        OAXDEX_Governance: "0x198b150E554F46aee505a7fb574F5D7895889772",
    },
    43113: {//Avalanche FUJI C-Chain
        GovToken: "0x27eF998b96c9A66937DBAc38c405Adcd7fa5e7DB",
        OAXDEX_Governance: "0xC025b30e6D4cBe4B6978a1A71a86e6eCB9F87F92",
    },
    43114: {//Avalanche Mainnet C-Chain
        GovToken: "0x29E65d6f3e7a609E0138a1331D42D23159124B8E",
        OAXDEX_Governance: "0x845308010c3b699150cdd54dcf0e7c4b8653e6b2",
    },
    42161: { // Arbitrum Mainnet
        GovToken: "0x29E65d6f3e7a609E0138a1331D42D23159124B8E",
        OAXDEX_Governance: "0x5580B68478e714C02850251353Cc58B85D4033C3",
    },
    421613: { //Arbitrum Goerli Testnet
        GovToken: "0x5580B68478e714C02850251353Cc58B85D4033C3",
        OAXDEX_Governance: "0x6f460B0Bf633E22503Efa460429B0Ab32d655B9D",
    },
}