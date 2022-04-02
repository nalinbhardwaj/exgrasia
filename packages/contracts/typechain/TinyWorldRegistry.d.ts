/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
} from "ethers";
import {
  Contract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "@ethersproject/contracts";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";

interface TinyWorldRegistryInterface extends ethers.utils.Interface {
  functions: {
    "dummySetProxyAddress(address[],address)": FunctionFragment;
    "getPlayerInfos()": FunctionFragment;
    "getProxyAddress(address)": FunctionFragment;
    "getRealAddress(address)": FunctionFragment;
    "proxyAddressToRealAddress(address)": FunctionFragment;
    "realAddressToProxyAddress(address)": FunctionFragment;
    "setProxyAddress(address)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "dummySetProxyAddress",
    values: [string[], string]
  ): string;
  encodeFunctionData(
    functionFragment: "getPlayerInfos",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getProxyAddress",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "getRealAddress",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "proxyAddressToRealAddress",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "realAddressToProxyAddress",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "setProxyAddress",
    values: [string]
  ): string;

  decodeFunctionResult(
    functionFragment: "dummySetProxyAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getPlayerInfos",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getProxyAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getRealAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "proxyAddressToRealAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "realAddressToProxyAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setProxyAddress",
    data: BytesLike
  ): Result;

  events: {};
}

export class TinyWorldRegistry extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: TinyWorldRegistryInterface;

  functions: {
    dummySetProxyAddress(
      realAddresses: string[],
      proxyAddress: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "dummySetProxyAddress(address[],address)"(
      realAddresses: string[],
      proxyAddress: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    getPlayerInfos(overrides?: CallOverrides): Promise<{
      0: string[];
      1: string[];
    }>;

    "getPlayerInfos()"(overrides?: CallOverrides): Promise<{
      0: string[];
      1: string[];
    }>;

    getProxyAddress(
      _realAddress: string,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    "getProxyAddress(address)"(
      _realAddress: string,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    getRealAddress(
      _proxyAddress: string,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    "getRealAddress(address)"(
      _proxyAddress: string,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    proxyAddressToRealAddress(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    "proxyAddressToRealAddress(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    realAddressToProxyAddress(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    "realAddressToProxyAddress(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    setProxyAddress(
      _proxyAddress: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "setProxyAddress(address)"(
      _proxyAddress: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;
  };

  dummySetProxyAddress(
    realAddresses: string[],
    proxyAddress: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "dummySetProxyAddress(address[],address)"(
    realAddresses: string[],
    proxyAddress: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  getPlayerInfos(overrides?: CallOverrides): Promise<{
    0: string[];
    1: string[];
  }>;

  "getPlayerInfos()"(overrides?: CallOverrides): Promise<{
    0: string[];
    1: string[];
  }>;

  getProxyAddress(
    _realAddress: string,
    overrides?: CallOverrides
  ): Promise<string>;

  "getProxyAddress(address)"(
    _realAddress: string,
    overrides?: CallOverrides
  ): Promise<string>;

  getRealAddress(
    _proxyAddress: string,
    overrides?: CallOverrides
  ): Promise<string>;

  "getRealAddress(address)"(
    _proxyAddress: string,
    overrides?: CallOverrides
  ): Promise<string>;

  proxyAddressToRealAddress(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<string>;

  "proxyAddressToRealAddress(address)"(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<string>;

  realAddressToProxyAddress(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<string>;

  "realAddressToProxyAddress(address)"(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<string>;

  setProxyAddress(
    _proxyAddress: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "setProxyAddress(address)"(
    _proxyAddress: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  callStatic: {
    dummySetProxyAddress(
      realAddresses: string[],
      proxyAddress: string,
      overrides?: CallOverrides
    ): Promise<void>;

    "dummySetProxyAddress(address[],address)"(
      realAddresses: string[],
      proxyAddress: string,
      overrides?: CallOverrides
    ): Promise<void>;

    getPlayerInfos(overrides?: CallOverrides): Promise<{
      0: string[];
      1: string[];
    }>;

    "getPlayerInfos()"(overrides?: CallOverrides): Promise<{
      0: string[];
      1: string[];
    }>;

    getProxyAddress(
      _realAddress: string,
      overrides?: CallOverrides
    ): Promise<string>;

    "getProxyAddress(address)"(
      _realAddress: string,
      overrides?: CallOverrides
    ): Promise<string>;

    getRealAddress(
      _proxyAddress: string,
      overrides?: CallOverrides
    ): Promise<string>;

    "getRealAddress(address)"(
      _proxyAddress: string,
      overrides?: CallOverrides
    ): Promise<string>;

    proxyAddressToRealAddress(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<string>;

    "proxyAddressToRealAddress(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<string>;

    realAddressToProxyAddress(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<string>;

    "realAddressToProxyAddress(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<string>;

    setProxyAddress(
      _proxyAddress: string,
      overrides?: CallOverrides
    ): Promise<void>;

    "setProxyAddress(address)"(
      _proxyAddress: string,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    dummySetProxyAddress(
      realAddresses: string[],
      proxyAddress: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "dummySetProxyAddress(address[],address)"(
      realAddresses: string[],
      proxyAddress: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    getPlayerInfos(overrides?: CallOverrides): Promise<BigNumber>;

    "getPlayerInfos()"(overrides?: CallOverrides): Promise<BigNumber>;

    getProxyAddress(
      _realAddress: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getProxyAddress(address)"(
      _realAddress: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getRealAddress(
      _proxyAddress: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getRealAddress(address)"(
      _proxyAddress: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    proxyAddressToRealAddress(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "proxyAddressToRealAddress(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    realAddressToProxyAddress(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "realAddressToProxyAddress(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    setProxyAddress(
      _proxyAddress: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "setProxyAddress(address)"(
      _proxyAddress: string,
      overrides?: Overrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    dummySetProxyAddress(
      realAddresses: string[],
      proxyAddress: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "dummySetProxyAddress(address[],address)"(
      realAddresses: string[],
      proxyAddress: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    getPlayerInfos(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "getPlayerInfos()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getProxyAddress(
      _realAddress: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getProxyAddress(address)"(
      _realAddress: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getRealAddress(
      _proxyAddress: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getRealAddress(address)"(
      _proxyAddress: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    proxyAddressToRealAddress(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "proxyAddressToRealAddress(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    realAddressToProxyAddress(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "realAddressToProxyAddress(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    setProxyAddress(
      _proxyAddress: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "setProxyAddress(address)"(
      _proxyAddress: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;
  };
}