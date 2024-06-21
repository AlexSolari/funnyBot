const { readFileSync, writeFileSync, mkdirSync, existsSync } = require("fs");
const path = require('path');

class Storage {
    constructor() {
        this.cache = {};
    }

    load(key) {
        if (!this.cache[key]) {
            const targetPath = this._buidPathFromKey(key);
            if (!existsSync(targetPath)) {
                return null;
            }

            const data = JSON.parse(readFileSync(targetPath));

            this.cache[key] = data;
        }

        return this.cache[key];
    }

    save(data, key) {
        delete this.cache[key];

        const targetPath = this._buidPathFromKey(key);
        const dirname = path.dirname(targetPath);
        if (!existsSync(dirname)) {
            mkdirSync(dirname, { recursive: true });
        }
        writeFileSync(targetPath, JSON.stringify(data), { flag: 'w+' });
    }

    _buidPathFromKey(key) {
        return 'storage/' + key.replace(new RegExp(':', 'g'), '/') + ".json";
    }
}

module.exports = new Storage();