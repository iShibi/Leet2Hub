import type { ApiGitHubContent, BodyParams, LocalStorage, SuportedLang } from './types';
import { getLangExtension, parseRequestBody } from './utils';

console.log('[BACKGROUND] Leet2Hub Browser Extension.');

interface MutationEventMsg {
	action: 'accepted';
}

// Listen for outgoing GraphQL requests
chrome.webRequest.onBeforeRequest.addListener(
	// @ts-expect-error TS warns not to use async function but it works during runtime
	async details => {
		if (details.method === 'POST' && details.url.includes('/submit')) {
			if (!details.requestBody) throw Error('Request body not found.');
			const requestBody = parseRequestBody(details.requestBody);
			if (requestBody) {
				const { lang, typed_code } = requestBody;
				const problemName = await getProblemName();
				chrome.storage.local.set<LocalStorage>({ submission: { lang, problemName, typedCode: typed_code } });
			}
		} else if (details.method === 'GET' && details.url.includes('/check')) {
			// https://leetcode.com/submissions/detail/123/check/ --> ['', 'submissions', 'detail', '123', 'check', '']
			const submissionId = new URL(details.url).pathname.split('/')[3];
			chrome.storage.local.set<LocalStorage>({ submissionId });
		}
		return {}; // Allow the request to proceed as normal
	},
	{ urls: ['https://leetcode.com/*'] },
	['requestBody'], // Needed to access the request body
);

chrome.runtime.onMessage.addListener(async (message: MutationEventMsg) => {
	if (message.action === 'accepted') {
		const { submission } = await chrome.storage.local.get<LocalStorage>('submission');
		const { submissionId } = await chrome.storage.local.get<LocalStorage>('submissionId');
		const currentSubmissionId = await getSubmissionId();
		chrome.storage.local.remove(['submission', 'submissionId']);
		if (submission && submissionId === currentSubmissionId) {
			uploadToGitHub(submission.lang, submission.problemName, submission.typedCode);
		}
	}
});

async function getShaOfExistingFile(url: string, githubPat: string) {
	const res = await fetch(url, {
		method: 'GET',
		headers: {
			Accept: 'application/vnd.github+json',
			'X-GitHub-Api-Version': '2022-11-28',
			Authorization: `Bearer ${githubPat}`,
			'Content-Type': 'application/json',
		},
	});
	if (res.status === 200) {
		const data: ApiGitHubContent = await res.json();
		return data.sha;
	}
	return null;
}

async function uploadToGitHub(lang: SuportedLang, problemName: string, typedCode: string) {
	const body: BodyParams = {
		message: `feat: add ${lang} solution for ${problemName}`,
		content: btoa(typedCode),
	};
	const filePath = `${problemName}/${problemName}.${getLangExtension(lang)}`;
	const { githubPat, githubRepo } = await chrome.storage.local.get<LocalStorage>(['githubPat', 'githubRepo']);
	if (!githubPat) return console.log('Unable to get GitHub PAT.');
	if (!githubRepo) return console.log('Unable to get GitHub repo.');
	const url = githubRepo.contents_url.replace('{+path}', filePath);
	const res = await fetch(url, {
		method: 'PUT',
		headers: {
			Accept: 'application/vnd.github+json',
			'X-GitHub-Api-Version': '2022-11-28',
			Authorization: `Bearer ${githubPat}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});
	// Check if file path already exists
	if (res.status === 422) {
		const sha = await getShaOfExistingFile(url, githubPat);
		if (sha) {
			body.sha = sha;
			body.message = `feat: update ${lang} solution for ${problemName}`;
		} else {
			return console.log('Unable to get SHA of the existing file.');
		}
		const res = await fetch(url, {
			method: 'PUT',
			headers: {
				Accept: 'application/vnd.github+json',
				'X-GitHub-Api-Version': '2022-11-28',
				Authorization: `Bearer ${githubPat}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});
		const data = await res.json();
		console.log(data);
	} else {
		const data = await res.json();
		console.log(data);
	}
}

async function getProblemName() {
	const queryOptions = { active: true, lastFocusedWindow: true };
	const [tab] = await chrome.tabs.query(queryOptions);
	if (!tab.url) throw Error('Tab URL not found.');
	// https://leetcode.com/problems/two-sum/submissions/123/ --> ['', 'problems', 'two-sum', 'submissions', '123', '']
	const problemName = new URL(tab.url).pathname.split('/')[2];
	return problemName;
}

async function getSubmissionId() {
	const queryOptions = { active: true, lastFocusedWindow: true };
	const [tab] = await chrome.tabs.query(queryOptions);
	if (!tab.url) throw Error('Tab URL not found.');
	// https://leetcode.com/problems/two-sum/submissions/123/ --> ['', 'problems', 'two-sum', 'submissions', '123', '']
	const submissionId = new URL(tab.url).pathname.split('/')[4];
	return submissionId;
}
