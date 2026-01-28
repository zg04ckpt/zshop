import { BackupInfoDTO } from "../types/backup"
import { get, post } from "./config/axios";
import { endpoints } from "./config/endpoints"

export const getListSnapshots = async () => {
    return get<BackupInfoDTO[]>(endpoints.backup.getListSnapshots); 
}

export const createSnapshot = async (name: string) => {
    return post<string>(endpoints.backup.createSnapshot, {name});
}

export const deleteSnapshot = async (snapshotName: string) => {
    return post<string>(endpoints.backup.deleteSnapshot, { snapshotName });
}

export const applySnapshot = async (snapshotName: string) => {
    return post<string>(endpoints.backup.applySnapshot, { snapshotName });
}
