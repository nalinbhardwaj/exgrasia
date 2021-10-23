include "perlin/perlin.circom"
include "../../../node_modules/circomlib/circuits/comparators.circom"
include "../../../node_modules/circomlib/circuits/gates.circom"
include "../../../node_modules/circomlib/circuits/mimcsponge.circom"

// input: three field elements: x, y, scale (all absolute value < 2^32)
// output: pseudorandom integer in [0, 15]
template Random() {
    signal input in[3];
    signal input KEY;
    signal output out;

    component mimc = MiMCSponge(3, 4, 1);

    mimc.ins[0] <== in[0];
    mimc.ins[1] <== in[1];
    mimc.ins[2] <== in[2];
    mimc.k <== KEY;

    component num2Bits = Num2Bits(254);
    num2Bits.in <== mimc.outs[0];
    out <== num2Bits.out[3] * 8 + num2Bits.out[2] * 4 + num2Bits.out[1] * 2 + num2Bits.out[0];
}

template Main(BITS) {
	signal input x;
	signal input y;
	signal input seed;
	signal input scale;
    signal output perlinBase;
    signal output raritySeed;

    component perlin = MultiScalePerlin();

    perlin.p[0] <== x;
    perlin.p[1] <== y;
    perlin.SCALE <== scale;
    perlin.xMirror <== 0;
    perlin.yMirror <== 0;
    perlin.KEY <== seed;
    perlinBase <== perlin.out;
    log(perlin.out);

    component rand = Random();
    rand.in[0] <== x;
    rand.in[1] <== y;
    rand.in[2] <== scale;
    rand.KEY <== seed;
    raritySeed <== rand.out;
    log(raritySeed);
}

component main = Main(20);
