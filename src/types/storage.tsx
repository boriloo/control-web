type TypeOfUpload = 'desktop' | 'file' | 'profile'

export type UploadStorageData = {
    file: File,
    typeOfUpload: TypeOfUpload,
    desktopId?: string,
}