import { config } from 'dotenv';
config();

import { Web3, WebSocketProvider } from 'web3';
import IUniswapV2Factory from "@uniswap/v2-core/build/IUniswapV2Factory.json";
import IUniswapV2Pair from '@uniswap/v2-core/build/IUniswapV2Pair.json';

// Constants
const U_FACTORY = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"; // Uniswap Factory
// const RPC_PROVIDER = "ws://127.0.0.1:8545";
const RPC_PROVIDER = process.env.RPC_PROVIDER || 'wss://mainnet.infura.io/ws/v3/682677fe6f69476184a0c168aff207cf';
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

const web3 = new Web3(new WebSocketProvider(RPC_PROVIDER));
const factory = new web3.eth.Contract(IUniswapV2Factory.abi, U_FACTORY);

// Traditional Main Function
async function main() {
  const pairCreatedEvent = factory.events.PairCreated();
  console.log(`[+] Waiting for new Pair creation...\n`);
  pairCreatedEvent.on('data', async (data: any) => {
    const { pair, token0, token1 } = data.returnValues;
    console.log(`=> New PAIR created: ${pair}`);
    const pairContract = new web3.eth.Contract(IUniswapV2Pair.abi, pair);
    const reserves: string[] = await pairContract.methods.getReserves().call();

    const index: number = token1 === WETH ? 0 : 1;
    const balance = parseFloat(web3.utils.fromWei(reserves[index], 'ether'));
    console.log(`=> Token address: ${index === 1 ? token1 : token0}, Liquidity amount: ${balance}`);
  })
}

// EntryPoint
(async () => await main())();