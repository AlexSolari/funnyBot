import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "fs";
import { dirname } from 'path';
import ActionState from "../entities/actionState.js";
import TransactionResult from "../entities/transactionResult.js";

class Storage {
    constructor() {
        /** @type {Map<string, Record<number, ActionState>>} */
        this.cache = new Map();
    }

    async #load(key) {
        if (!this.cache.has(key)) {
            const targetPath = this.#buidPathFromKey(key);
            if (!existsSync(targetPath)) {
                return {};
            }

            const fileContent = await readFile(targetPath, 'utf8');

            if (fileContent) {
                const data = JSON.parse(fileContent);
                
                this.cache.set(key, data);
            }

        }

        return this.cache.get(key) ?? {};
    }

    async #save(data, key) {
        this.cache.delete(key);

        const targetPath = this.#buidPathFromKey(key);
        const folderName = dirname(targetPath);

        if (!existsSync(folderName)) {
            await mkdir(folderName, { recursive: true });
        }

        await writeFile(targetPath, JSON.stringify(data), { flag: 'w+' });
    }

    /** * @param {string} key */
    #buidPathFromKey(key) {
        return 'storage/' + key.replaceAll(':', '/') + ".json";
    }

    /**
     * 
     * @param {{key: string}} entity 
     * @param {number} chatId 
     * @param {(state: ActionState) => Promise<TransactionResult>} transaction 
     */
    async transactionForEntity(entity, chatId, transaction)
    {
        const entityData = await this.#load(entity.key);
        const chatData = entityData[chatId] ?? new ActionState();

        const result = await transaction(chatData);

        if (result.shouldUpdate) {
            entityData[chatId] = result.data;
            await this.#save(entityData, entity.key);
        }
    }
}

export default new Storage();