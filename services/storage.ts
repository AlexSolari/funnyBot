import { existsSync } from "fs";
import { dirname } from 'path';
import TransactionResult from "../entities/transactionResult";
import { mkdir, readFile, writeFile } from "fs/promises";
import ActionStateBase from "../entities/states/actionStateBase";
import IActionState from "../types/actionState";
import IActionWithState from "../types/actionWithState";
import { Sema as Semaphore } from 'async-sema';

class Storage {
    static semaphore = new Semaphore(1);
    cache: Map<string, Record<number, ActionStateBase>>;

    get semaphoreInstance(){
        return Storage.semaphore;
    }

    constructor() {
        this.cache = new Map<string, Record<number, ActionStateBase>>();
    }

    async #lock<TType>(action: () => Promise<TType>) {
        await Storage.semaphore.acquire();

        try {
            return action();
        }
        finally {
            Storage.semaphore.release();
        }
    }

    async #loadInternal(key: string) {
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

    async load(key: string) {
        return await this.#lock(async () => {
            return this.#loadInternal(key);
        });
    }

    async getActionState<TActionState extends IActionState>(entity: IActionWithState, chatId: number): Promise<TActionState> {
        return await this.#lock(async () => {
            const data = await this.#loadInternal(entity.key);

            return data[chatId] as TActionState ?? entity.stateConstructor();
        });
    }

    async commitTransactionForAction(action: IActionWithState, chatId: number, transactionResult: TransactionResult): Promise<void> {
        await this.#lock(async () => {
            const data = await this.#loadInternal(action.key);

            if (transactionResult.shouldUpdate) {
                data[chatId] = transactionResult.data;
                await this.#save(data, action.key);
            }
        });
    }
}

export default new Storage();