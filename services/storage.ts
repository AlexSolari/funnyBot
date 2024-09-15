import { existsSync } from "fs";
import { dirname } from 'path';
import TransactionResult from "../entities/transactionResult";
import { ActionStateBase, IActionState } from "../entities/states/actionStateBase";
import { mkdir, readFile, writeFile } from "fs/promises";

class Storage {
    cache: Map<string, Record<number, ActionStateBase>>;

    constructor() {
        this.cache = new Map<string, Record<number, ActionStateBase>>();
    }

    async load(key: string) {
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

    async #save(data: Record<number, ActionStateBase>, key: string) {
        this.cache.delete(key);

        const targetPath = this.#buidPathFromKey(key);
        const folderName = dirname(targetPath);

        if (!existsSync(folderName)) {
            await mkdir(folderName, { recursive: true });
        }

        await writeFile(targetPath, JSON.stringify(data), { flag: 'w+' });
    }

    #buidPathFromKey(key: string) {
        return 'storage/' + key.replaceAll(':', '/') + ".json";
    }

    async getActionState<TActionState extends IActionState>(entity: { key: string; stateConstructor: () => TActionState; }, chatId: number): Promise<TActionState> {
        const entityData = await this.load(entity.key);

        return entityData[chatId] as TActionState ?? entity.stateConstructor();
    }

    async commitTransactionForEntity(entity: { key: string; }, chatId: number, transactionResult: TransactionResult): Promise<void> {
        const entityData = await this.load(entity.key);

        if (transactionResult.shouldUpdate) {
            entityData[chatId] = transactionResult.data;
            await this.#save(entityData, entity.key);
        }
    }
}

export default new Storage();