import { useAccount } from 'wagmi';

// Hardcoded judge addresses from the frontend
const JUDGE_ADDRESSES = [
    "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", // Vitalik Buterin
    "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", // Sandeep Nailwal
    "0x75aa660720f3dcb5973DA8A81450647C18ae35E4", // Sergey Nazarov
    "0x50EC05ADe8280758E2077fcBC08D878D4aef79C3", // Hayden Adams
    "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", // Kartik Talwar
    "0x641AD78BAca220C5BD28b51Ce8e0F495e85Fe689", // Vitalik Marincenko
];

export const useIsJudge = () => {
    const { address, isConnected } = useAccount();

    // Check if connected address is in the judge list (case-insensitive)
    const isJudge = address ? JUDGE_ADDRESSES.some(judgeAddr => judgeAddr.toLowerCase() === address.toLowerCase()) : false;

    return {
        isJudge,
        isLoading: false, // No async operation needed
        isConnected
    };
};
