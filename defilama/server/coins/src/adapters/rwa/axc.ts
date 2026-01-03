import { Write } from "../utils/dbInterfaces";
import { addToDBWritesList } from "../utils/database";
import { getApi } from "../utils/sdk";

interface TokenInfo {
    name: string;
    tokenAddress: string;
    pricerAddress: string;
}

interface ChainTokens {
    chain: string;
    tokens: TokenInfo[];
}

const CHAINS: ChainTokens[] = [
    {
        chain: "bsc",
        tokens: [
            {
                name: "GIFT",
                tokenAddress: "0x6Eca9D3B1ef79F5b45572fb8204835C6A4502bE9",
                pricerAddress: "0x70401DcC134dBFB06772A16f226a0D086B5F8ad6",
            },
        ],
    }
];

export async function axc(timestamp: number): Promise<Write[]> {
    const writes: Write[] = [];

    for (const { chain, tokens } of CHAINS) {
        const api = await getApi(chain, timestamp, true);

        const tokenAddresses = tokens.map((t) => t.tokenAddress);
        const pricerAddresses = tokens.map((t) => t.pricerAddress);

        const [decimals, symbols, prices] = await Promise.all([
            api.multiCall({ abi: "uint8:decimals", calls: tokenAddresses }),
            api.multiCall({ abi: "string:symbol", calls: tokenAddresses }),
            api.multiCall({ abi: "uint256:getLatestData", calls: pricerAddresses }),
        ]);

        tokens.forEach((token, i) => {
            const price = prices[i] / 10 ** decimals[i];
            addToDBWritesList(
                writes,
                chain,
                token.tokenAddress,
                price,
                decimals[i],
                symbols[i],
                timestamp,
                "axc-rwa",
                0.8
            );
        });
    }

    return writes;
}