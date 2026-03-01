import type { ApiGitHubSearchResponse, ApiGithubUser, LeetCodeSubmitRequestBody, SuportedLang } from './types';

export async function fetchGithubUserDetails(githubPat: string): Promise<ApiGithubUser | null> {
	const res = await fetch('https://api.github.com/user', {
		method: 'GET',
		headers: {
			Accept: 'application/vnd.github+json',
			'X-GitHub-Api-Version': '2022-11-28',
			Authorization: `Bearer ${githubPat}`,
		},
	});
	const data = (await res.json()) as ApiGithubUser;
	if (data.login) {
		return data;
	}
	return null;
}

export async function fetchRepos(
	githubPat: string,
	githubUsername: string,
	query: string,
): Promise<ApiGitHubSearchResponse['items'] | null> {
	const encodedQuery = encodeURIComponent(`${query} in:name user:${githubUsername}`);
	const res = await fetch(`https://api.github.com/search/repositories?q=${encodedQuery}`, {
		method: 'GET',
		headers: {
			Accept: 'application/vnd.github+json',
			'X-GitHub-Api-Version': '2022-11-28',
			Authorization: `Bearer ${githubPat}`,
		},
	});
	if (!res.ok) throw new Error(`API Error: ${await res.text()}`);
	const data = (await res.json()) as ApiGitHubSearchResponse;
	return data.items;
}

// @ts-expect-error wrong type
export function parseRequestBody(requestBody: chrome.webRequest.WebRequestBody) {
	if (!requestBody || !requestBody.raw || !requestBody.raw.length || !requestBody.raw[0].bytes) return null;
	// Convert raw request body buffer to string
	const decodedString = new TextDecoder('utf-8').decode(new Uint8Array(requestBody.raw[0].bytes));
	try {
		return JSON.parse(decodedString) as LeetCodeSubmitRequestBody;
	} catch (e) {
		console.error('Failed to parse request body as JSON:', e);
		return null;
	}
}

export function getLangExtension(lang: SuportedLang): string {
	const langExtension = SUPPORTED_LANG_EXTENSIONS[lang];
	if (langExtension) return langExtension;
	throw new Error('Unsupported Language Found');
}

export const SUPPORTED_LANG_EXTENSIONS = {
	cpp: 'cpp',
	java: 'java',
	python: 'py',
	python3: 'py',
	c: 'c',
	csharp: 'cs',
	javascript: 'js',
	typescript: 'ts',
	php: 'php',
	swift: 'swift',
	kotlin: 'kt',
	dart: 'dart',
	golang: 'go',
	ruby: 'rb',
	scala: 'scala',
	rust: 'rs',
	racket: 'rkt',
	erlang: 'erl',
	elixir: 'ex',
};
