export const trampoline = (fn: Function) => (...args: any) => {
    let result = fn(...args);

    while (result.length > 0) {
        result = result.reduce(
            (acc: [], fn: Function | []) => (typeof fn === 'function' ? [...acc, ...fn()] : acc),
            [],
        );
    }

    return result;
};
