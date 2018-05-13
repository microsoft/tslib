export function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}