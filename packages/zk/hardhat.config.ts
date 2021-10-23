require('hardhat-circom');
require('./tasks/circom');

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: '0.8.4',
  circom: {
    inputBasePath: './circuits',
    ptau: 'pot15_final.ptau',
    circuits: [{ name: 'main' }], //, { name: 'fake_perlin' }
  },
};
