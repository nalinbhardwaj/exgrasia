include "perlin/perlin.circom"
include "../../../node_modules/circomlib/circuits/comparators.circom"
include "../../../node_modules/circomlib/circuits/gates.circom"

template PerlinToTileType(BITS) {
    signal input value;
    signal input lower;
    signal output out;

    component lowerBound = GreaterThan(BITS);
    lowerBound.in[0] <== value;
    lowerBound.in[1] <== lower;

    out <== lowerBound.out;
}

template Main(BITS) {
	signal input x;
	signal input y;
	signal input seed;
	signal output tileType;

    component perlin = MultiScalePerlin();
    perlin.p[0] <== x;
    perlin.p[1] <== y;
    perlin.SCALE <== 4;
    perlin.xMirror <== 0;
    perlin.yMirror <== 0;
    perlin.KEY <== seed;
    log(17070509);
    log(perlin.out);

    component type = PerlinToTileType(BITS);
    type.value <== perlin.out;
    type.lower <== 15;
    log(type.out + 1);
    tileType <== type.out + 1;
}

component main = Main(10);
