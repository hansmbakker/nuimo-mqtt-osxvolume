declare module "osx-vol" {
    
    /**
     * Returns the current volume level.
     * @return A promise that resolves to current volume level (a number between 0 and 1).
     */
    export function get(): Promise<number>;
    
    /**
     * Set the volume level.
     *
     * @param level A number between 0 and 1.
     * seconds.
     * @return A promise promise that resolves nothing.
     */
    export function set(level: number): Promise<void>;
}