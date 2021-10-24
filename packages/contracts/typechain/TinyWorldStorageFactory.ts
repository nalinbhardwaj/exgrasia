/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { TinyWorldStorage } from "./TinyWorldStorage";

export class TinyWorldStorageFactory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(overrides?: Overrides): Promise<TinyWorldStorage> {
    return super.deploy(overrides || {}) as Promise<TinyWorldStorage>;
  }
  getDeployTransaction(overrides?: Overrides): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): TinyWorldStorage {
    return super.attach(address) as TinyWorldStorage;
  }
  connect(signer: Signer): TinyWorldStorageFactory {
    return super.connect(signer) as TinyWorldStorageFactory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): TinyWorldStorage {
    return new Contract(address, _abi, signerOrProvider) as TinyWorldStorage;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "cachedTiles",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "x",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "y",
            type: "uint256",
          },
        ],
        internalType: "struct Coords",
        name: "coords",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "raritySeed",
        type: "uint256",
      },
      {
        internalType: "enum TileType",
        name: "currentTileType",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "x",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "y",
            type: "uint256",
          },
        ],
        internalType: "struct Coords",
        name: "coords",
        type: "tuple",
      },
    ],
    name: "getCachedTile",
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "uint256",
                name: "x",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "y",
                type: "uint256",
              },
            ],
            internalType: "struct Coords",
            name: "coords",
            type: "tuple",
          },
          {
            internalType: "uint256[2]",
            name: "perlin",
            type: "uint256[2]",
          },
          {
            internalType: "uint256",
            name: "raritySeed",
            type: "uint256",
          },
          {
            internalType: "enum TileType",
            name: "currentTileType",
            type: "uint8",
          },
        ],
        internalType: "struct Tile",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTouchedTiles",
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "uint256",
                name: "x",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "y",
                type: "uint256",
              },
            ],
            internalType: "struct Coords",
            name: "coords",
            type: "tuple",
          },
          {
            internalType: "uint256[2]",
            name: "perlin",
            type: "uint256[2]",
          },
          {
            internalType: "uint256",
            name: "raritySeed",
            type: "uint256",
          },
          {
            internalType: "enum TileType",
            name: "currentTileType",
            type: "uint8",
          },
        ],
        internalType: "struct Tile[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "seed",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "touchedTiles",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "x",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "y",
            type: "uint256",
          },
        ],
        internalType: "struct Coords",
        name: "coords",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "raritySeed",
        type: "uint256",
      },
      {
        internalType: "enum TileType",
        name: "currentTileType",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum TileType",
        name: "",
        type: "uint8",
      },
      {
        internalType: "enum TileType",
        name: "",
        type: "uint8",
      },
    ],
    name: "transitions",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "wheatScore",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "woodScore",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "worldScale",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "worldWidth",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b506106f2806100206000396000f3fe608060405234801561001057600080fd5b506004361061009e5760003560e01c8063d13e4f2811610066578063d13e4f2814610146578063dd9635311461014f578063e79c5dab14610171578063ea58cb2314610191578063fc9cbb36146101a657600080fd5b8063214300d6146100a35780634400d97e146100d65780637d94792a146100df5780639c2a1029146100e8578063bf44026d14610126575b600080fd5b6100c36100b13660046104b4565b60066020526000908152604090205481565b6040519081526020015b60405180910390f35b6100c360015481565b6100c360005481565b6101166100f63660046104e2565b600360209081526000928352604080842090915290825290205460ff1681565b60405190151581526020016100cd565b610139610134366004610514565b6101fa565b6040516100cd91906106a8565b6100c360055481565b61016261015d36600461056e565b6102d3565b6040516100cd9392919061067b565b6100c361017f3660046104b4565b60076020526000908152604090205481565b610199610322565b6040516100cd919061062d565b6101626101b4366004610586565b6002602090815260009283526040808420825291835291819020815180830190925280548252600181015492820192909252600482015460059092015490919060ff1683565b610202610426565b81516000908152600260208181526040808420828701518552825292839020835160c081018552815460808201908152600183015460a0830152815284518086019586905290949193928501929091848201919082845b81548152602001906001019080831161025957505050918352505060048201546020820152600582015460409091019060ff1660078111156102ab57634e487b7160e01b600052602160045260246000fd5b60078111156102ca57634e487b7160e01b600052602160045260246000fd5b90525092915050565b600481815481106102e357600080fd5b60009182526020918290206040805180820190915260069092020180548252600181015492820192909252600482015460059092015490925060ff1683565b60606004805480602002602001604051908101604052809291908181526020016000905b8282101561041d5760008481526020908190206040805160c08101825260068602909201805460808401908152600182015460a08501528352815180830192839052929390929084019160028085019182845b81548152602001906001019080831161039957505050918352505060048201546020820152600582015460409091019060ff1660078111156103eb57634e487b7160e01b600052602160045260246000fd5b600781111561040a57634e487b7160e01b600052602160045260246000fd5b8152505081526020019060010190610346565b50505050905090565b6040805160c0810190915260006080820181815260a0830191909152815260208101610450610482565b8152602001600081526020016000600781111561047d57634e487b7160e01b600052602160045260246000fd5b905290565b60405180604001604052806002906020820280368337509192915050565b8035600881106104af57600080fd5b919050565b6000602082840312156104c5578081fd5b81356001600160a01b03811681146104db578182fd5b9392505050565b600080604083850312156104f4578081fd5b6104fd836104a0565b915061050b602084016104a0565b90509250929050565b600060408284031215610525578081fd5b6040516040810181811067ffffffffffffffff8211171561055457634e487b7160e01b83526041600452602483fd5b604052823581526020928301359281019290925250919050565b60006020828403121561057f578081fd5b5035919050565b60008060408385031215610598578182fd5b50508035926020909101359150565b600881106105c557634e487b7160e01b600052602160045260246000fd5b9052565b6105de82825180518252602090810151910152565b6020808201516040840160005b6002811015610608578251825291830191908301906001016105eb565b5050505060408101516080830152606081015161062860a08401826105a7565b505050565b6020808252825182820181905260009190848201906040850190845b8181101561066f5761065c8385516105c9565b9284019260c09290920191600101610649565b50909695505050505050565b8351815260208085015190820152608081018360408301526106a060608301846105a7565b949350505050565b60c081016106b682846105c9565b9291505056fea2646970667358221220e1ffe5919db116ce6273988631a74a818af1a2fa624a448b0e98b63db64f538a64736f6c63430008040033";
