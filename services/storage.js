const { readFile, writeFile, mkdir } = require("fs").promises;
const { existsSync } = require("fs");
const path = require('path');

class Storage {
    constructor() {
        this.cache = new Map();
    }

    async load(key) {
        if (!this.cache.has(key)) {
            const targetPath = this._buidPathFromKey(key);
            if (!existsSync(targetPath)) {
                return null;
            }

            const fileContent = await readFile(targetPath, 'utf8');

            if (fileContent) {
                const data = JSON.parse(fileContent);
                
                this.cache.set(key, data);
            }

        }

        return this.cache.get(key);
    }

    async save(data, key) {
        this.cache.delete(key);

        const targetPath = this._buidPathFromKey(key);
        const dirname = path.dirname(targetPath);

        if (!existsSync(dirname)) {
            await mkdir(dirname, { recursive: true });
        }

        await writeFile(targetPath, JSON.stringify(data), { flag: 'w+' });
    }

    _buidPathFromKey(key) {
        return 'storage/' + key.replace(new RegExp(':', 'g'), '/') + ".json";
    }
}

module.exports = new Storage();