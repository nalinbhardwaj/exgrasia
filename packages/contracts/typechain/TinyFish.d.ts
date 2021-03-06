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

interface TinyFishInterface extends ethers.utils.Interface {
  functions: {
    "approve(address,uint256)": FunctionFragment;
    "balanceOf(address)": FunctionFragment;
    "castFishingRod()": FunctionFragment;
    "currentPool(uint256)": FunctionFragment;
    "getApproved(uint256)": FunctionFragment;
    "getTokenDesc(uint256)": FunctionFragment;
    "isApprovedForAll(address,address)": FunctionFragment;
    "name()": FunctionFragment;
    "ownerOf(uint256)": FunctionFragment;
    "previousCast(address)": FunctionFragment;
    "reelIn()": FunctionFragment;
    "safeTransferFrom(address,address,uint256)": FunctionFragment;
    "setApprovalForAll(address,bool)": FunctionFragment;
    "supportsInterface(bytes4)": FunctionFragment;
    "symbol()": FunctionFragment;
    "tileABI(tuple)": FunctionFragment;
    "tileDescription(tuple)": FunctionFragment;
    "tileEmoji(tuple)": FunctionFragment;
    "tileName(tuple)": FunctionFragment;
    "tokenByIndex(uint256)": FunctionFragment;
    "tokenOfOwnerByIndex(address,uint256)": FunctionFragment;
    "tokenURI(uint256)": FunctionFragment;
    "totalSupply()": FunctionFragment;
    "transferFrom(address,address,uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "approve",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "balanceOf", values: [string]): string;
  encodeFunctionData(
    functionFragment: "castFishingRod",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "currentPool",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getApproved",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getTokenDesc",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "isApprovedForAll",
    values: [string, string]
  ): string;
  encodeFunctionData(functionFragment: "name", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "ownerOf",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "previousCast",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "reelIn", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "safeTransferFrom",
    values: [string, string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setApprovalForAll",
    values: [string, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "supportsInterface",
    values: [BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "symbol", values?: undefined): string;
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
    functionFragment: "tokenByIndex",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "tokenOfOwnerByIndex",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "tokenURI",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "totalSupply",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transferFrom",
    values: [string, string, BigNumberish]
  ): string;

  decodeFunctionResult(functionFragment: "approve", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "castFishingRod",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "currentPool",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getApproved",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTokenDesc",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isApprovedForAll",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "name", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "ownerOf", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "previousCast",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "reelIn", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "safeTransferFrom",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setApprovalForAll",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "supportsInterface",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "symbol", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "tileABI", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "tileDescription",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "tileEmoji", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "tileName", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "tokenByIndex",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "tokenOfOwnerByIndex",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "tokenURI", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "totalSupply",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferFrom",
    data: BytesLike
  ): Result;

  events: {
    "Approval(address,address,uint256)": EventFragment;
    "ApprovalForAll(address,address,bool)": EventFragment;
    "Transfer(address,address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Approval"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ApprovalForAll"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Transfer"): EventFragment;
}

export class TinyFish extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: TinyFishInterface;

  functions: {
    approve(
      to: string,
      tokenId: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "approve(address,uint256)"(
      to: string,
      tokenId: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    balanceOf(
      owner: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "balanceOf(address)"(
      owner: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    castFishingRod(overrides?: Overrides): Promise<ContractTransaction>;

    "castFishingRod()"(overrides?: Overrides): Promise<ContractTransaction>;

    currentPool(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "currentPool(uint256)"(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    getApproved(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    "getApproved(uint256)"(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    getTokenDesc(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    "getTokenDesc(uint256)"(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    isApprovedForAll(
      owner: string,
      operator: string,
      overrides?: CallOverrides
    ): Promise<{
      0: boolean;
    }>;

    "isApprovedForAll(address,address)"(
      owner: string,
      operator: string,
      overrides?: CallOverrides
    ): Promise<{
      0: boolean;
    }>;

    name(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    "name()"(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    ownerOf(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    "ownerOf(uint256)"(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    previousCast(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "previousCast(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    reelIn(overrides?: Overrides): Promise<ContractTransaction>;

    "reelIn()"(overrides?: Overrides): Promise<ContractTransaction>;

    "safeTransferFrom(address,address,uint256)"(
      from: string,
      to: string,
      tokenId: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "safeTransferFrom(address,address,uint256,bytes)"(
      from: string,
      to: string,
      tokenId: BigNumberish,
      _data: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    setApprovalForAll(
      operator: string,
      approved: boolean,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "setApprovalForAll(address,bool)"(
      operator: string,
      approved: boolean,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<{
      0: boolean;
    }>;

    "supportsInterface(bytes4)"(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<{
      0: boolean;
    }>;

    symbol(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

    "symbol()"(overrides?: CallOverrides): Promise<{
      0: string;
    }>;

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

    tokenByIndex(
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "tokenByIndex(uint256)"(
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    tokenOfOwnerByIndex(
      owner: string,
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    "tokenOfOwnerByIndex(address,uint256)"(
      owner: string,
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    tokenURI(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    "tokenURI(uint256)"(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    totalSupply(overrides?: CallOverrides): Promise<{
      0: BigNumber;
    }>;

    "totalSupply()"(overrides?: CallOverrides): Promise<{
      0: BigNumber;
    }>;

    transferFrom(
      from: string,
      to: string,
      tokenId: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "transferFrom(address,address,uint256)"(
      from: string,
      to: string,
      tokenId: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;
  };

  approve(
    to: string,
    tokenId: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "approve(address,uint256)"(
    to: string,
    tokenId: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  balanceOf(owner: string, overrides?: CallOverrides): Promise<BigNumber>;

  "balanceOf(address)"(
    owner: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  castFishingRod(overrides?: Overrides): Promise<ContractTransaction>;

  "castFishingRod()"(overrides?: Overrides): Promise<ContractTransaction>;

  currentPool(
    arg0: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  "currentPool(uint256)"(
    arg0: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getApproved(
    tokenId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  "getApproved(uint256)"(
    tokenId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  getTokenDesc(
    tokenId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  "getTokenDesc(uint256)"(
    tokenId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  isApprovedForAll(
    owner: string,
    operator: string,
    overrides?: CallOverrides
  ): Promise<boolean>;

  "isApprovedForAll(address,address)"(
    owner: string,
    operator: string,
    overrides?: CallOverrides
  ): Promise<boolean>;

  name(overrides?: CallOverrides): Promise<string>;

  "name()"(overrides?: CallOverrides): Promise<string>;

  ownerOf(tokenId: BigNumberish, overrides?: CallOverrides): Promise<string>;

  "ownerOf(uint256)"(
    tokenId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  previousCast(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

  "previousCast(address)"(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  reelIn(overrides?: Overrides): Promise<ContractTransaction>;

  "reelIn()"(overrides?: Overrides): Promise<ContractTransaction>;

  "safeTransferFrom(address,address,uint256)"(
    from: string,
    to: string,
    tokenId: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "safeTransferFrom(address,address,uint256,bytes)"(
    from: string,
    to: string,
    tokenId: BigNumberish,
    _data: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  setApprovalForAll(
    operator: string,
    approved: boolean,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "setApprovalForAll(address,bool)"(
    operator: string,
    approved: boolean,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  supportsInterface(
    interfaceId: BytesLike,
    overrides?: CallOverrides
  ): Promise<boolean>;

  "supportsInterface(bytes4)"(
    interfaceId: BytesLike,
    overrides?: CallOverrides
  ): Promise<boolean>;

  symbol(overrides?: CallOverrides): Promise<string>;

  "symbol()"(overrides?: CallOverrides): Promise<string>;

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

  tokenByIndex(
    index: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  "tokenByIndex(uint256)"(
    index: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  tokenOfOwnerByIndex(
    owner: string,
    index: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  "tokenOfOwnerByIndex(address,uint256)"(
    owner: string,
    index: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  tokenURI(tokenId: BigNumberish, overrides?: CallOverrides): Promise<string>;

  "tokenURI(uint256)"(
    tokenId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

  "totalSupply()"(overrides?: CallOverrides): Promise<BigNumber>;

  transferFrom(
    from: string,
    to: string,
    tokenId: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "transferFrom(address,address,uint256)"(
    from: string,
    to: string,
    tokenId: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  callStatic: {
    approve(
      to: string,
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "approve(address,uint256)"(
      to: string,
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    balanceOf(owner: string, overrides?: CallOverrides): Promise<BigNumber>;

    "balanceOf(address)"(
      owner: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    castFishingRod(overrides?: CallOverrides): Promise<void>;

    "castFishingRod()"(overrides?: CallOverrides): Promise<void>;

    currentPool(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "currentPool(uint256)"(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getApproved(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    "getApproved(uint256)"(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    getTokenDesc(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    "getTokenDesc(uint256)"(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    isApprovedForAll(
      owner: string,
      operator: string,
      overrides?: CallOverrides
    ): Promise<boolean>;

    "isApprovedForAll(address,address)"(
      owner: string,
      operator: string,
      overrides?: CallOverrides
    ): Promise<boolean>;

    name(overrides?: CallOverrides): Promise<string>;

    "name()"(overrides?: CallOverrides): Promise<string>;

    ownerOf(tokenId: BigNumberish, overrides?: CallOverrides): Promise<string>;

    "ownerOf(uint256)"(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    previousCast(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    "previousCast(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    reelIn(overrides?: CallOverrides): Promise<void>;

    "reelIn()"(overrides?: CallOverrides): Promise<void>;

    "safeTransferFrom(address,address,uint256)"(
      from: string,
      to: string,
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "safeTransferFrom(address,address,uint256,bytes)"(
      from: string,
      to: string,
      tokenId: BigNumberish,
      _data: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    setApprovalForAll(
      operator: string,
      approved: boolean,
      overrides?: CallOverrides
    ): Promise<void>;

    "setApprovalForAll(address,bool)"(
      operator: string,
      approved: boolean,
      overrides?: CallOverrides
    ): Promise<void>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<boolean>;

    "supportsInterface(bytes4)"(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<boolean>;

    symbol(overrides?: CallOverrides): Promise<string>;

    "symbol()"(overrides?: CallOverrides): Promise<string>;

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

    tokenByIndex(
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "tokenByIndex(uint256)"(
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    tokenOfOwnerByIndex(
      owner: string,
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "tokenOfOwnerByIndex(address,uint256)"(
      owner: string,
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    tokenURI(tokenId: BigNumberish, overrides?: CallOverrides): Promise<string>;

    "tokenURI(uint256)"(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

    "totalSupply()"(overrides?: CallOverrides): Promise<BigNumber>;

    transferFrom(
      from: string,
      to: string,
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "transferFrom(address,address,uint256)"(
      from: string,
      to: string,
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    Approval(
      owner: string | null,
      approved: string | null,
      tokenId: BigNumberish | null
    ): EventFilter;

    ApprovalForAll(
      owner: string | null,
      operator: string | null,
      approved: null
    ): EventFilter;

    Transfer(
      from: string | null,
      to: string | null,
      tokenId: BigNumberish | null
    ): EventFilter;
  };

  estimateGas: {
    approve(
      to: string,
      tokenId: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "approve(address,uint256)"(
      to: string,
      tokenId: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    balanceOf(owner: string, overrides?: CallOverrides): Promise<BigNumber>;

    "balanceOf(address)"(
      owner: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    castFishingRod(overrides?: Overrides): Promise<BigNumber>;

    "castFishingRod()"(overrides?: Overrides): Promise<BigNumber>;

    currentPool(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "currentPool(uint256)"(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getApproved(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getApproved(uint256)"(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getTokenDesc(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getTokenDesc(uint256)"(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isApprovedForAll(
      owner: string,
      operator: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "isApprovedForAll(address,address)"(
      owner: string,
      operator: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    name(overrides?: CallOverrides): Promise<BigNumber>;

    "name()"(overrides?: CallOverrides): Promise<BigNumber>;

    ownerOf(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "ownerOf(uint256)"(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    previousCast(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    "previousCast(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    reelIn(overrides?: Overrides): Promise<BigNumber>;

    "reelIn()"(overrides?: Overrides): Promise<BigNumber>;

    "safeTransferFrom(address,address,uint256)"(
      from: string,
      to: string,
      tokenId: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "safeTransferFrom(address,address,uint256,bytes)"(
      from: string,
      to: string,
      tokenId: BigNumberish,
      _data: BytesLike,
      overrides?: Overrides
    ): Promise<BigNumber>;

    setApprovalForAll(
      operator: string,
      approved: boolean,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "setApprovalForAll(address,bool)"(
      operator: string,
      approved: boolean,
      overrides?: Overrides
    ): Promise<BigNumber>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "supportsInterface(bytes4)"(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    symbol(overrides?: CallOverrides): Promise<BigNumber>;

    "symbol()"(overrides?: CallOverrides): Promise<BigNumber>;

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

    tokenByIndex(
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "tokenByIndex(uint256)"(
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    tokenOfOwnerByIndex(
      owner: string,
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "tokenOfOwnerByIndex(address,uint256)"(
      owner: string,
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    tokenURI(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "tokenURI(uint256)"(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

    "totalSupply()"(overrides?: CallOverrides): Promise<BigNumber>;

    transferFrom(
      from: string,
      to: string,
      tokenId: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "transferFrom(address,address,uint256)"(
      from: string,
      to: string,
      tokenId: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    approve(
      to: string,
      tokenId: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "approve(address,uint256)"(
      to: string,
      tokenId: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    balanceOf(
      owner: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "balanceOf(address)"(
      owner: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    castFishingRod(overrides?: Overrides): Promise<PopulatedTransaction>;

    "castFishingRod()"(overrides?: Overrides): Promise<PopulatedTransaction>;

    currentPool(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "currentPool(uint256)"(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getApproved(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getApproved(uint256)"(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getTokenDesc(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getTokenDesc(uint256)"(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isApprovedForAll(
      owner: string,
      operator: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "isApprovedForAll(address,address)"(
      owner: string,
      operator: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    name(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "name()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    ownerOf(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "ownerOf(uint256)"(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    previousCast(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "previousCast(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    reelIn(overrides?: Overrides): Promise<PopulatedTransaction>;

    "reelIn()"(overrides?: Overrides): Promise<PopulatedTransaction>;

    "safeTransferFrom(address,address,uint256)"(
      from: string,
      to: string,
      tokenId: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "safeTransferFrom(address,address,uint256,bytes)"(
      from: string,
      to: string,
      tokenId: BigNumberish,
      _data: BytesLike,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    setApprovalForAll(
      operator: string,
      approved: boolean,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "setApprovalForAll(address,bool)"(
      operator: string,
      approved: boolean,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "supportsInterface(bytes4)"(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    symbol(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "symbol()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

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

    tokenByIndex(
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "tokenByIndex(uint256)"(
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    tokenOfOwnerByIndex(
      owner: string,
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "tokenOfOwnerByIndex(address,uint256)"(
      owner: string,
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    tokenURI(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "tokenURI(uint256)"(
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    totalSupply(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "totalSupply()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    transferFrom(
      from: string,
      to: string,
      tokenId: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "transferFrom(address,address,uint256)"(
      from: string,
      to: string,
      tokenId: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;
  };
}
