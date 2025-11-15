import { getStorage, ref, type FirebaseStorage, type StorageReference } from 'firebase/storage'

import { getFirebaseApp } from './app'

let storageInstance: FirebaseStorage | null = null

const getStorageInstance = (): FirebaseStorage => {
  if (storageInstance) {
    return storageInstance
  }

  storageInstance = getStorage(getFirebaseApp())
  return storageInstance
}

export const createStorageRef = (path: string): StorageReference => {
  return ref(getStorageInstance(), path)
}

export const storage = {
  getStorage: getStorageInstance,
  createRef: createStorageRef,
}


