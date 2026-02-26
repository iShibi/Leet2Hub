import { render } from 'preact';
import type { LocalStorage } from '../types';
import { Popup } from './Popup';

const { githubUser, githubRepo } = await chrome.storage.local.get<LocalStorage>(['githubUser', 'githubRepo']);

render(
	<Popup
		githubUserFullname={githubUser?.name}
		githubUsername={githubUser?.login}
		githubUserUrl={githubUser?.html_url}
		githubUserAvatarUrl={githubUser?.avatar_url}
		githubRepoFullname={githubRepo?.full_name}
		githubRepoUrl={githubRepo?.html_url}
	/>,
	// biome-ignore lint/style/noNonNullAssertion: this is always non-null
	document.getElementById('root')!,
);
