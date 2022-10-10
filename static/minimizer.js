/*
MIT License

Copyright (c) 2018 Emanuele Volanti

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
Footer
© 2022 GitHub, Inc.
Footer navigation
Term
*/

class Bem {

    constructor(size, opts) {
        opts = opts || {};
        this.terms = [];
        this.allMinterms = [];
        this.termsSize = size;
        this.alpha = opts.alpha || ['x', 'y', 'z', 's', 't', 'v'];
        this.alpha = this.alpha.slice(0, size).reverse();
        this.name = opts.name;
    }


    push = (num, dc) => {
        const opts = {};
        if (dc === undefined) {
            this.allMinterms.push(num);
        } else if (dc === 'dc') {
            opts.dontCare = true;
        } else {
            throw new Error('Invalid input');
        }
        const term = new Termine(this, num, opts);
        this.terms.push(term);
    };

    pushDontCare = num => {
        this.push(num, 'dc');
    };

    // Operazione terminale
    min = () => {
        const newTerms = [];
        let lst = [];
        while (this.terms.length > 1) {
            const len = this.terms.length;
            for (let x = 0; x < len - 1; x++) {
                const current = this.terms[len - 1 - x];
                for (let y = 0; y < len - 1 - x; y++) {
                    const now = this.terms[y];
                    const ver = current.compatibile(now);
                    if (ver[0]) {
                        const el = current.clone();
                        current.touched = true;
                        now.touched = true;
                        el.ignore(ver[1]);
                        el.minterms = current.minterms.concat(now.minterms);
                        el.dontCare = false;
                        if (!el.isPresent(lst)) {
                            lst.push(el);
                        }
                    }
                }
            }
            this.terms.filter(x => !x.touched).forEach(el => {
                newTerms.push(el);
            });
            this.terms = lst;
            lst = [];
        }
        // Reduce ripetition in minterms
        this.terms = newTerms.concat(this.terms);
        this.terms.forEach(t => {
            t.minterms = t.minterms.filter((min, pos) => {
                return t.minterms.indexOf(min) === pos;
            });
        });
        // Build table
        const arr = [];
        this.terms.forEach(t => {
            t.minterms.forEach(n => {
                if (arr[n] === undefined) {
                    arr[n] = [t];
                } else {
                    arr[n].push(t);
                }
            });
        });
        // Find essential minterms
        const essential = new Set();
        const mints = this.allMinterms.slice(0);
        while (mints[0] !== undefined) {
            let lst = [];
            mints.forEach(n => {
                lst = arr[n].concat(lst);
            });
            const occurrence = lst.map(x => {
                return lst.reduce((a, b) => {
                    return a + (b === x);
                }, 0);
            });
            let max = 0;
            for (let x = 1; x < occurrence.length; x++) {
                if (occurrence[max] < occurrence[x]) {
                    max = x;
                }
            }
            essential.add(lst[max]);
            lst[max].minterms.forEach(m => {
                mints.splice(mints.indexOf(m), 1);
            });
        }
        this.terms = Array.from(essential);
    };

    toString = () => {
        const name = this.name === undefined ? '' : this.name + ' = ';
        if (this.terms.length === 0) {
            return name + 0;
        }
        const str = this.terms.map(x => x.toString()).join(' || ');
        return str === '' ? name + 1 : name + str;
    };
}

class Termine {

    constructor(su, num, opts) {
        opts = opts || {};
        const MASKCOMPLETA = (2 ** su.termsSize) - 1;
        this.su = su;
        this.num = num;
        this.mask = opts.mask || MASKCOMPLETA;
        this.touched = false;
        this.minterms = [];
        this.dontCare = opts.dontCare || false;
        if (!this.dontCare) {
            this.minterms = [num];
        }
    }

    ignore = n => {
        this.mask -= 2 ** n;
    };

    get = () => {
        return this.num & this.mask;
    };

    towMask = mask => {
        return this.get() & mask;
    };

    compatibile = t => {
        const pos = Math.log2(t.get() ^ this.get());
        if (t.mask === this.mask && Number.isInteger(pos)) {
            return [true, pos];
        }
        return [false];
    };

    clone = () => {
        const opts = {
            mask: this.mask,
            dontCare: this.dontCare
        };
        const t = new Termine(this.su, this.num, opts);
        t.minterms = this.minterms;
        return t;
    };

    toString = () => {
        let str = '';
        let mask = this.mask;
        let n = this.num;
        for (let x = 0; x < this.su.termsSize; x++) {
            if (mask & 1) {
                const alpha = this.su.alpha[x].split('').reverse().join('');
                const concat = n & 1 ? alpha : alpha + '!';
                str += " && " + concat;
            }
            n >>= 1;
            mask >>= 1;
        }
        str = str.substring(3, str.length);
        return str.split('').reverse().join('');
    };

    equalsTo = t => {
        return t.toString() === this.toString();
    };

    isPresent = arr => {
        for (let x = 0; x < arr.length; x++) {
            if (arr[x].equalsTo(this)) {
                return true;
            }
        }
        return false;
    };

    intersection = t => {
        if (this.towMask(t.mask) !== t.towMask(this.mask)) {
            return false;
        }
        const newMask = t.mask & this.mask;
        const newNum = t.get() | this.get();
        return new Termine(this.su, newNum, newMask);
    };
}

self.addEventListener("message", ({ data: { variables, toPush, toPushDc } = {} }) => {
    if (!variables || !Array.isArray(variables)) {
        throw new Error("variables is undefined or not an array");
    }
    if (!toPush || !Array.isArray(toPush)) {
        throw new Error("toPush is undefined or not an array");
    }

    const be = new Bem(variables.length, {
        alpha: variables,
    });

    for (let pushable of toPush) {
        be.push(pushable);
    }

    if (Array.isArray(toPushDc)) {
        for (let pushable of toPushDc) {
            be.push(pushable);
        }
    }
    be.min();
    self.postMessage({
        type: "result",
        result: be.toString(),
    });
});