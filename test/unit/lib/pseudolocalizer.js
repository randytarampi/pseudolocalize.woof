const expect = require("chai").expect;
const Pseudolocalizer = require("../../../lib/pseudolocalizer");

describe("pseudolocalizer", () => {
    describe("pseudolocalize", () => {
        it("should generate a bear by default", () => {
            const pseudolocalizer = new Pseudolocalizer();
            expect(pseudolocalizer.pseudolocalize("ᴥ")).to.equal("ʕつ•ᴥ•ʔつ");
        });
        it("should be configurable", () => {
            const pseudolocalizer = new Pseudolocalizer(2.5, "ʕつ", "ʔつ", " ", " ");
            expect(pseudolocalizer.pseudolocalize("• ᴥ •")).to.equal("ʕつ • ᴥ • ʔつ");
        });
        it("should throw on bad input", () => {
            const pseudolocalizer = new Pseudolocalizer(2.5, "ʕつ", "ʔつ", " ", " ");
            expect(() => {
                pseudolocalizer.pseudolocalize(it);
            }).to.throw(/should be of type "string", but is "function" instead/);
        });
        it("should throw on non-numerical relativeScale", () => {
            expect(() => {
                const pseudolocalizer = new Pseudolocalizer("woof", "ʕつ", "ʔつ", " ", " "); // eslint-disable-line no-unused-vars
            }).to.throw(/relativeScale should be greater than 0.5, but is "woof" instead/);
        });
        it("should throw on small relativeScale", () => {
            expect(() => {
                const pseudolocalizer = new Pseudolocalizer(0.49, "ʕつ", "ʔつ", " ", " "); // eslint-disable-line no-unused-vars
            }).to.throw(/relativeScale should be greater than 0.5, but is "0.49" instead/);
        });
        it("should respect the expansion factor", () => {
            const expansionFactor = 8;
            const pseudolocalizer = new Pseudolocalizer(expansionFactor);

            expect(pseudolocalizer.pseudolocalize("ᴥ")).to.equal("ʕつ•ᴥ•ʔつ");

            const requiredLength = " ᴥ ".length + "ʕつ".length + "ʔつ".length;
            expect(pseudolocalizer.pseudolocalize(" ᴥ ").length).to.equal(
                ~~((" ᴥ ".length * expansionFactor - requiredLength) / 2) * 2
                + requiredLength
            );
        });
        it("should truncate the input string and preserve the prefix, postfix, prePad and postPad if the input is small", () => {
            const pseudolocalizer = new Pseudolocalizer();
            expect(pseudolocalizer.pseudolocalize("ᴥ12")).to.equal("ʕつ•ᴥ•ʔつ");
            const smallPseudolocalizer = new Pseudolocalizer(1, "", "");
            expect(smallPseudolocalizer.pseudolocalize("ᴥᴥ")).to.equal("•ᴥ•");
        });
        it("should always show the prefix, postfix and the first characters of the input, prePad and postPad", () => {
            const pseudolocalizer = new Pseudolocalizer(1, "ᶘつ", "ᶅつ", " ", " ");
            expect(pseudolocalizer.pseudolocalize("◕ ᴥ ◕")).to.equal("ᶘつ ◕ ᶅつ");
        });
        it("should generate some serious pseudolocalizations", () => {
            const pseudolocalizer = new Pseudolocalizer(1.33, "\uFF62", "\uFF63", "\u00DF\u04DC\u06A3", "\u2B53\u4EB6\uACA1");
            expect(pseudolocalizer.pseudolocalize("ᴥ")).to.equal("｢ßᴥ⭓｣");
            expect(pseudolocalizer.pseudolocalize("hey")).to.equal("｢ßh⭓｣");
            expect(pseudolocalizer.pseudolocalize("This is a full sentence...")).to.equal("｢ßӜڣThis is a full sentence...⭓亶겡｣");
        });
    });

    describe("pseudolocalizeObject", () => {
        it("should pseudolocalize string properties on an input object", () => {
            const pseudolocalizer = new Pseudolocalizer();
            const testObject = {
                "woof": "ᴥ",
                "grr": " ᴥ ",
                "ruff": "  ᴥ  "
            };
            expect(pseudolocalizer.pseudolocalizeObject(testObject)).to.eql({
                "woof": "ʕつ•ᴥ•ʔつ",
                "grr": "ʕつ• •ʔつ",
                "ruff": "ʕつ• •ʔつ"
            });
        });
        it("should throw if it's passed a non object argument", () => {
            const pseudolocalizer = new Pseudolocalizer();
            const testObject = 1;
            expect(() => {
                pseudolocalizer.pseudolocalizeObject(testObject);
            }).to.throw(/should be of type "object", but is "number" instead/);
        });
        it("should throw if it encounters a non-string property on an input object", () => {
            const pseudolocalizer = new Pseudolocalizer();
            const testObject = {
                "woof": "ᴥ",
                "grr": " ᴥ ",
                "ruff": 1
            };
            expect(() => {
                pseudolocalizer.pseudolocalizeObject(testObject);
            }).to.throw(/should be of type "string", but is "number" instead/);
        });
        it("should not modify the input object", () => {
            const pseudolocalizer = new Pseudolocalizer();
            const testObject = {
                "woof": "ᴥ"
            };
            expect(pseudolocalizer.pseudolocalizeObject(testObject)).to.eql({
                "woof": "ʕつ•ᴥ•ʔつ"
            });
            expect(testObject).to.eql({
                "woof": "ᴥ"
            });
        });
        it("should only localize properties on the object, not on the prototype", () => {
            const pseudolocalizer = new Pseudolocalizer();
            const testObject = {
                "woof": {
                    "enumerable": true,
                    "configurable": true,
                    "writable": true,
                    "value": "ᴥ"
                }
            };

            function Woof() {
                this.grr = "ᴥ";
            }

            Woof.prototype.postPad = "•";
            Woof.prototype.postfix = "ʔつ";
            Woof.prototype.prePad = "•";
            Woof.prototype.prefix = "ʕつ";
            const pseudolocalizerForPseudolocalizing = Object.create(Woof.prototype, testObject);
            expect(pseudolocalizer.pseudolocalizeObject(pseudolocalizerForPseudolocalizing)).to.eql({
                "woof": "ʕつ•ᴥ•ʔつ"
            });
        });
    });

    describe("CJK", () => {
        it("should use CJK characters to build a pseudolocalization", () => {
            expect(Pseudolocalizer.CJK().pseudolocalize("woof")).to.equal("｟纬w纬｠");
        });
    });

    describe("LCG", () => {
        it("should use LCG characters to build a pseudolocalization", () => {
            expect(Pseudolocalizer.LCG().pseudolocalize("woof")).to.equal("«sws»");
        });
    });

    describe("AFB", () => {
        it("should use AFB characters to build a pseudolocalization", () => {
            expect(Pseudolocalizer.AFB().pseudolocalize("woof")).to.equal("『نwن』");
        });
    });

    describe("mix", () => {
        it("should use mixed characters to build a pseudolocalization", () => {
            expect(Pseudolocalizer.mix().pseudolocalize("woof")).to.equal("｢ßw⭓｣");
        });
    });
});
