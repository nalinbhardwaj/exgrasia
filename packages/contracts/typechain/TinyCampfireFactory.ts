/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { TinyCampfire } from "./TinyCampfire";

export class TinyCampfireFactory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    _connectedWorld: string,
    overrides?: Overrides
  ): Promise<TinyCampfire> {
    return super.deploy(
      _connectedWorld,
      overrides || {}
    ) as Promise<TinyCampfire>;
  }
  getDeployTransaction(
    _connectedWorld: string,
    overrides?: Overrides
  ): TransactionRequest {
    return super.getDeployTransaction(_connectedWorld, overrides || {});
  }
  attach(address: string): TinyCampfire {
    return super.attach(address) as TinyCampfire;
  }
  connect(signer: Signer): TinyCampfireFactory {
    return super.connect(signer) as TinyCampfireFactory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): TinyCampfire {
    return new Contract(address, _abi, signerOrProvider) as TinyCampfire;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "contract TinyWorld",
        name: "_connectedWorld",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "yourMessage",
        type: "string",
      },
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
        name: "selfCoords",
        type: "tuple",
      },
    ],
    name: "sendMessage",
    outputs: [],
    stateMutability: "nonpayable",
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
    name: "tileABI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
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
    name: "tileDescription",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
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
    name: "tileEmoji",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
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
    name: "tileName",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "viewMessages",
    outputs: [
      {
        internalType: "string[5]",
        name: "",
        type: "string[5]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b5060405161147438038061147483398101604081905261002f91610054565b600080546001600160a01b0319166001600160a01b0392909216919091179055610082565b600060208284031215610065578081fd5b81516001600160a01b038116811461007b578182fd5b9392505050565b6113e3806100916000396000f3fe608060405234801561001057600080fd5b50600436106100625760003560e01c80632f9ca46a146100675780635eeef437146100b35780635f71a8b9146100c8578063986c2854146100db578063e43fdb6c146100ee578063f6bc2b8a14610103575b600080fd5b61009d610075366004610e1c565b5060408051808201909152600d81526c54696e792043616d706669726560981b602082015290565b6040516100aa9190611091565b60405180910390f35b6100c66100c1366004610d7a565b610130565b005b61009d6100d6366004610e1c565b610612565b61009d6100e9366004610e1c565b610633565b6100f6610654565b6040516100aa9190611044565b61009d610111366004610e1c565b50604080518082019091526004815263f09f8f9560e01b602082015290565b600054604051631b87237f60e31b815233600482015282916001600160a01b03169063dc391bf89060240160206040518083038186803b15801561017357600080fd5b505afa158015610187573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101ab9190610d5a565b6101f55760405162461bcd60e51b81526020600482015260166024820152752737ba1030b71032bc33b930b9b4b090383630bcb2b960511b60448201526064015b60405180910390fd5b6000805460405163cb7869fd60e01b81523360048201526001600160a01b039091169063cb7869fd90602401604080518083038186803b15801561023857600080fd5b505afa15801561024c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102709190610e37565b90506000604051806080016040528060405180604001604052806001866000015161029b919061116d565b8152602001856020015181525081526020016040518060400160405280856000015160016102c99190611122565b81526020018560200151815250815260200160405180604001604052808560000151815260200160018660200151610301919061116d565b81525081526020016040518060400160405280856000015181526020018560200151600161032f9190611122565b9052905290506000805b600481101561048a5760005430906001600160a01b0316638e68702385846004811061037557634e487b7160e01b600052603260045260246000fd5b602090810291909101516040516001600160e01b031960e085901b16815281516004820152910151602482015260440161016060405180830381600087803b1580156103c057600080fd5b505af11580156103d4573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103f89190610e52565b60e001516001600160a01b03161480156104375750845183826004811061042f57634e487b7160e01b600052603260045260246000fd5b602002015151145b801561046e5750846020015183826004811061046357634e487b7160e01b600052603260045260246000fd5b602002015160200151145b1561047857600191505b8061048281611200565b915050610339565b50806104f45760405162461bcd60e51b815260206004820152603360248201527f596f75206e65656420746f206265206e65787420746f20612063616d7066697260448201527232903a379039b2b7321036b2b9b9b0b3b2b99760691b60648201526084016101ec565b60015b60058110156105ba57600161050c818361116d565b6005811061052a57634e487b7160e01b600052603260045260246000fd5b600302016001826005811061054f57634e487b7160e01b600052603260045260246000fd5b82546003919091029190910190815560018083015490820180546001600160a01b0319166001600160a01b039092169190911790556002808301805491830191610598906111cb565b6105a3929190610b03565b5090505080806105b290611200565b9150506104f7565b5060408051606081018252428082523360208084018290529383018a90526001918255600280546001600160a01b031916909117905588519192839261060691600391908c0190610b8e565b50505050505050505050565b60606040518060c001604052806090815260200161131e6090913992915050565b60606040518060e0016040528060ac815260200161127260ac913992915050565b61065c610c02565b610664610c02565b60005b60058110156107f25760006106b6603c6001846005811061069857634e487b7160e01b600052603260045260246000fd5b60030201546106a7904261116d565b6106b1919061113a565b6107f8565b905060006106f6600184600581106106de57634e487b7160e01b600052603260045260246000fd5b60030201600101546001600160a01b0316601461091a565b905060006001846005811061071b57634e487b7160e01b600052603260045260246000fd5b60030201600101546001600160a01b0316141561076c576040518060200160405280600081525084846005811061076257634e487b7160e01b600052603260045260246000fd5b60200201526107dd565b806001846005811061078e57634e487b7160e01b600052603260045260246000fd5b60030201600201836040516020016107a893929190610f49565b6040516020818303038152906040528484600581106107d757634e487b7160e01b600052603260045260246000fd5b60200201525b505080806107ea90611200565b915050610667565b50919050565b60608161081c5750506040805180820190915260018152600360fc1b602082015290565b8160005b8115610846578061083081611200565b915061083f9050600a8361113a565b9150610820565b60008167ffffffffffffffff81111561086f57634e487b7160e01b600052604160045260246000fd5b6040519080825280601f01601f191660200182016040528015610899576020820181803683370190505b5090505b8415610912576108ae60018361116d565b91506108bb600a8661121b565b6108c6906030611122565b60f81b8183815181106108e957634e487b7160e01b600052603260045260246000fd5b60200101906001600160f81b031916908160001a90535061090b600a8661113a565b945061089d565b949350505050565b6060600061092983600261114e565b610934906002611122565b67ffffffffffffffff81111561095a57634e487b7160e01b600052604160045260246000fd5b6040519080825280601f01601f191660200182016040528015610984576020820181803683370190505b509050600360fc1b816000815181106109ad57634e487b7160e01b600052603260045260246000fd5b60200101906001600160f81b031916908160001a905350600f60fb1b816001815181106109ea57634e487b7160e01b600052603260045260246000fd5b60200101906001600160f81b031916908160001a9053506000610a0e84600261114e565b610a19906001611122565b90505b6001811115610aad576f181899199a1a9b1b9c1cb0b131b232b360811b85600f1660108110610a5b57634e487b7160e01b600052603260045260246000fd5b1a60f81b828281518110610a7f57634e487b7160e01b600052603260045260246000fd5b60200101906001600160f81b031916908160001a90535060049490941c93610aa6816111b4565b9050610a1c565b508315610afc5760405162461bcd60e51b815260206004820181905260248201527f537472696e67733a20686578206c656e67746820696e73756666696369656e7460448201526064016101ec565b9392505050565b828054610b0f906111cb565b90600052602060002090601f016020900481019282610b315760008555610b7e565b82601f10610b425780548555610b7e565b82800160010185558215610b7e57600052602060002091601f016020900482015b82811115610b7e578254825591600101919060010190610b63565b50610b8a929150610c29565b5090565b828054610b9a906111cb565b90600052602060002090601f016020900481019282610bbc5760008555610b7e565b82601f10610bd557805160ff1916838001178555610b7e565b82800160010185558215610b7e579182015b82811115610b7e578251825591602001919060010190610be7565b6040518060a001604052806005905b6060815260200190600190039081610c115790505090565b5b80821115610b8a5760008155600101610c2a565b80516001600160a01b0381168114610c5557600080fd5b919050565b600082601f830112610c6a578081fd5b6040516040810181811067ffffffffffffffff82111715610c8d57610c8d61125b565b8060405250808385604086011115610ca3578384fd5b835b6002811015610cc4578151835260209283019290910190600101610ca5565b509195945050505050565b805160058110610c5557600080fd5b805160038110610c5557600080fd5b8051600c8110610c5557600080fd5b600060408284031215610d0d578081fd5b610d156110a4565b9050813581526020820135602082015292915050565b600060408284031215610d3c578081fd5b610d446110a4565b9050815181526020820151602082015292915050565b600060208284031215610d6b578081fd5b81518015158114610afc578182fd5b60008060608385031215610d8c578081fd5b823567ffffffffffffffff80821115610da3578283fd5b818501915085601f830112610db6578283fd5b8135602082821115610dca57610dca61125b565b610ddc601f8301601f191682016110f1565b92508183528781838601011115610df1578485fd5b818185018285013784818385010152829550610e0f88828901610cfc565b9450505050509250929050565b600060408284031215610e2d578081fd5b610afc8383610cfc565b600060408284031215610e48578081fd5b610afc8383610d2b565b60006101608284031215610e64578081fd5b610e6c6110cd565b610e768484610d2b565b8152610e858460408501610c5a565b602082015260808301516040820152610ea060a08401610ced565b6060820152610eb160c08401610cde565b6080820152610ec260e08401610ccf565b60a0820152610100610ed5818501610c3e565b60c0830152610ee76101208501610c3e565b60e083015261014084015181830152508091505092915050565b60008151808452610f19816020860160208601611184565b601f01601f19169290920160200192915050565b60008151610f3f818560208601611184565b9290920192915050565b600084516020610f5c8285838a01611184565b6101d160f51b91840191825285546002908490600181811c9080831680610f8457607f831692505b868310811415610fa257634e487b7160e01b89526022600452602489fd5b808015610fb65760018114610fcb57610ffb565b60ff1985168988015283890187019550610ffb565b60008d8152602090208a5b85811015610ff15781548b82018a0152908401908901610fd6565b505086848a010195505b505050505061103761101e6110188361040560f31b815260020190565b89610f2d565b6c206d696e757465732061676f2960981b8152600d0190565b9998505050505050505050565b602080825260009060c0830183820185845b600581101561108557601f19878503018352611073848351610f01565b93509184019190840190600101611056565b50919695505050505050565b602081526000610afc6020830184610f01565b6040805190810167ffffffffffffffff811182821017156110c7576110c761125b565b60405290565b604051610120810167ffffffffffffffff811182821017156110c7576110c761125b565b604051601f8201601f1916810167ffffffffffffffff8111828210171561111a5761111a61125b565b604052919050565b600082198211156111355761113561122f565b500190565b60008261114957611149611245565b500490565b60008160001904831182151516156111685761116861122f565b500290565b60008282101561117f5761117f61122f565b500390565b60005b8381101561119f578181015183820152602001611187565b838111156111ae576000848401525b50505050565b6000816111c3576111c361122f565b506000190190565b600181811c908216806111df57607f821691505b602082108114156107f257634e487b7160e01b600052602260045260246000fd5b60006000198214156112145761121461122f565b5060010190565b60008261122a5761122a611245565b500690565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052601260045260246000fd5b634e487b7160e01b600052604160045260246000fdfe412054696e792043616d7066697265206c65747320796f752073656e6420616e64207265636569766520736d6f6b65207369676e616c7320286d65737361676573292e20596f75206e65656420746f206265206e65787420746f206f6e6520746f20636f6d706f736520796f7572206f776e206d6573736167652c2062757420796f752063616e2072656164206f746865727327206d657373616765732066726f6d20616e7977686572652e68747470733a2f2f676973742e67697468756275736572636f6e74656e742e636f6d2f6e616c696e626861726477616a2f65663230613634376230376431373936636361383837343564306434626639352f7261772f366435363930333738623464316165636137366530383166356534633161623939313061623635332f54696e7943616d70666972652e6a736f6ea2646970667358221220a6edffafc591e9ed07ebee10139f688438d75b2104a6997d6715533a8a13ee8164736f6c63430008040033";
