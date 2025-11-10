import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import type { CollectionReference, FieldValue, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

type TimestampLike = Timestamp | Date | FieldValue | null | undefined;

export interface BaseEntity {
  id: string;
  createdAt?: TimestampLike;
  updatedAt?: TimestampLike;
  createdBy?: string;
}

export interface Question extends BaseEntity {
  sessionId: string;
  content: string;
  answer?: string;
  isResolved?: boolean;
  likes?: number;
}

export interface ChatMessage extends BaseEntity {
  sessionId: string;
  message: string;
  senderId: string;
  senderName: string;
}

export interface Material extends BaseEntity {
  sessionId: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
}

function sessionCollection<T extends BaseEntity>(sessionId: string, path: string) {
  return collection(db, `sessions/${sessionId}/${path}`) as CollectionReference<T>;
}

export async function fetchQuestions(sessionId: string) {
  const questionQuery = query(
    sessionCollection<Question>(sessionId, 'questions'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(questionQuery);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })) as Question[];
}

export async function createQuestion(sessionId: string, data: Omit<Question, 'id' | 'sessionId'>) {
  const docRef = await addDoc(sessionCollection<Question>(sessionId, 'questions'), {
    ...data,
    sessionId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
}

export async function updateQuestion(
  sessionId: string,
  questionId: string,
  updates: Partial<Question>
) {
  const questionRef = doc(db, `sessions/${sessionId}/questions/${questionId}`);
  await updateDoc(questionRef, { ...updates, updatedAt: serverTimestamp() });
}

export async function deleteQuestion(sessionId: string, questionId: string) {
  const questionRef = doc(db, `sessions/${sessionId}/questions/${questionId}`);
  await deleteDoc(questionRef);
}

export async function fetchChatMessages(sessionId: string) {
  const messageQuery = query(
    sessionCollection<ChatMessage>(sessionId, 'chat'),
    orderBy('createdAt', 'asc')
  );
  const snapshot = await getDocs(messageQuery);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })) as ChatMessage[];
}

export async function sendChatMessage(
  sessionId: string,
  message: Omit<ChatMessage, 'id' | 'sessionId' | 'createdAt' | 'updatedAt'>
) {
  const docRef = await addDoc(sessionCollection<ChatMessage>(sessionId, 'chat'), {
    ...message,
    sessionId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
}

export async function deleteChatMessage(sessionId: string, messageId: string) {
  const messageRef = doc(db, `sessions/${sessionId}/chat/${messageId}`);
  await deleteDoc(messageRef);
}

export async function fetchMaterials(sessionId: string) {
  const materialsQuery = query(sessionCollection<Material>(sessionId, 'materials'), orderBy('createdAt'));
  const snapshot = await getDocs(materialsQuery);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })) as Material[];
}

export async function createMaterial(
  sessionId: string,
  material: Omit<Material, 'id' | 'sessionId' | 'createdAt' | 'updatedAt'>
) {
  const docRef = await addDoc(sessionCollection<Material>(sessionId, 'materials'), {
    ...material,
    sessionId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
}

export async function updateMaterial(
  sessionId: string,
  materialId: string,
  updates: Partial<Material>
) {
  const materialRef = doc(db, `sessions/${sessionId}/materials/${materialId}`);
  await updateDoc(materialRef, { ...updates, updatedAt: serverTimestamp() });
}

export async function deleteMaterial(sessionId: string, materialId: string) {
  const materialRef = doc(db, `sessions/${sessionId}/materials/${materialId}`);
  await deleteDoc(materialRef);
}

export async function fetchSessionEntitiesByUser(
  collectionName: 'questions' | 'chat' | 'materials',
  userId: string
) {
  const collectionRef = collection(db, `sessions`);
  const sessionSnapshot = await getDocs(collectionRef);
  const results: Array<Question | ChatMessage | Material> = [];

  for (const sessionDoc of sessionSnapshot.docs) {
    const entitiesQuery = query(
      collection(db, `sessions/${sessionDoc.id}/${collectionName}`),
      where('createdBy', '==', userId)
    );
    const entitySnapshot = await getDocs(entitiesQuery);
    entitySnapshot.forEach((entityDoc) => {
      results.push({ id: entityDoc.id, ...entityDoc.data() } as Question | ChatMessage | Material);
    });
  }

  return results;
}
