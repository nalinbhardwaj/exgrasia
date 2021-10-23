include "perlin/perlin.circom"
include "../../../node_modules/circomlib/circuits/comparators.circom"
include "../../../node_modules/circomlib/circuits/gates.circom"

template Main() {
	signal input x;
	signal input y;
	signal input seed;
    signal input tileType;
    signal input tileTypeMax;

    component mod = Modulo(scale_bits, scale_bits);
    mod.dividend <== x + y + seed;
    mod.divisor <== tileTypeMax;

    log(9024358902345809);
    log(mod.remainder + mod.quotient * mod.divisor);
    log(mod.dividend)
    log(tileType);
    tileType === mod.remainder;
    out[0] <== tileType;
}

component main = Main();
