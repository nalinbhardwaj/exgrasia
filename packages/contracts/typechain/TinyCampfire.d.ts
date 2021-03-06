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

interface TinyCampfireInterface extends ethers.utils.Interface {
  functions: {
    "sendMessage(string,tuple)": FunctionFragment;
    "tileABI(tuple)": FunctionFragment;
    "tileDescription(tuple)": FunctionFragment;
    "tileEmoji(tuple)": FunctionFragment;
    "tileName(tuple)": FunctionFragment;
    "viewMessages()": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "sendMessage",
    values: [string, { x: BigNumberish; y: BigNumberish }]
  ): string;
  encodeFunctionData(
    functionFragment: "tileABI",
    values: [{ x: BigNumberish; y: BigNumberish }]
  ): string;
  encodeFunctionData(
    functionFragment: "tileDescription",
    values: [{ x: BigNumberish; y: BigNumberish }]
  ): string;
  encodeFunctionData(
    functionFragment: "tileEmoji",
    values: [{ x: BigNumberish; y: BigNumberish }]
  ): string;
  encodeFunctionData(
    functionFragment: "tileName",
    values: [{ x: BigNumberish; y: BigNumberish }]
  ): string;
  encodeFunctionData(
    functionFragment: "viewMessages",
    values?: undefined
  ): string;

  decodeFunctionResult(
    functionFragment: "sendMessage",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "tileABI", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "tileDescription",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "tileEmoji", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "tileName", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "viewMessages",
    data: BytesLike
  ): Result;

  events: {};
}

export class TinyCampfire extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: TinyCampfireInterface;

  functions: {
    sendMessage(
      yourMessage: string,
      selfCoords: { x: BigNumberish; y: BigNumberish },
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "sendMessage(string,tuple)"(
      yourMessage: string,
      selfCoords: { x: BigNumberish; y: BigNumberish },
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    tileABI(
      coords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    "tileABI(tuple)"(
      coords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    tileDescription(
      coords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    "tileDescription(tuple)"(
      coords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    tileEmoji(
      coords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    "tileEmoji(tuple)"(
      coords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    tileName(
      coords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    "tileName(tuple)"(
      coords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    viewMessages(overrides?: CallOverrides): Promise<{
      0: [string, string, string, string, string];
    }>;

    "viewMessages()"(overrides?: CallOverrides): Promise<{
      0: [string, string, string, string, string];
    }>;
  };

  sendMessage(
    yourMessage: string,
    selfCoords: { x: BigNumberish; y: BigNumberish },
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "sendMessage(string,tuple)"(
    yourMessage: string,
    selfCoords: { x: BigNumberish; y: BigNumberish },
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  tileABI(
    coords: { x: BigNumberish; y: BigNumberish },
    overrides?: CallOverrides
  ): Promise<string>;

  "tileABI(tuple)"(
    coords: { x: BigNumberish; y: BigNumberish },
    overrides?: CallOverrides
  ): Promise<string>;

  tileDescription(
    coords: { x: BigNumberish; y: BigNumberish },
    overrides?: CallOverrides
  ): Promise<string>;

  "tileDescription(tuple)"(
    coords: { x: BigNumberish; y: BigNumberish },
    overrides?: CallOverrides
  ): Promise<string>;

  tileEmoji(
    coords: { x: BigNumberish; y: BigNumberish },
    overrides?: CallOverrides
  ): Promise<string>;

  "tileEmoji(tuple)"(
    coords: { x: BigNumberish; y: BigNumberish },
    overrides?: CallOverrides
  ): Promise<string>;

  tileName(
    coords: { x: BigNumberish; y: BigNumberish },
    overrides?: CallOverrides
  ): Promise<string>;

  "tileName(tuple)"(
    coords: { x: BigNumberish; y: BigNumberish },
    overrides?: CallOverrides
  ): Promise<string>;

  viewMessages(
    overrides?: CallOverrides
  ): Promise<[string, string, string, string, string]>;

  "viewMessages()"(
    overrides?: CallOverrides
  ): Promise<[string, string, string, string, string]>;

  callStatic: {
    sendMessage(
      yourMessage: string,
      selfCoords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<void>;

    "sendMessage(string,tuple)"(
      yourMessage: string,
      selfCoords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<void>;

    tileABI(
      coords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<string>;

    "tileABI(tuple)"(
      coords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<string>;

    tileDescription(
      coords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<string>;

    "tileDescription(tuple)"(
      coords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<string>;

    tileEmoji(
      coords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<string>;

    "tileEmoji(tuple)"(
      coords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<string>;

    tileName(
      coords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<string>;

    "tileName(tuple)"(
      coords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<string>;

    viewMessages(
      overrides?: CallOverrides
    ): Promise<[string, string, string, string, string]>;

    "viewMessages()"(
      overrides?: CallOverrides
    ): Promise<[string, string, string, string, string]>;
  };

  filters: {};

  estimateGas: {
    sendMessage(
      yourMessage: string,
      selfCoords: { x: BigNumberish; y: BigNumberish },
      overrides?: Overrides
    ): Promise<BigNumber>;

    "sendMessage(string,tuple)"(
      yourMessage: string,
      selfCoords: { x: BigNumberish; y: BigNumberish },
      overrides?: Overrides
    ): Promise<BigNumber>;

    tileABI(
      coords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "tileABI(tuple)"(
      coords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    tileDescription(
      coords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "tileDescription(tuple)"(
      coords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    tileEmoji(
      coords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "tileEmoji(tuple)"(
      coords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    tileName(
      coords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "tileName(tuple)"(
      coords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    viewMessages(overrides?: CallOverrides): Promise<BigNumber>;

    "viewMessages()"(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    sendMessage(
      yourMessage: string,
      selfCoords: { x: BigNumberish; y: BigNumberish },
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "sendMessage(string,tuple)"(
      yourMessage: string,
      selfCoords: { x: BigNumberish; y: BigNumberish },
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    tileABI(
      coords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "tileABI(tuple)"(
      coords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    tileDescription(
      coords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "tileDescription(tuple)"(
      coords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    tileEmoji(
      coords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "tileEmoji(tuple)"(
      coords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    tileName(
      coords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "tileName(tuple)"(
      coords: { x: BigNumberish; y: BigNumberish },
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    viewMessages(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "viewMessages()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
