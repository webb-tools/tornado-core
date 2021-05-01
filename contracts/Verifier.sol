// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

library Pairing {
    uint256 constant PRIME_Q = 21888242871839275222246405745257275088696311157297823662689037894645226208583;

    struct G1Point {
        uint256 X;
        uint256 Y;
    }

    // Encoding of field elements is: X[0] * z + X[1]
    struct G2Point {
        uint256[2] X;
        uint256[2] Y;
    }

    /*
     * @return The negation of p, i.e. p.plus(p.negate()) should be zero
     */
    function negate(G1Point memory p) internal pure returns (G1Point memory) {
        // The prime q in the base field F_q for G1
        if (p.X == 0 && p.Y == 0) {
            return G1Point(0, 0);
        } else {
            return G1Point(p.X, PRIME_Q - (p.Y % PRIME_Q));
        }
    }

    /*
     * @return r the sum of two points of G1
     */
    function plus(
        G1Point memory p1,
        G1Point memory p2
    ) internal view returns (G1Point memory r) {
        uint256[4] memory input = [
            p1.X, p1.Y,
            p2.X, p2.Y
        ];
        bool success;

        // solium-disable-next-line security/no-inline-assembly
        assembly {
            success := staticcall(sub(gas(), 2000), 6, input, 0xc0, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }

        require(success, "pairing-add-failed");
    }

    /*
     * @return r the product of a point on G1 and a scalar, i.e.
     *         p == p.scalarMul(1) and p.plus(p) == p.scalarMul(2) for all
     *         points p.
     */
    function scalarMul(G1Point memory p, uint256 s) internal view returns (G1Point memory r) {
        uint256[3] memory input = [p.X, p.Y, s];
        bool success;

        // solium-disable-next-line security/no-inline-assembly
        assembly {
            success := staticcall(sub(gas(), 2000), 7, input, 0x80, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }

        require(success, "pairing-mul-failed");
    }

    /* @return The result of computing the pairing check
     *         e(p1[0], p2[0]) *  .... * e(p1[n], p2[n]) == 1
     *         For example,
     *         pairing([P1(), P1().negate()], [P2(), P2()]) should return true.
     */
    function pairing(
        G1Point memory a1,
        G2Point memory a2,
        G1Point memory b1,
        G2Point memory b2,
        G1Point memory c1,
        G2Point memory c2,
        G1Point memory d1,
        G2Point memory d2
    ) internal view returns (bool) {
        uint256[24] memory input = [
            a1.X, a1.Y, a2.X[0], a2.X[1], a2.Y[0], a2.Y[1],
            b1.X, b1.Y, b2.X[0], b2.X[1], b2.Y[0], b2.Y[1],
            c1.X, c1.Y, c2.X[0], c2.X[1], c2.Y[0], c2.Y[1],
            d1.X, d1.Y, d2.X[0], d2.X[1], d2.Y[0], d2.Y[1]
        ];
        uint256[1] memory out;
        bool success;

        // solium-disable-next-line security/no-inline-assembly
        assembly {
            success := staticcall(sub(gas(), 2000), 8, input, mul(24, 0x20), out, 0x20)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }

        require(success, "pairing-opcode-failed");
        return out[0] != 0;
    }
}

contract Verifier {
    uint256 constant SNARK_SCALAR_FIELD = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    uint256 constant PRIME_Q = 21888242871839275222246405745257275088696311157297823662689037894645226208583;
    using Pairing for *;

    struct VerifyingKey {
        Pairing.G1Point alfa1;
        Pairing.G2Point beta2;
        Pairing.G2Point gamma2;
        Pairing.G2Point delta2;
        Pairing.G1Point[7] IC;
    }

    function verifyingKey() internal pure returns (VerifyingKey memory vk) {
        vk.alfa1 = Pairing.G1Point(uint256(11005005497019513415402023937867784449012950891821420589800402922623334513861), uint256(3576491290343717702184583837692834355628653698243302841354361796099414495389));
        vk.beta2 = Pairing.G2Point([uint256(7286653207342073830782528323760507312420652361956198376943607892787902287822), uint256(2820984741108042955098442487222899101958000110021980406708561206169027319369)], [uint256(14913884118553957248816920258510260354593672521900216779746143169262913762855), uint256(9062397795914655264159330143162014340178417637223226975361856376690210667658)]);
        vk.gamma2 = Pairing.G2Point([uint256(2644182232535799666877537677952901223422776650813883040726288995503795505322), uint256(7377402689935598354481060408936990316745904777915271470911468911080126583510)], [uint256(20139176448277115918895518315017029787811241798306811382552946087098819539944), uint256(6823156926536106727211996037990600635880723678662763049433352589002818584507)]);
        vk.delta2 = Pairing.G2Point([uint256(21131993516117054942569106655035587825788843702704301511158526362872884784116), uint256(4563043842049098552850136666568273988832996296920389379505577595693544259568)], [uint256(3570826058827854346381647723900253117753453289519085845364132931732768847505), uint256(19372220472979130396886100690619011691715531050192178183882046590162061368929)]);
        vk.IC[0] = Pairing.G1Point(uint256(14469129430383942798035242135421434180301277401435568257731495223699548135917), uint256(1287086376599761997903899524541074941973487541526867555849405242061122525881));
        vk.IC[1] = Pairing.G1Point(uint256(18353481165312837187457334066813918307628289754237624051367031408982070630358), uint256(5908403956023139490892534156029873661700625309669248595955896166770130203032));
        vk.IC[2] = Pairing.G1Point(uint256(20103457434129224282735934384007600345451174005884285306662818458107242507906), uint256(12641448023900740712429692204897306186018437287894232114100111346586905576784));
        vk.IC[3] = Pairing.G1Point(uint256(8007945727343385169339033917690385073973846582518005988332620912861917457653), uint256(2009093678637092142063241445625653767609707839278294241983921176771214866909));
        vk.IC[4] = Pairing.G1Point(uint256(9875646208396619040727585586313498687379199423474681290994554633663818471507), uint256(20498508768348275125640983188952635919105695405716450137074185466019341978474));
        vk.IC[5] = Pairing.G1Point(uint256(10150150528377505845685735934712075392901497581966633722149452918473148841659), uint256(6172621226130457985288952463021834461419827968543217642261216269172692090));
        vk.IC[6] = Pairing.G1Point(uint256(2685645033246011230147700537072066418719240550228919292933985939097698476702), uint256(19627982390029124401698740901162511010058428934390631216733013021000880418635));

    }

    /*
     * @returns Whether the proof is valid given the hardcoded verifying key
     *          above and the public inputs
     */
    function verifyProof(
        bytes memory proof,
        uint256[6] memory input
    ) public view returns (bool) {
        uint256[8] memory p = abi.decode(proof, (uint256[8]));
        for (uint8 i = 0; i < p.length; i++) {
            // Make sure that each element in the proof is less than the prime q
            require(p[i] < PRIME_Q, "verifier-proof-element-gte-prime-q");
        }
        Pairing.G1Point memory proofA = Pairing.G1Point(p[0], p[1]);
        Pairing.G2Point memory proofB = Pairing.G2Point([p[2], p[3]], [p[4], p[5]]);
        Pairing.G1Point memory proofC = Pairing.G1Point(p[6], p[7]);

        VerifyingKey memory vk = verifyingKey();
        // Compute the linear combination vkX
        Pairing.G1Point memory vkX = vk.IC[0];
        for (uint256 i = 0; i < input.length; i++) {
            // Make sure that every input is less than the snark scalar field
            require(input[i] < SNARK_SCALAR_FIELD, "verifier-input-gte-snark-scalar-field");
            vkX = Pairing.plus(vkX, Pairing.scalarMul(vk.IC[i + 1], input[i]));
        }

        return Pairing.pairing(
            Pairing.negate(proofA),
            proofB,
            vk.alfa1,
            vk.beta2,
            vkX,
            vk.gamma2,
            proofC,
            vk.delta2
        );
    }
}

