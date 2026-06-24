function decodeGraphqlId(id) {
    if (!id) return 0;
    const strId = String(id);
    const parsed = parseInt(strId);
    if (!isNaN(parsed) && String(parsed) === strId) return parsed;
    try {
        const decoded = atob(strId).split(':')[1];
        if (decoded) return decoded; // wait, my TS code does parseInt(decoded)
        return parseInt(decoded);
    } catch {
        return parseInt(strId) || 0;
    }
}
console.log(decodeGraphqlId("0965a042-9158-484e-948f-463653546392"));
