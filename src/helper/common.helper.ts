const scopedId = new Map<string, number>();
export const generateId = (name: string): string => {
    const counter = scopedId.get(name) ?? 0;
    scopedId.set(name, counter + 1);
    return `${name}_${counter}`;
}
