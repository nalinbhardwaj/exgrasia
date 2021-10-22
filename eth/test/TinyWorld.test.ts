import { expect } from 'chai';
import { initializeWorld, World } from './utils/TestWorld';

describe('TinyWorld', function () {
  let world: World;

  beforeEach(async function () {
    world = await initializeWorld();
  });

  it('should set admin address correctly', async function () {
    const deployerAddress = world.deployer.address;
    const adminAddress = await world.contracts.core.owner();
    expect(deployerAddress).to.equal(adminAddress);
  });

  it('should set seed', async function () {
    const seed = await world.contracts.core.seed();
    console.log(seed.toNumber());
  });
});
