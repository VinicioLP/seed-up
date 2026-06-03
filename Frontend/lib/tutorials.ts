import { apiFetch } from '@/lib/api';

export type Tutorial = {
  id: string;
  databaseId?: number;
  title: string;
  category: string;
  level: string;
  duration: string;
  views: string;
  description: string;
  image: string;
  intro: string;
  materials: string[];
  steps: string[];
  tips: string[];
  isSaved?: boolean;
};

export type TutorialInput = {
  title: string;
  category: string;
  level: string;
  duration: string;
  description: string;
  image: string;
  intro: string;
  materials: string[];
  steps: string[];
  tips: string[];
};

type TutorialListResponse = {
  tutorials?: Tutorial[];
};

type TutorialResponse = {
  tutorial?: Tutorial;
};

async function parseApiError(response: Response, fallback: string) {
  const errorBody = (await response.json().catch(() => null)) as {
    message?: string;
    errors?: Record<string, string[]>;
  } | null;

  const firstValidationMessage = errorBody?.errors
    ? Object.values(errorBody.errors).flat()[0]
    : null;

  return firstValidationMessage ?? errorBody?.message ?? fallback;
}

export async function fetchTutorials() {
  const response = await apiFetch('/api/tutorials');

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Nao foi possivel carregar os tutoriais.'));
  }

  const data = (await response.json()) as TutorialListResponse;

  return data.tutorials ?? [];
}

export async function fetchSavedTutorials() {
  const response = await apiFetch('/api/tutorials/saved');

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Nao foi possivel carregar os tutoriais salvos.'));
  }

  const data = (await response.json()) as TutorialListResponse;

  return data.tutorials ?? [];
}

export async function fetchTutorial(id: string) {
  const response = await apiFetch(`/api/tutorials/${encodeURIComponent(id)}`);

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Nao foi possivel carregar este tutorial.'));
  }

  const data = (await response.json()) as TutorialResponse;

  if (!data.tutorial) {
    throw new Error('Tutorial nao encontrado.');
  }

  return data.tutorial;
}

export async function createTutorial(payload: TutorialInput) {
  const response = await apiFetch('/api/tutorials', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Nao foi possivel salvar o tutorial.'));
  }

  const data = (await response.json()) as TutorialResponse;

  if (!data.tutorial) {
    throw new Error('A API nao retornou o tutorial cadastrado.');
  }

  return data.tutorial;
}

export async function saveTutorial(id: string) {
  const response = await apiFetch(`/api/tutorials/${encodeURIComponent(id)}/save`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Nao foi possivel salvar este tutorial.'));
  }

  const data = (await response.json()) as TutorialResponse;

  if (!data.tutorial) {
    throw new Error('A API nao retornou o tutorial atualizado.');
  }

  return data.tutorial;
}

export async function unsaveTutorial(id: string) {
  const response = await apiFetch(`/api/tutorials/${encodeURIComponent(id)}/save`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Nao foi possivel remover este tutorial dos salvos.'));
  }

  const data = (await response.json()) as TutorialResponse;

  if (!data.tutorial) {
    throw new Error('A API nao retornou o tutorial atualizado.');
  }

  return data.tutorial;
}
