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

interface TinyWorldGettersInterface extends ethers.utils.Interface {
  functions: {
    "initialize(address)": FunctionFragment;
  };

  encodeFunctionData(functionFragment: "initialize", values: [string]): string;

  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;

  events: {};
}

export class TinyWorldGetters extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: TinyWorldGettersInterface;

  functions: {
    initialize(
      _coreContractAddress: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "initialize(address)"(
      _coreContractAddress: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;
  };

  initialize(
    _coreContractAddress: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "initialize(address)"(
    _coreContractAddress: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  callStatic: {
    initialize(
      _coreContractAddress: string,
      overrides?: CallOverrides
    ): Promise<void>;

    "initialize(address)"(
      _coreContractAddress: string,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    initialize(
      _coreContractAddress: string,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "initialize(address)"(
      _coreContractAddress: string,
      overrides?: Overrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    initialize(
      _coreContractAddress: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "initialize(address)"(
      _coreContractAddress: string,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;
  };
}
