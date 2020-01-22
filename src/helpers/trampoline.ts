export const trampoline = (fn: Function) => (...args: any) => {
    let result = fn(...args);
    const checkComplete = () => result.some((fn: Function | []) => typeof fn === 'function');

    while (result.length && checkComplete()) {
        result = result.reduce(
            (acc: [], fn: Function | []) => (typeof fn === 'function' ? [...acc, ...fn()] : acc),
            [],
        );
    }

    return result;
};
