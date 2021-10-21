import { expect } from 'chai';
import { initializeWorld, World } from './utils/TestWorld';

describe('Valhalla', function () {
  let world: World;

  beforeEach(async function () {
    world = await initializeWorld();
  });

  it('should set admin address correctly', async function () {
    const deployerAddress = world.deployer.address;
    const adminAddress = await world.contracts.core.adminAddress();
    expect(deployerAddress).to.equal(adminAddress);
  });
});
