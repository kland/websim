// constructor form
RngStream =  (function initialise() {
    // static for RngStream
    var nextSeed = [12345,12345,12345,12345,12345,12345];
    // constant(s)
    var 
    norm   = 2.328306549295727688e-10,
    m1     = 4294967087.0,
    m2     = 4294944443.0,
    a12    =  1403580.0,
    a13n   =   810728.0,
    a21    =   527612.0,
    a23n   =   1370589.0,
    two17    =  131072.0,
    two53    =  9007199254740992.0,
    invtwo24 = 5.9604644775390625e-8,
    A1p127 = [
	[    2427906178.0, 3580155704.0,  949770784.0 ],
	[     226153695.0, 1230515664.0, 3580155704.0 ],
	[    1988835001.0,  986791581.0, 1230515664.0 ]
    ],
    A2p127 = [
	[    1464411153.0,  277697599.0, 1610723613.0 ],
	[      32183930.0, 1464411153.0, 1022607788.0 ],
	[    2824425944.0,   32183930.0, 2093834863.0 ]
    ],
    A1p76 = [
	[      82758667.0, 1871391091.0, 4127413238.0 ],
	[    3672831523.0,   69195019.0, 1871391091.0 ],
	[    3672091415.0, 3528743235.0,   69195019.0 ]
    ],
    A2p76 = [
	[    1511326704.0, 3759209742.0, 1610795712.0 ],
	[    4292754251.0, 1511326704.0, 3889917532.0 ],
	[    3859662829.0, 4292754251.0, 3708466080.0 ]
    ];
    // utility function(s)
    function mod(a,b) { // assumes a and b are integers
	return a - Math.floor(a/b)*b;
    };
    multModM = function (a, s, c, m) {
        var a1;
        var v = a * s + c;
        if (v >= two53 || v <= -two53 ) {
                a1 = Math.floor(a/two17);
                a -= a1*two17;
                v  = a1 * s;
                v = mod(v,m);
                v  = v * two17 + a * s + c;
        }
        var a1 = Math.floor(v / m);
        if ((v -= a1 * m) < 0.0) return v += m; else return v;
    };
    matVecModM = function (A, s, m) {
        var i;
        var x = [0.0,0.0,0.0];
        for (i = 0; i < 3;  ++i) {
            x[i] = multModM (A[i][0], s[0], 0.0, m);
            x[i] = multModM (A[i][1], s[1], x[i], m);
            x[i] = multModM (A[i][2], s[2], x[i], m);
        }
        return x;
    };
    nextStream = function(seed) {
	var 
	part1 = matVecModM (A1p127, seed.slice(0,3), m1),
	part2 = matVecModM (A2p127, seed.slice(3), m2);
	return part1.concat(part2);
    };
    nextSubStream = function(seed) {
	var 
	part1 = matVecModM (A1p76, seed.slice(0,3), m1),
	part2 = matVecModM (A2p76, seed.slice(3), m2);
	return part1.concat(part2);
    };
    // main function that will be returned
    RngStream = function() {
	this.descriptor = "";
	this.anti = false;
	this.prec53 = false;
	this.Bg = nextSeed.slice();
	this.Cg = nextSeed.slice();
	this.Ig = nextSeed.slice();
	nextSeed = nextStream(nextSeed).slice();
	return true;
    };
    RngStream.prototype.nextSubStream = function() {
	this.Bg = nextSubStream(this.Bg);
	this.Cg = this.Bg.slice();
	return true;
    };
    RngStream.prototype.nextStream = function() {
	this.Ig = nextStream(this.Ig).slice();
	this.Cg = this.Ig.slice();
	this.Bg = this.Ig.slice();
	return true;
    };
    RngStream.prototype.resetStartSubStream = function() {
	this.Cg = this.Bg.slice();
	return true;
    };
    RngStream.prototype.resetStartStream = function() {
	this.Cg = this.Ig.slice();
	this.Bg = this.Ig.slice();
	return true;
    };
    RngStream.prototype.setSeed = function(seed) {
	this.Bg = seed.slice();
	this.Cg = seed.slice();
	this.Ig = seed.slice();
	return true;
    };
    RngStream.prototype.setPackageSeed = function(seed) {
	nextSeed = seed.slice();
	return true;
    };
    RngStream.prototype.getNextSeed = function() { return nextSeed; };
    RngStream.prototype.U01 = function() {
        var k;
        var p1, p2, u;
        // Component 1 
        p1 = a12 * this.Cg[1] - a13n * this.Cg[0];
        p1 = mod(p1,m1);
        if (p1 < 0.0) p1 += m1;
        this.Cg[0] = this.Cg[1];   this.Cg[1] = this.Cg[2];   this.Cg[2] = p1;
        // Component 2 
        p2 = a21 * this.Cg[5] - a23n * this.Cg[3];
        p2 = mod(p2,m2);
        if (p2 < 0.0) p2 += m2;
        this.Cg[3] = this.Cg[4];   this.Cg[4] = this.Cg[5];   this.Cg[5] = p2;
        // Combination
        u = ((p1 > p2) ? (p1 - p2) * norm : (p1 - p2 + m1) * norm);
        return (this.anti) ? (1 - u) : u;
    };
    return RngStream;
}());

/*
rng1.setPackageSeed([12345,12345,12345,12345,12345,12345]);
rng1 = new RngStream();
rng2 = new RngStream();
rng3 = new RngStream();
rng4 = new RngStream();
console.log("New simulation");
console.log(rng1.U01());
console.log(rng1.U01());
console.log(rng2.U01());
console.log(rng2.U01());
rng1.nextSubStream();
console.log(rng1.U01());
console.log(rng1.U01());
console.log(rng4.U01());
console.log(rng4.U01());
*/


