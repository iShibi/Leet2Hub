import { type Signal, signal } from '@preact/signals';
import { createContext } from 'preact';

export interface AppStateContextType {
	savedGithubPat: Signal<string | undefined>;
	savedGithubUsername: Signal<string | undefined>;
	savedGithubRepoFullname: Signal<string | undefined>;
}

export const AppState = createContext<AppStateContextType>({} as AppStateContextType);

export function createOptionsState(
	githubPat: string | undefined,
	githubUsername: string | undefined,
	githubRepoFullname: string | undefined,
) {
	const savedGithubPat = signal(githubPat);
	const savedGithubUsername = signal(githubUsername);
	const savedGithubRepoFullname = signal(githubRepoFullname);
	return { savedGithubPat, savedGithubUsername, savedGithubRepoFullname };
}
