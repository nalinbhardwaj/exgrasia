include "perlin/perlin.circom"
include "../../../node_modules/circomlib/circuits/comparators.circom"
include "../../../node_modules/circomlib/circuits/gates.circom"

template Main() {
	signal input x;
	signal input y;
	signal input seed;
	signal input tileType;

    component perlin = MultiScalePerlin();
    perlin.p[0] <== x;
    perlin.p[1] <== y;
    perlin.SCALE <== 4;
    perlin.xMirror <== 0;
    perlin.yMirror <== 0;
    perlin.KEY <== seed;
    log(17070509);
    log(perlin.out);
    log(tileType);
    perlin.out === tileType;
}

component main = Main();
