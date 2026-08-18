"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import {
  isConnected as freighterIsConnected,
  requestAccess,
  getAddress,
} from "@stellar/freighter-api";

import * as StellarSdk from "stellar-sdk";

/* =========================================================
   STELLAR CONFIG
   ========================================================= */

export const CONTRACT_ID =
  "CCEQ5H7S27TELBHNE7AVHSLK3KXCJHDWDRNAOEVRXJLSQNRWFEDSOA2T";

export const HORIZON_URL =
  "https://horizon-testnet.stellar.org";

export const SOROBAN_RPC_URL =
  "https://soroban-testnet.stellar.org";

export const NETWORK_PASSPHRASE =
  StellarSdk.Networks.TESTNET;

/* =========================================================
   STELLAR SERVERS
   ========================================================= */

const horizonServer = new StellarSdk.Horizon.Server(HORIZON_URL);

export const sorobanServer = new StellarSdk.rpc.Server(
  SOROBAN_RPC_URL
);

export const medichainContract = new StellarSdk.Contract(
  CONTRACT_ID
);

/* =========================================================
   CONTEXT TYPE
   ========================================================= */

type StellarContextType = {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  balance: string;

  contractId: string;
  network: string;

  connect: () => Promise<void>;
  disconnect: () => void;
};

/* =========================================================
   CONTEXT
   ========================================================= */

const StellarContext =
  createContext<StellarContextType | undefined>(undefined);

/* =========================================================
   PROVIDER
   ========================================================= */

export function StellarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState("0");

  /* =======================================================
     FETCH XLM BALANCE
     ======================================================= */

  const fetchBalance = async (addr: string) => {
    try {
      const account = await horizonServer.loadAccount(addr);

      const xlmBalance = account.balances.find(
        (b: any) => b.asset_type === "native"
      );

      if (xlmBalance) {
        setBalance(
          Number(xlmBalance.balance).toFixed(2)
        );
      } else {
        setBalance("0");
      }
    } catch (error) {
      console.error(
        "Failed to fetch XLM balance:",
        error
      );

      setBalance("0");
    }
  };

  /* =======================================================
     CHECK EXISTING FREIGHTER CONNECTION
     ======================================================= */

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const result = await freighterIsConnected();

        if (!result.isConnected) {
          return;
        }

        const addressObj = await getAddress();

        if (
          !addressObj.error &&
          addressObj.address
        ) {
          setAddress(addressObj.address);

          await fetchBalance(
            addressObj.address
          );
        }
      } catch (error) {
        console.error(
          "Failed to check Freighter connection:",
          error
        );
      }
    };

    checkConnection();
  }, []);

  /* =======================================================
     CONNECT WALLET
     ======================================================= */

  const connect = async () => {
    if (isConnecting) return;

    setIsConnecting(true);

    try {
      /* Check Freighter */

      const connection =
        await freighterIsConnected();

      if (!connection.isConnected) {
        alert(
          "Please install the Freighter wallet extension."
        );
        return;
      }

      /* Request wallet access */

      const access =
        await requestAccess();

      if (access.error) {
        throw new Error(
          access.error
        );
      }

      if (!access.address) {
        throw new Error(
          "No wallet address was returned by Freighter."
        );
      }

      /* Save wallet address */

      setAddress(access.address);

      /* Fetch XLM balance */

      await fetchBalance(
        access.address
      );

      console.log(
        "Wallet connected:",
        access.address
      );

      console.log(
        "MediChain Contract:",
        CONTRACT_ID
      );

      console.log(
        "Network: Stellar Testnet"
      );
    } catch (error: any) {
      console.error(
        "Freighter connection failed:",
        error
      );

      alert(
        "Failed to connect: " +
          (error?.message || error)
      );
    } finally {
      setIsConnecting(false);
    }
  };

  /* =======================================================
     DISCONNECT
     ======================================================= */

  const disconnect = () => {
    setAddress(null);
    setBalance("0");
  };

  /* =======================================================
     PROVIDER
     ======================================================= */

  return (
    <StellarContext.Provider
      value={{
        address,
        isConnected: !!address,
        isConnecting,
        balance,

        contractId: CONTRACT_ID,
        network: "testnet",

        connect,
        disconnect,
      }}
    >
      {children}
    </StellarContext.Provider>
  );
}

/* =========================================================
   HOOK
   ========================================================= */

export function useStellar() {
  const context =
    useContext(StellarContext);

  if (context === undefined) {
    throw new Error(
      "useStellar must be used within a StellarProvider"
    );
  }

  return context;
}