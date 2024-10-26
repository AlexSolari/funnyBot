/* eslint-disable @typescript-eslint/no-unused-vars */
class Noop {
    static async true<T1>(arg1: T1) {
        return true;
    }
    static async false<T1>(arg1: T1) {
        return false;
    }
    static async call<T1, T2>(arg1: T1, arg2: T2): Promise<void>;
    static async call<T1>(arg1: T1) {}
}

export default Noop;
