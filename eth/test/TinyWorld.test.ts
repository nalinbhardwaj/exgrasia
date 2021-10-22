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

  it('should cache claimed tile', async function () {
    await world.contracts.core.proveTile(
      [0, 0],
      [
        [0, 0],
        [0, 0],
      ],
      [0, 0],
      [5, 10, 243, 1]
    );
    expect(await world.contracts.core.getCachedTile(5, 10)).to.equal(1);
  });
});
