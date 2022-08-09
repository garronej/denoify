export function toPosix(potentiallyWin32Path: string): string {
    return potentiallyWin32Path.replace(/\\/g, "/");
}
