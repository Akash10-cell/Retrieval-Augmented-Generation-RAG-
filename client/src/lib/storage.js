const STORAGE_PREFIX = 'second_brain_data_';

function getStorageKey(email) {
  return `${STORAGE_PREFIX}${email.toLowerCase()}`;
}

function readUserData(email) {
  try {
    return JSON.parse(localStorage.getItem(getStorageKey(email)) || '{"documents":[],"conversations":[]}');
  } catch {
    return { documents: [], conversations: [] };
  }
}

function writeUserData(email, data) {
  localStorage.setItem(getStorageKey(email), JSON.stringify(data));
}

export function getUserData(email) {
  return readUserData(email);
}

export function saveRagResult(email, { fileName, fileSize, fileType, storageId, question, result }) {
  const data = readUserData(email);
  const timestamp = new Date().toISOString();
  const documentId = `${fileName}-${timestamp}`;
  const document = {
    id: documentId,
    storageId,
    title: fileName,
    type: fileType,
    status: 'Processed',
    size: fileSize,
    pages: 'RAG indexed',
    summary: result.answer,
    uploadedAt: timestamp,
  };
  const conversation = {
    id: `${documentId}-conversation`,
    documentId,
    fileName,
    question,
    answer: result.answer,
    citations: result.citations || [],
    createdAt: timestamp,
  };

  writeUserData(email, {
    documents: [document, ...data.documents],
    conversations: [conversation, ...data.conversations],
  });

  return { document, conversation };
}

export function deleteUserDocument(email, documentId) {
  const data = readUserData(email);
  writeUserData(email, {
    documents: data.documents.filter((document) => document.id !== documentId),
    conversations: data.conversations.filter((conversation) => conversation.documentId !== documentId),
  });
}

export function addConversation(email, { documentId, fileName, question, result }) {
  const data = readUserData(email);
  const conversation = {
    id: `${documentId}-conversation-${Date.now()}`,
    documentId,
    fileName,
    question,
    answer: result.answer,
    citations: result.citations || [],
    createdAt: new Date().toISOString(),
  };

  writeUserData(email, {
    documents: data.documents,
    conversations: [conversation, ...data.conversations],
  });

  return conversation;
}