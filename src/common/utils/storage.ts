export enum LocalStorageKey {
    appStore = '__app_store',

}

export function saveStorage(key: LocalStorageKey, value: any) {
    console.log('save storage');
}