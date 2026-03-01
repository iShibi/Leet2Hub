import { render } from 'preact';
import type { LocalStorage } from '../types';
import { Options } from './Options';
import { AppState, createOptionsState } from './store';

const { githubPat, githubUser, githubRepo } = await chrome.storage.local.get<LocalStorage>([
	'githubPat',
	'githubUser',
	'githubRepo',
]);

const params = new URLSearchParams(window.location.search);
const focusElementId = params.get('focus') ?? 'none';

render(
	<AppState.Provider value={createOptionsState(githubPat, githubUser?.login, githubRepo?.full_name)}>
		<Options focusElementId={focusElementId} />
	</AppState.Provider>,
	// biome-ignore lint/style/noNonNullAssertion: this is always non-null
	document.getElementById('root')!,
);
