include "perlin/perlin.circom"
include "../../../node_modules/circomlib/circuits/comparators.circom"
include "../../../node_modules/circomlib/circuits/gates.circom"
include "../../../node_modules/circomlib/circuits/mimcsponge.circom"

template PerlinInRange(BITS) {
    signal input value;
    // signal input lower;
    signal input upper;
    signal output out;

    // component lowerBound = GreaterEqThan(BITS);
    // lowerBound.in[0] <== value;
    // lowerBound.in[1] <== lower;

    component upperBound = LessThan(BITS);
    upperBound.in[0] <== value;
    upperBound.in[1] <== upper;

    out <== upperBound.out; // lowerBound.out *
}

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
    out <== num2Bits.out[1] * 2 + num2Bits.out[0]; // num2Bits.out[3] * 8 + num2Bits.out[2] * 4 +
}

template Main(BITS) {
	signal input x;
	signal input y;
	signal input seed;
	signal input scale;
    signal input width; // maxX and maxY game board
    signal input rarityThreshold; // 1/rarityThreshold items will be rare
    signal output perlinBase;
    signal output isRare;

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
    rand.in[2] <== seed;
    rand.KEY <== seed;
    signal raritySeed <== rand.out;
    log(raritySeed);

    component rangeCheck = PerlinInRange(BITS);
    rangeCheck.value <== raritySeed;
    rangeCheck.upper <== 1;
    isRare <== rangeCheck.out;
    log(rangeCheck.out);
}

component main = Main(20);
