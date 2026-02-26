import { useContext, useEffect, useState } from 'preact/hooks';
import { EyeIcon, EyeSlashIcon } from '../icon';
import type { ApiGitHubRepository, ApiGitHubSearchResponse, LocalStorage } from '../types';
import { fetchGithubUserDetails, fetchRepos } from '../utils';
import { AppState } from './store';

const GITHUB_PAT_REGEX = /^github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59}$/;

export interface OptionsProps {
	focusElementId: string;
}

export function Options({ focusElementId }: OptionsProps) {
	useEffect(() => {
		if (focusElementId === 'none') return;
		const elementToFocus = document.getElementById(focusElementId);
		if (!elementToFocus) return;
		elementToFocus.focus();
	}, [focusElementId]);

	const { savedGithubPat, savedGithubUsername, savedGithubRepoFullname } = useContext(AppState);

	const [githubPat, setGithubPat] = useState<{ value: string; isDirty: boolean; isValid: boolean; isVisible: boolean }>(
		{
			value: savedGithubPat.value ?? '',
			isDirty: false,
			isValid: typeof savedGithubPat.value === 'string',
			isVisible: false,
		},
	);
	const [githubUsername, setGithubUsername] = useState(savedGithubUsername.value ?? '');
	const [query, setQuery] = useState<{ value: string; shouldFetch: boolean; isDirty: boolean; isValid: boolean }>({
		value: savedGithubRepoFullname.value ?? '',
		shouldFetch: false,
		isDirty: false,
		isValid: typeof savedGithubRepoFullname.value === 'string',
	});
	const [debouncedQuery, setDebouncedQuery] = useState('');
	const [searchResults, setSearchResults] = useState<{ items: ApiGitHubSearchResponse['items']; showItems: boolean }>({
		items: [],
		showItems: false,
	});

	useEffect(() => {
		if (!query.shouldFetch) return;
		const timer = setTimeout(() => {
			setDebouncedQuery(query.value);
		}, 500);

		return () => clearTimeout(timer);
	}, [query.shouldFetch, query.value]);

	useEffect(() => {
		const init = async () => {
			if (!githubPat.isValid || !githubUsername.length || !debouncedQuery.length) return;
			const repos = (await fetchRepos(githubPat.value, githubUsername, debouncedQuery)) ?? [];
			setSearchResults({ items: repos, showItems: true });
		};
		init();
	}, [githubPat.value, githubPat.isValid, githubUsername, debouncedQuery]);

	const saveGithubPat = async () => {
		const githubUserDetails = await fetchGithubUserDetails(githubPat.value);
		if (!githubUserDetails) {
			setGithubPat({ ...githubPat, isDirty: true, isValid: false });
			return console.log('Invalid Github PAT.');
		}
		setGithubPat({ ...githubPat, isDirty: false, isValid: true });
		savedGithubPat.value = githubPat.value;
		setGithubUsername(githubUserDetails.login);
		savedGithubUsername.value = githubUserDetails.login;
		chrome.storage.local.set<LocalStorage>({ githubPat: githubPat.value, githubUser: githubUserDetails });
	};

	const handleRepoSelection = (repo: ApiGitHubRepository) => {
		setSearchResults({ ...searchResults, showItems: false });
		setQuery({ value: repo.full_name, shouldFetch: false, isDirty: true, isValid: true });
	};

	const saveRepo = async () => {
		const githubRepo = searchResults.items.find(repo => repo.full_name === query.value);
		if (!githubRepo) return console.log('Selected repo is not valid.');
		setQuery({ ...query, isDirty: false });
		savedGithubRepoFullname.value = githubRepo.full_name;
		chrome.storage.local.set<LocalStorage>({ githubRepo });
	};

	return (
		<div class='px-4 md:px-0 pt-12 grid grid-cols-1 gap-y-15'>
			<h1 class='text-white text-2xl font-bold text-center py-4'>Leet2Hub Settings</h1>

			<div class='bg-slate-800 text-white mx-auto w-full md:w-3xl max-w-3xl py-4 px-4 gap-y-5 flex flex-col border border-gray-400/50 rounded-lg shadow-md'>
				<div class='flex flex-col gap-y-1'>
					<label for='githubPat'>GitHub PAT</label>
					<div class='flex flex-col'>
						<div class='flex flex-row'>
							<input
								type={githubPat.isVisible ? 'text' : 'password'}
								id='githubPat'
								placeholder='Enter GitHub PAT'
								autocomplete='off'
								spellcheck={false}
								pattern='^github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59}$'
								class='text-white w-full px-2 py-2 outline-none border border-gray-400/50 border-r-0 invalid:border-red-400/50 focus:border-blue-400 focus:invalid:border-red-400/50 bg-slate-800 rounded-l-lg'
								value={githubPat.value}
								onInput={e => {
									setGithubPat({
										value: e.currentTarget.value,
										isDirty: e.currentTarget.value !== (savedGithubPat.value ?? ''),
										isValid: typeof savedGithubPat.value === 'string' && e.currentTarget.value === savedGithubPat.value,
										isVisible: githubPat.isVisible,
									});
								}}
							/>
							<button
								type='button'
								onClick={() => setGithubPat({ ...githubPat, isVisible: !githubPat.isVisible })}
								class='w-fit border border-gray-400/50 border-l-0 rounded-r-lg px-2 bg-green-700 hover:cursor-pointer'
							>
								{githubPat.isVisible ? <EyeSlashIcon className='w-6 h-6' /> : <EyeIcon className='w-6 h-6' />}
							</button>
						</div>
						<span
							class={`text-xs text-red-400 w-fit pl-1 pt-1 ${githubPat.isValid || githubPat.value.length === 0 || GITHUB_PAT_REGEX.test(githubPat.value) ? 'invisible' : 'visible'}`}
						>
							Invalid GitHub PAT
						</span>
					</div>
					<button
						type='button'
						onClick={saveGithubPat}
						class={`w-fit px-2 rounded-md self-end py-1 bg-green-700 hover:cursor-pointer transition-all delay-300 ease-in-out -translate-y-3 ${GITHUB_PAT_REGEX.test(githubPat.value) && githubPat.isDirty ? 'visible' : 'invisible'}`}
					>
						Save
					</button>
				</div>

				<div class='flex flex-col gap-y-1'>
					<label for='githubRepoFullname'>GitHub Repository</label>
					<div
						class={`px-2 py-2 bg-slate-700 relative ${query.value.length > 0 && searchResults.showItems && githubPat.isValid ? 'rounded-t-lg' : 'rounded-lg'}`}
					>
						<input
							type='text'
							id='githubRepoFullname'
							placeholder='Search for Repository Name'
							autocomplete='off'
							spellcheck={false}
							disabled={!githubPat.isValid}
							title={githubPat.isValid ? '' : 'Require GitHub PAT value to be saved.'}
							class='text-white w-full px-2 py-2 outline-none border border-gray-400/50 focus:border-blue-400 bg-slate-800 rounded-lg disabled:bg-gray-500 disabled:hover:cursor-not-allowed transition-[background-color] delay-150 ease-in-out'
							value={query.value}
							onInput={e =>
								setQuery({
									value: e.currentTarget.value,
									shouldFetch: true,
									isDirty: e.currentTarget.value !== (savedGithubRepoFullname.value ?? ''),
									isValid:
										typeof savedGithubRepoFullname.value === 'string' &&
										e.currentTarget.value === savedGithubRepoFullname.value,
								})
							}
						/>
						{query.value.length > 0 && searchResults.showItems && githubPat.isValid && (
							<div
								tabindex={-1}
								class='flex flex-col gap-y-1 absolute z-10 top-full w-full left-0 bg-slate-700 px-2 py-2 rounded-b-lg overflow-scroll max-h-56'
							>
								{searchResults.items.map(repo => {
									return (
										<button
											type='button'
											key={repo.full_name}
											onClick={_ => handleRepoSelection(repo)}
											class='text-white text-start w-full px-2 py-2 rounded-lg bg-slate-900 hover:cursor-pointer hover:bg-blue-400'
										>
											{repo.full_name}
										</button>
									);
								})}
							</div>
						)}
					</div>
					<button
						type='button'
						onClick={saveRepo}
						class={`w-fit px-2 rounded-md self-end mt-2 py-1 bg-green-700 hover:cursor-pointer transition-all delay-300 ease-in-out ${query.isDirty && query.isValid ? 'visible' : 'invisible'}`}
					>
						Save
					</button>
				</div>
			</div>
		</div>
	);
}
